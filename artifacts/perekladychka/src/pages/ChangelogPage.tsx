import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import changelogMarkdown from '../../../../CHANGELOG.md?raw';
import { parseChangelog } from '@/lib/changelog';

const RELEASES = parseChangelog(changelogMarkdown);

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

export default function ChangelogPage() {
  const [, setLocation] = useLocation();

  return (
    <div className='flex min-h-[100dvh] flex-col bg-background'>
      <header className='sticky top-0 z-40 border-b border-border bg-card shadow-sm'>
        <div className='flex h-14 items-center gap-3 px-4'>
          <button
            type='button'
            onClick={() => setLocation('/settings')}
            aria-label='Повернутися до налаштувань'
            className='-ml-2 rounded-full p-2 text-muted-foreground active-elevate'
          >
            <ChevronLeft className='h-6 w-6' />
          </button>
          <h1 className='text-lg font-bold'>Журнал змін</h1>
        </div>
      </header>

      <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] md:p-6'>
        <div className='rounded-2xl border border-primary/20 bg-primary/10 p-4'>
          <h2 className='font-bold text-primary'>Що нового в «Перекличці»</h2>
          <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
            Нові версії показано першими. Тут зібрано додані можливості, зміни та виправлення.
          </p>
        </div>

        {RELEASES.map(release => (
          <section key={release.version} className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
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
        ))}
      </main>
    </div>
  );
}
