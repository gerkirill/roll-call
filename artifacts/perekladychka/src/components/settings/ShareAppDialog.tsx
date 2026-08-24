import { useCallback, useEffect, useState } from 'react';
import { Copy, Share2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type CopyResult = { ok: true } | { ok: false; message: string };

type ShareAppDialogProps = {
  appUrl: string;
  isDevelopmentUrl: boolean;
  onClose: () => void;
  onShowToast: (kind: 'success' | 'error', message: string) => void;
};

function errorText(error: unknown): string {
  if (error instanceof DOMException || error instanceof Error) {
    return error.message ? `${error.name}: ${error.message}` : error.name;
  }
  if (typeof error === 'string' && error.trim()) return error;
  return 'невідома помилка';
}

function legacyCopy(text: string): CopyResult {
  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.readOnly = true;
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;font-size:16px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand('copy')
      ? { ok: true }
      : { ok: false, message: 'резервний метод повернув false' };
  } catch (error) {
    return { ok: false, message: errorText(error) };
  } finally {
    textarea?.remove();
  }
}

export function ShareAppDialog({ appUrl, isDevelopmentUrl, onClose, onShowToast }: ShareAppDialogProps) {
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const copyAppUrl = useCallback(async (shareError?: string): Promise<boolean> => {
    let clipboardError: string | null = null;

    if (window.isSecureContext && typeof navigator.clipboard?.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(appUrl);
        onShowToast(
          'success',
          shareError
            ? `Системне надсилання недоступне, тому посилання скопійовано. ${shareError}`
            : 'Посилання на додаток скопійовано.',
        );
        return true;
      } catch (error) {
        clipboardError = errorText(error);
      }
    } else {
      clipboardError = window.isSecureContext
        ? 'Clipboard API недоступний у цьому браузері або WebView'
        : 'сторінка відкрита без HTTPS';
    }

    const result = legacyCopy(appUrl);
    if (result.ok) {
      onShowToast(
        'success',
        shareError
          ? `Системне надсилання недоступне, тому посилання скопійовано. ${shareError}`
          : 'Посилання на додаток скопійовано.',
      );
      return true;
    }

    const details = [
      shareError ? `системне надсилання: ${shareError}` : null,
      clipboardError ? `копіювання: ${clipboardError}` : null,
      `резервне копіювання: ${'message' in result ? result.message : 'невідома помилка'}`,
    ].filter(Boolean).join('; ');
    onShowToast('error', `Не вдалося скопіювати посилання (${details}). Виділіть адресу в діалозі вручну.`);
    return false;
  }, [appUrl, onShowToast]);

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (!window.isSecureContext) {
        await copyAppUrl('сторінка відкрита без HTTPS');
        return;
      }
      if (typeof navigator.share !== 'function') {
        await copyAppUrl('Web Share API недоступний у цьому браузері або WebView');
        return;
      }

      await navigator.share({
        title: 'Перекличка',
        text: 'Перекличка — додаток для ведення переклички особового складу',
        url: appUrl,
      });
      onClose();
      onShowToast('success', 'Посилання передано через системне меню надсилання.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      await copyAppUrl(errorText(error));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-end justify-center pt-[calc(0.5rem+env(safe-area-inset-top))] md:items-center md:p-4'>
      <button
        type='button'
        aria-label='Закрити діалог поширення'
        onClick={onClose}
        className='absolute inset-0 bg-black/60'
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='share-app-title'
        className='relative flex max-h-[calc(100dvh-0.5rem-env(safe-area-inset-top))] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl md:max-h-[calc(100dvh-2rem)] md:rounded-3xl'
      >
        <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-4'>
          <div className='flex items-start justify-between gap-3'>
            <h3 id='share-app-title' className='text-lg font-bold'>Поділитися додатком</h3>
            <button
              type='button'
              onClick={onClose}
              aria-label='Закрити'
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary active-elevate'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          {isDevelopmentUrl && (
            <div className='mt-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm'>
              Це тестова адреса. У Replit вона може змінитися або перестати працювати після завершення development-сесії.
            </div>
          )}

          <div className='mt-4 rounded-xl border border-border bg-background p-3'>
            <a
              href={appUrl}
              target='_blank'
              rel='noreferrer'
              className='block break-all text-sm font-medium text-primary underline decoration-primary/40 underline-offset-2'
            >
              {appUrl}
            </a>
          </div>

          <div className='mt-2 grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={() => { void handleShare(); }}
              disabled={isSharing}
              className='inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-semibold active-elevate disabled:pointer-events-none disabled:opacity-60'
            >
              <Share2 className='h-5 w-5 shrink-0' />
              <span className='max-w-full truncate'>{isSharing ? 'Відкриття…' : 'Поділитися'}</span>
            </button>
            <button
              type='button'
              onClick={() => { void copyAppUrl(); }}
              className='inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-semibold active-elevate'
            >
              <Copy className='h-5 w-5 shrink-0' />
              <span className='max-w-full truncate'>Копіювати</span>
            </button>
          </div>

          <div className='mt-4 flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-black'>
            <QRCodeSVG
              value={appUrl}
              size={220}
              level='M'
              bgColor='#FFFFFF'
              fgColor='#000000'
              title='QR-код із посиланням на додаток «Перекличка»'
              className='h-auto max-w-full'
              style={{ width: 'min(220px, 50dvh)' }}
            />
            <p className='text-center text-xs text-black/70'>Відскануйте камерою іншого пристрою.</p>
          </div>
        </div>
      </div>
    </div>
  );
}