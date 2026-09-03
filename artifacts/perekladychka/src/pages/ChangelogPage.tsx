import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { ChangelogReleaseCard } from '@/components/changelog/ChangelogReleaseCard';
import { INSTALLED_RELEASES } from '@/releaseInfo';

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

        {INSTALLED_RELEASES.map(release => (
          <ChangelogReleaseCard key={release.version} release={release} />
        ))}
      </main>
    </div>
  );
}
