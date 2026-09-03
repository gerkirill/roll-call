export type ChangelogSection = {
  title: string;
  items: string[];
};

export type ChangelogRelease = {
  version: string;
  date: string;
  sections: ChangelogSection[];
};

const RELEASE_HEADING = /^## \[([^\]]+)]\s+[—-]\s+(\d{4}-\d{2}-\d{2})$/;
const SECTION_HEADING = /^###\s+(.+)$/;
const LIST_ITEM = /^-\s+(.+)$/;
const VERSION = /^\d+\.\d+\.\d+$/;

export function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let currentRelease: ChangelogRelease | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const releaseMatch = RELEASE_HEADING.exec(line);
    if (releaseMatch) {
      currentRelease = {
        version: releaseMatch[1],
        date: releaseMatch[2],
        sections: [],
      };
      releases.push(currentRelease);
      currentSection = null;
      continue;
    }

    const sectionMatch = SECTION_HEADING.exec(line);
    if (sectionMatch && currentRelease) {
      currentSection = { title: sectionMatch[1], items: [] };
      currentRelease.sections.push(currentSection);
      continue;
    }

    const itemMatch = LIST_ITEM.exec(line);
    if (itemMatch && currentSection) {
      currentSection.items.push(itemMatch[1]);
    }
  }

  return releases;
}

export function compareVersions(left: string, right: string): number {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);

  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return 0;
}

export function validateChangelog(markdown: string): ChangelogRelease[] {
  const releases = parseChangelog(markdown);
  if (!releases.length) throw new Error('CHANGELOG.md does not contain releases');

  const versions = new Set<string>();
  releases.forEach((release, index) => {
    if (!VERSION.test(release.version)) {
      throw new Error(`Invalid changelog version: ${release.version}`);
    }
    if (versions.has(release.version)) {
      throw new Error(`Duplicate changelog version: ${release.version}`);
    }
    versions.add(release.version);

    if (!release.sections.length || release.sections.some(section => !section.items.length)) {
      throw new Error(`Changelog release ${release.version} has an empty section`);
    }

    const previousRelease = releases[index - 1];
    if (previousRelease && compareVersions(previousRelease.version, release.version) <= 0) {
      throw new Error('Changelog releases must be ordered from newest to oldest');
    }
  });

  return releases;
}

export function getNewerReleases(
  releases: ChangelogRelease[],
  installedVersion: string,
): ChangelogRelease[] {
  return releases.filter(release => compareVersions(release.version, installedVersion) > 0);
}
