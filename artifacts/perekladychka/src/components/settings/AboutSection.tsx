import { useCallback, useState } from 'react';
import { Info, Link2, RefreshCw } from 'lucide-react';
import { SettingsRow } from './SettingsRow';
import { ShareAppDialog } from './ShareAppDialog';

type AboutSectionProps = {
  updateAvailable: boolean;
  isUpdating: boolean;
  onApplyUpdate: () => void;
  onShowToast: (kind: 'success' | 'error', message: string) => void;
};

function getAppUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

export function AboutSection({ updateAvailable, isUpdating, onApplyUpdate, onShowToast }: AboutSectionProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const appUrl = getAppUrl();
  const isDevelopmentUrl = import.meta.env.DEV
    || (typeof window !== 'undefined' && window.location.hostname.endsWith('.replit.dev'));
  const closeShareDialog = useCallback(() => setShowShareDialog(false), []);

  return (
    <>
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-bold text-muted-foreground uppercase tracking-wider px-1'>Про додаток</h2>
        <div className='bg-card border border-border rounded-2xl p-4 shadow-sm flex items-start gap-4'>
          <div className='w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0'><Info className='w-6 h-6 text-primary-foreground' /></div>
          <div className='flex-1 min-w-0'>
            <div className='font-bold text-lg mb-1'>Перекличка</div>
            <div className='flex items-center justify-between gap-3 mb-3'>
              <div className='min-w-0'>
                <div className='text-sm text-muted-foreground'>Версія 1.0.19</div>
                {updateAvailable && <div aria-live='polite' className='text-xs font-semibold text-primary mt-0.5'>Доступна нова версія</div>}
              </div>
              {updateAvailable && (
                <button
                  type='button'
                  onClick={onApplyUpdate}
                  disabled={isUpdating}
                  aria-label='Оновити застосунок до нової версії'
                  className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground active-elevate touch-manipulation disabled:opacity-60 disabled:pointer-events-none'
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                  {isUpdating ? 'Оновлення…' : 'Оновити'}
                </button>
              )}
            </div>
            <p className='text-sm leading-relaxed'>Швидкий інструмент для ведення переклички. Всі дані зберігаються виключно на вашому пристрої.</p>
          </div>
        </div>
        <div className='bg-card border border-border rounded-2xl overflow-hidden shadow-sm'>
          <SettingsRow
            icon={<Link2 className='w-5 h-5' />}
            title='Поділитися додатком'
            subtitle={<span className='block truncate'>{appUrl}</span>}
            onClick={() => setShowShareDialog(true)}
            last
          />
        </div>
      </section>

      {showShareDialog && (
        <ShareAppDialog
          appUrl={appUrl}
          isDevelopmentUrl={isDevelopmentUrl}
          onClose={closeShareDialog}
          onShowToast={onShowToast}
        />
      )}
    </>
  );
}
