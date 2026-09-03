import { useCallback, useState } from 'react';
import { useLocation } from 'wouter';
import { Download, History, Info, Link2, ListChecks, RefreshCw } from 'lucide-react';
import { INSTALLED_VERSION } from '@/releaseInfo';
import type { ReleaseNotesState } from '@/pwaUpdate';
import { installPwa, usePwaInstall } from '@/pwaInstall';
import { ReleaseNotesDialog } from './ReleaseNotesDialog';
import { SettingsRow } from './SettingsRow';
import { ShareAppDialog } from './ShareAppDialog';

type AboutSectionProps = {
  updateAvailable: boolean;
  isUpdating: boolean;
  releaseNotes: ReleaseNotesState;
  onApplyUpdate: () => void;
  onLoadReleaseNotes: () => void;
  onShowToast: (kind: 'success' | 'error', message: string) => void;
};

function getAppUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

export function AboutSection({
  updateAvailable,
  isUpdating,
  releaseNotes,
  onApplyUpdate,
  onLoadReleaseNotes,
  onShowToast,
}: AboutSectionProps) {
  const [, setLocation] = useLocation();
  const installState = usePwaInstall();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const appUrl = getAppUrl();
  const isDevelopmentUrl = import.meta.env.DEV
    || (typeof window !== 'undefined' && window.location.hostname.endsWith('.replit.dev'));
  const closeShareDialog = useCallback(() => setShowShareDialog(false), []);
  const availableVersion = releaseNotes.status === 'ready' ? releaseNotes.latestVersion : null;

  const openReleaseNotes = () => {
    setShowReleaseNotes(true);
    onLoadReleaseNotes();
  };

  const handleInstallApp = () => {
    void installPwa().then(result => {
      if (result === 'accepted' || result === 'installed') {
        onShowToast('success', 'Застосунок встановлено.');
      } else if (result === 'dismissed') {
        onShowToast('error', 'Встановлення скасовано.');
      } else {
        onShowToast('error', 'Браузер не дозволяє встановити застосунок із цієї сторінки.');
      }
    });
  };

  const installRowTitle = installState.isInstalling
    ? 'Відкриття встановлення…'
    : installState.status === 'available'
      ? 'Встановити додаток'
      : 'Встановлення недоступне';

  const installRowSubtitle = installState.status === 'available'
    ? 'Встановити як PWA без пошуку команди в меню браузера'
    : 'Браузер поки не пропонує встановлення для цієї сторінки';

  return (
    <>
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-bold text-muted-foreground uppercase tracking-wider px-1'>Про додаток</h2>
        <div className='bg-card border border-border rounded-2xl p-4 shadow-sm flex items-start gap-4'>
          <div className='w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0'><Info className='w-6 h-6 text-primary-foreground' /></div>
          <div className='flex-1 min-w-0'>
            <div className='font-bold text-lg mb-1'>Перекличка</div>
            <div className='mb-3'>
              <div className='text-sm text-muted-foreground'>Версія {INSTALLED_VERSION}</div>
              {availableVersion && (
                <div aria-live='polite' className='mt-0.5 text-xs font-semibold text-primary'>
                  Доступна версія {availableVersion}
                </div>
              )}
              {updateAvailable && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={openReleaseNotes}
                    className='inline-flex h-9 items-center rounded-lg bg-secondary px-3 text-xs font-semibold active-elevate touch-manipulation'
                  >
                    Що нового
                  </button>
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
                </div>
              )}
            </div>
            <p className='text-sm leading-relaxed'>Швидкий інструмент для ведення переклички. Всі дані зберігаються виключно на вашому пристрої.</p>
          </div>
        </div>
        <div className='bg-card border border-border rounded-2xl overflow-hidden shadow-sm'>
          <SettingsRow
            icon={<ListChecks className='w-5 h-5' />}
            title='Можливості'
            subtitle='Короткий огляд функцій застосунку'
            onClick={() => setLocation('/features')}
          />
          <SettingsRow
            icon={<History className='w-5 h-5' />}
            title='Журнал змін'
            subtitle='Що нового в кожній версії'
            onClick={() => setLocation('/changelog')}
          />
          {installState.status !== 'installed' && (
            <SettingsRow
              icon={<Download className='w-5 h-5' />}
              title={installRowTitle}
              subtitle={installRowSubtitle}
              onClick={handleInstallApp}
              disabled={installState.status !== 'available' || installState.isInstalling}
            />
          )}
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

      <ReleaseNotesDialog
        open={showReleaseNotes}
        releaseNotes={releaseNotes}
        onOpenChange={setShowReleaseNotes}
        onRetry={onLoadReleaseNotes}
      />
    </>
  );
}
