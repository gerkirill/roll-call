import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Binary, Download, Upload, Share2, ClipboardPaste, Trash2, Info, X, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useImportExport } from '@/hooks/useImportExport';
import { useAppData } from '@/hooks/useAppData';
import { applyPwaUpdate, usePwaUpdate } from '@/pwaUpdate';
import { encodeShareString, type TextExportFormat } from '@/utils/share';

const TEXT_EXPORT_FORMAT_STORAGE_KEY = 'perekladychka-text-export-format';

type Toast = { kind: 'success' | 'error'; message: string } | null;
type ShareState =
  | { status: 'preparing' }
  | { status: 'ready'; text: string }
  | { status: 'error'; message: string };

type CopyResult = { ok: true } | { ok: false; message: string };

function errorText(error: unknown): string {
  if (error instanceof DOMException || error instanceof Error) {
    return error.message ? `${error.name}: ${error.message}` : error.name;
  }
  if (typeof error === 'string' && error.trim()) return error;
  return 'невідома помилка';
}

function getStoredTextExportFormat(): TextExportFormat {
  if (typeof window === 'undefined') return 'base64';
  try {
    return window.localStorage.getItem(TEXT_EXPORT_FORMAT_STORAGE_KEY) === 'base32768'
      ? 'base32768'
      : 'base64';
  } catch {
    return 'base64';
  }
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

function SettingsRow(props: {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  last?: boolean;
}) {
  const { icon, title, subtitle, onClick, disabled, destructive, last } = props;
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation disabled:opacity-60 disabled:pointer-events-none ${last ? '' : 'border-b border-border'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <div className={`font-semibold ${destructive ? 'text-destructive' : ''}`}>{title}</div>
        <div className='text-sm text-muted-foreground mt-0.5'>{subtitle}</div>
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { exportData, importData, importFromString, clearData } = useImportExport();
  const { data } = useAppData();
  const { updateAvailable, isUpdating } = usePwaUpdate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const preparationRunRef = useRef(0);

  const [toast, setToast] = useState<Toast>(null);
  const [shareState, setShareState] = useState<ShareState>({ status: 'preparing' });
  const [isSharingText, setIsSharingText] = useState(false);
  const [isSharingFile, setIsSharingFile] = useState(false);
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [textExportFormat, setTextExportFormat] = useState<TextExportFormat>(getStoredTextExportFormat);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((kind: 'success' | 'error', message: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast({ kind, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, kind === 'error' ? 8000 : 4000);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
  }, []);

  const changeTextExportFormat = useCallback((format: TextExportFormat) => {
    setTextExportFormat(format);
    try {
      window.localStorage.setItem(TEXT_EXPORT_FORMAT_STORAGE_KEY, format);
    } catch (error) {
      showToast('error', `Формат змінено, але не вдалося зберегти налаштування. ${errorText(error)}`);
    }
  }, [showToast]);

  const prepareShareString = useCallback(() => {
    const runId = ++preparationRunRef.current;
    setManualCopy(null);
    setShareState({ status: 'preparing' });

    void encodeShareString(data, textExportFormat).then(
      text => {
        if (runId === preparationRunRef.current) setShareState({ status: 'ready', text });
      },
      error => {
        if (runId !== preparationRunRef.current) return;
        const message = errorText(error);
        setShareState({ status: 'error', message });
        showToast('error', `Не вдалося підготувати текст для надсилання. ${message}`);
      },
    );
  }, [data, showToast, textExportFormat]);

  useEffect(() => {
    prepareShareString();
    return () => { preparationRunRef.current += 1; };
  }, [prepareShareString]);

  const copyFallback = useCallback((text: string, primaryError?: string) => {
    const result = legacyCopy(text);
    setIsSharingText(false);
    if (result.ok) {
      setManualCopy(null);
      showToast(
        'success',
        primaryError
          ? `Системне надсилання недоступне, тому текст скопійовано. ${primaryError}`
          : 'Текст скопійовано в буфер обміну.',
      );
      return;
    }

    setManualCopy(text);
    const details = [
      primaryError ? `системне надсилання: ${primaryError}` : null,
      `резервне копіювання: ${'message' in result ? result.message : 'невідома помилка'}`,
    ].filter(Boolean).join('; ');
    showToast('error', `Не вдалося автоматично передати текст (${details}). Рядок показано для ручного копіювання.`);
  }, [showToast]);

  const handleTextShare = () => {
    if (shareState.status === 'error') {
      showToast('error', `Повторюю підготовку. Попередня помилка: ${shareState.message}`);
      prepareShareString();
      return;
    }
    if (shareState.status !== 'ready' || isSharingText) return;

    const text = shareState.text;
    setIsSharingText(true);

    if (!window.isSecureContext) {
      copyFallback(text, 'сторінка відкрита без HTTPS');
      return;
    }
    if (typeof navigator.share !== 'function') {
      copyFallback(text, 'Web Share API недоступний у цьому браузері або WebView');
      return;
    }

    let promise: Promise<void>;
    try {
      promise = navigator.share({ text });
    } catch (error) {
      copyFallback(text, errorText(error));
      return;
    }

    void promise.then(
      () => {
        setIsSharingText(false);
        setManualCopy(null);
        showToast('success', 'Текст передано через системне меню надсилання.');
      },
      error => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setIsSharingText(false);
          return;
        }
        copyFallback(text, errorText(error));
      },
    );
  };

  const handleFileShare = async () => {
    if (isSharingFile) return;
    setIsSharingFile(true);

    try {
      const result = await exportData();
      if (result.status === 'shared') {
        showToast('success', 'JSON-файл передано через системне меню надсилання.');
      } else if (result.status === 'downloaded') {
        showToast('success', 'Системне надсилання файлів недоступне, тому JSON-файл завантажено.');
      } else if (result.status === 'error') {
        showToast('error', `Не вдалося експортувати JSON-файл. ${result.message}`);
      }
    } catch (error) {
      showToast('error', `Не вдалося експортувати JSON-файл. ${errorText(error)}`);
    } finally {
      setIsSharingFile(false);
    }
  };

  const textExportFormatLabel = textExportFormat === 'base32768' ? 'Base32768' : 'Base64';

  const shareTitle = isSharingText
    ? 'Відкриття меню…'
    : shareState.status === 'preparing'
      ? 'Підготовка тексту…'
      : shareState.status === 'error'
        ? 'Повторити підготовку'
        : 'Поділитися текстом';

  const shareSubtitle = shareState.status === 'preparing'
    ? `Готуємо текст у форматі ${textExportFormatLabel}`
    : shareState.status === 'error'
      ? <>Не вдалося підготувати рядок. Натисніть, щоб повторити.<br /><span className='text-xs text-destructive'>{shareState.message}</span></>
      : isSharingText
        ? 'Браузер відкриває системне меню надсилання'
        : `Надіслати через системне меню · ${textExportFormatLabel} · ${shareState.text.length.toLocaleString('uk-UA')} символів`;

  const formatMergeResult = (result: { soldiersAdded: number; soldiersUpdated: number; sessionsAdded: number }) => {
    const parts: string[] = [];
    if (result.soldiersAdded) parts.push(`додано ${result.soldiersAdded} бійців`);
    if (result.soldiersUpdated) parts.push(`оновлено ${result.soldiersUpdated}`);
    if (result.sessionsAdded) parts.push(`додано ${result.sessionsAdded} переклички`);
    return parts.length ? parts.join(', ') : 'нічого нового';
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    showToast(
      result.status === 'ok' ? 'success' : 'error',
      result.status === 'ok'
        ? `Імпорт завершено: ${formatMergeResult(result)}.`
        : 'Помилка імпорту. Файл пошкоджений або має невірний формат.',
    );
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteMerge = async () => {
    setPasteError('');
    const result = await importFromString(pasteValue);
    if (result.status !== 'ok') {
      setPasteError('Не вдалося розпізнати рядок. Перевірте, чи він починається з «pk1:» або «pk2:».');
      return;
    }
    showToast('success', `Імпорт завершено: ${formatMergeResult(result)}.`);
    setPasteValue('');
    setShowPaste(false);
  };

  return (
    <Layout>
      <div className='flex-1 p-4 md:p-6 flex flex-col gap-6'>
        <header className='py-2'><h1 className='text-2xl font-bold tracking-tight'>Налаштування</h1></header>

        {toast && (
          <div role='alert' aria-live={toast.kind === 'error' ? 'assertive' : 'polite'} className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg flex gap-3 ${toast.kind === 'success' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'}`}>
            <span className='flex-1 break-words'>{toast.message}</span>
            <button type='button' onClick={dismissToast} aria-label='Закрити повідомлення' className='w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-black/10'><X className='w-4 h-4' /></button>
          </div>
        )}

        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-bold text-muted-foreground uppercase tracking-wider px-1'>Про додаток</h2>
          <div className='bg-card border border-border rounded-2xl p-4 shadow-sm flex items-start gap-4'>
            <div className='w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0'><Info className='w-6 h-6 text-primary-foreground' /></div>
            <div className='flex-1 min-w-0'>
              <div className='font-bold text-lg mb-1'>Перекличка</div>
              <div className='flex items-center justify-between gap-3 mb-3'>
                <div className='min-w-0'>
                  <div className='text-sm text-muted-foreground'>Версія 1.0.10</div>
                  {updateAvailable && <div aria-live='polite' className='text-xs font-semibold text-primary mt-0.5'>Доступна нова версія</div>}
                </div>
                {updateAvailable && (
                  <button
                    type='button'
                    onClick={applyPwaUpdate}
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
        </section>

        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-bold text-muted-foreground uppercase tracking-wider px-1'>Резервне копіювання</h2>
          <div className='bg-card border border-border rounded-2xl overflow-hidden shadow-sm'>
            <SettingsRow
              icon={<Download className='w-5 h-5' />}
              title={isSharingFile ? 'Підготовка файлу…' : 'Поділитися файлом'}
              subtitle={isSharingFile ? 'Браузер готує JSON-файл' : 'Надіслати резервну копію у форматі JSON'}
              onClick={() => { void handleFileShare(); }}
              disabled={isSharingFile}
            />

            <input type='file' accept='.json' ref={fileInputRef} onChange={handleFileChange} className='hidden' />
            <SettingsRow icon={<Upload className='w-5 h-5' />} title='Імпортувати з файлу' subtitle='Додати дані з резервної копії до наявних' onClick={() => fileInputRef.current?.click()} />

            {!manualCopy ? (
              <SettingsRow
                icon={<Share2 className='w-5 h-5' />}
                title={shareTitle}
                subtitle={shareSubtitle}
                onClick={handleTextShare}
                disabled={shareState.status === 'preparing' || isSharingText}
              />
            ) : (
              <div className='p-4 flex flex-col gap-3 border-b border-border'>
                <div className='flex items-center justify-between gap-3'>
                  <span className='text-sm font-semibold text-destructive'>Автоматичне надсилання і копіювання не вдалося</span>
                  <button type='button' onClick={() => setManualCopy(null)} aria-label='Закрити ручне копіювання' className='w-7 h-7 flex items-center justify-center rounded-full bg-secondary'><X className='w-4 h-4' /></button>
                </div>
                <textarea autoFocus readOnly value={manualCopy} rows={3} onFocus={event => event.target.select()} className='w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring' />
                <p className='text-xs text-muted-foreground'>Натисніть на поле, виділіть весь текст і скористайтеся системною командою «Копіювати».</p>
                <button type='button' onClick={handleTextShare} disabled={isSharingText} className='h-11 bg-secondary font-semibold rounded-xl active-elevate disabled:opacity-50'>{isSharingText ? 'Повторна спроба…' : 'Спробувати ще раз'}</button>
              </div>
            )}

            {!showPaste ? (
              <SettingsRow icon={<ClipboardPaste className='w-5 h-5' />} title='Імпортувати з тексту' subtitle='Поєднати дані з тексту з наявними' onClick={() => { setShowPaste(true); setPasteError(''); }} last />
            ) : (
              <div className='p-4 flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-semibold'>Вставте рядок pk1:… або pk2:…</span>
                  <button type='button' onClick={() => { setShowPaste(false); setPasteValue(''); setPasteError(''); }} className='w-7 h-7 flex items-center justify-center rounded-full bg-secondary'><X className='w-4 h-4' /></button>
                </div>
                <textarea autoFocus value={pasteValue} onChange={event => { setPasteValue(event.target.value); setPasteError(''); }} placeholder='pk1:H4sI… або pk2:媒腻…' rows={3} className='w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring' />
                {pasteError && <p className='text-xs text-destructive'>{pasteError}</p>}
                <button type='button' onClick={handlePasteMerge} disabled={!pasteValue.trim()} className='h-11 bg-primary text-primary-foreground font-semibold rounded-xl active-elevate disabled:opacity-50'>Об’єднати</button>
              </div>
            )}
          </div>
        </section>

        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-bold text-muted-foreground uppercase tracking-wider px-1'>Небезпечна зона</h2>
          <div className='bg-card border border-border rounded-2xl overflow-hidden shadow-sm'>
            {!confirmClear ? (
              <SettingsRow icon={<Trash2 className='w-5 h-5' />} title='Видалити всі дані' subtitle='Бійці та переклички будуть видалені' onClick={() => setConfirmClear(true)} destructive last />
            ) : (
              <div className='p-4 flex flex-col gap-3'>
                <p className='text-sm font-medium text-destructive'>Ви впевнені? Це незворотно — всі бійці та переклички будуть видалені.</p>
                <div className='flex gap-3'>
                  <button type='button' onClick={() => setConfirmClear(false)} className='flex-1 h-12 rounded-xl border border-border font-semibold'>Скасувати</button>
                  <button type='button' onClick={() => { clearData(); setConfirmClear(false); showToast('success', 'Всі дані видалено.'); }} className='flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold'>Видалити</button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-bold text-muted-foreground uppercase tracking-wider px-1'>Текстовий експорт</h2>
          <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'><Binary className='w-5 h-5' /></div>
              <div>
                <div className='font-semibold'>Формат кодування</div>
                <p className='text-sm text-muted-foreground mt-0.5'>Впливає лише на новий текстовий експорт. Імпорт автоматично розпізнає обидва формати.</p>
              </div>
            </div>
            <div role='radiogroup' aria-label='Формат текстового експорту' className='grid grid-cols-2 gap-2 mt-4'>
              {(['base64', 'base32768'] as const).map(format => {
                const selected = textExportFormat === format;
                return (
                  <button
                    key={format}
                    type='button'
                    role='radio'
                    aria-checked={selected}
                    onClick={() => changeTextExportFormat(format)}
                    className={`h-11 rounded-xl border font-semibold active-elevate ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}
                  >
                    {format === 'base32768' ? 'Base32768' : 'Base64'}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
