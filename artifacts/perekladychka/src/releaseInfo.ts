import changelogMarkdown from '../../../CHANGELOG.md?raw';
import { validateChangelog } from '@/lib/changelog';

export const INSTALLED_RELEASES = validateChangelog(changelogMarkdown);
export const INSTALLED_VERSION = INSTALLED_RELEASES[0].version;
