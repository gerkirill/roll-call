import type { ChangelogRelease } from '@/lib/changelog';

type ChangelogReleaseCardProps = {
  release: ChangelogRelease;
};

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}

function FormattedText({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, index) => (
        index % 2 === 0
          ? part
          : <code key={`${part}-${index}`} className='rounded bg-secondary px-1 py-0.5 font-mono text-[0.9em] text-foreground'>{part}</code>
      ))}
    </>
  );
}

export function ChangelogReleaseCard({ release }: ChangelogReleaseCardProps) {
  return (
    <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-baseline justify-between gap-3'>
        <h2 className='text-lg font-bold'>Версія {release.version}</h2>
        <time dateTime={release.date} className='shrink-0 text-xs text-muted-foreground'>
          {formatDate(release.date)}
        </time>
      </div>

      <div className='mt-4 flex flex-col gap-4'>
        {release.sections.map(section => (
          <div key={section.title}>
            <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{section.title}</h3>
            <ul className='mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-primary'>
              {section.items.map(item => (
                <li key={item}><FormattedText text={item} /></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
