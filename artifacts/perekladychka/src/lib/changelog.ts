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
