import { useEffect, useRef, useState } from "react";
import { Download, Upload, Share2, ClipboardPaste, Trash2, Info, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useImportExport } from "@/hooks/useImportExport";
import { useAppData } from "@/hooks/useAppData";
import { encodeShareString } from "@/utils/share";

/** execCommand fallback for contexts where Clipboard API is unavailable. */
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.readOnly = true;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

type Toast = { kind: 'success' | 'error'; message: string } | null;

export default function SettingsPage() {
  const { exportData, importData, importFromString, clearData } = useImportExport();
  const { data } = useAppData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  // Pre-encode share string on page load so it is ready before the user clicks.
  // This avoids the async gap that causes browsers (especially Safari) to drop
  // the "user gesture" context before clipboard.writeText is called.
  const shareStringRef = useRef<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    encodeShareString(data).then(s => { if (!cancelled) shareStringRef.current = s; });
    return () => { cancelled = true; };
  }, [data]);

  // Text-paste import state
  const [showPastePanel, setShowPastePanel] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [pasteError, setPasteError] = useState('');

  // Share fallback state (when all clipboard methods fail)
  const [shareFallback, setShareFallback] = useState<string | null>(null);

  const showToast = (kind: 'success' | 'error', message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 4000);
  };

  const formatMergeResult = (r: { soldiersAdded: number; soldiersUpdated: number; sessionsAdded: number }) => {
    const parts: string[] = [];
    if (r.soldiersAdded > 0) parts.push(`додано ${r.soldiersAdded} бійців`);
    if (r.soldiersUpdated > 0) parts.push(`оновлено ${r.soldiersUpdated}`);
    if (r.sessionsAdded > 0) parts.push(`додано ${r.sessionsAdded} переклички`);
    return parts.length > 0 ? parts.join(', ') : 'нічого нового';
  };

  // ── File import ────────────────────────────────────────────────────────────
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    if (result.status === 'ok') {
      showToast('success', `Імпорт завершено: ${formatMergeResult(result)}.`);
    } else {
      showToast('error', 'Помилка імпорту. Файл пошкоджений або має невірний формат.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Share / copy ───────────────────────────────────────────────────────────
  // IMPORTANT: no await before clipboard.writeText — every await between the
  // click event and the write causes Safari/Chrome to drop the user-gesture
  // context and reject the clipboard permission.
  const handleShare = async () => {
    const text = shareStringRef.current;
    if (!text) return;

    // 1. Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('success', 'Рядок скопійовано в буфер обміну.');
        return;
      } catch (e) {
        console.error('Clipboard API failed, trying execCommand', e);
      }
    }

    // 2. Legacy execCommand fallback
    if (legacyCopy(text)) {
      showToast('success', 'Рядок скопійовано в буфер обміну.');
      return;
    }

    // 3. Show the string in UI for manual copy
    setShareFallback(text);
  };

  // ── Paste import ───────────────────────────────────────────────────────────
  const handlePasteMerge = async () => {
    setPasteError('');
    const result = await importFromString(pasteValue);
    if (result.status === 'ok') {
      showToast('success', `Імпорт завершено: ${formatMergeResult(result)}.`);
      setPasteValue('');
      setShowPastePanel(false);
    } else {
      setPasteError('Не вдалося розпізнати рядок. Перевірте, чи він починається з «pk1:».');
    }
  };

  // ── Clear ──────────────────────────────────────────────────────────────────
  const handleClearConfirm = () => {
    clearData();
    setConfirmClear(false);
    showToast('success', 'Всі дані видалено.');
  };

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-6">
        <header className="py-2">
          <h1 className="text-2xl font-bold tracking-tight">Налаштування</h1>
        </header>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
              toast.kind === 'success'
                ? 'bg-primary text-primary-foreground'
                : 'bg-destructive text-destructive-foreground'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* ── Backup section ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            Резервне копіювання
          </h2>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

            {/* Export to file */}
            <button
              onClick={exportData}
              className="w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation border-b border-border"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Експортувати у файл</div>
                <div className="text-sm text-muted-foreground mt-0.5">Зберегти JSON-файл на пристрій</div>
              </div>
            </button>

            {/* Share as text */}
            {!shareFallback ? (
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation border-b border-border"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Поділитися текстом</div>
                  <div className="text-sm text-muted-foreground mt-0.5">Скопіювати рядок для вставки в месенджер</div>
                </div>
              </button>
            ) : (
              <div className="p-4 flex flex-col gap-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Скопіюйте рядок вручну</span>
                  <button
                    onClick={() => setShareFallback(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  readOnly
                  value={shareFallback}
                  rows={3}
                  onFocus={e => e.target.select()}
                  className="w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground px-1">
                  Виділіть текст вище та скопіюйте його (довге натискання → Копіювати).
                </p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Import from file */}
            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation border-b border-border"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Імпортувати з файлу</div>
                <div className="text-sm text-muted-foreground mt-0.5">Об'єднати з JSON-файлом резервної копії</div>
              </div>
            </button>

            {/* Import from text (paste panel) */}
            {!showPastePanel ? (
              <button
                onClick={() => { setShowPastePanel(true); setPasteError(''); }}
                className="w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <ClipboardPaste className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Вставити з тексту</div>
                  <div className="text-sm text-muted-foreground mt-0.5">Об'єднати з рядка pk1:…</div>
                </div>
              </button>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Вставте рядок pk1:…</span>
                  <button
                    onClick={() => { setShowPastePanel(false); setPasteValue(''); setPasteError(''); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  autoFocus
                  value={pasteValue}
                  onChange={e => { setPasteValue(e.target.value); setPasteError(''); }}
                  placeholder="pk1:H4sI…"
                  rows={3}
                  className="w-full px-3 py-2 text-xs font-mono bg-background border border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {pasteError && (
                  <p className="text-xs text-destructive px-1">{pasteError}</p>
                )}
                <button
                  onClick={handlePasteMerge}
                  disabled={!pasteValue.trim()}
                  className="h-11 bg-primary text-primary-foreground font-semibold rounded-xl active-elevate touch-manipulation disabled:opacity-50 disabled:pointer-events-none"
                >
                  Об'єднати
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Danger zone ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            Небезпечна зона
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-destructive">Видалити всі дані</div>
                  <div className="text-sm text-muted-foreground mt-0.5">Бійці та переклички будуть знищені</div>
                </div>
              </button>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                <p className="text-sm font-medium text-destructive">
                  Ви впевнені? Це незворотно — всі бійці та переклички будуть видалені.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 h-12 rounded-xl border border-border font-semibold text-sm active-elevate touch-manipulation"
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={handleClearConfirm}
                    className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm active-elevate touch-manipulation"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── About ── */}
        <section className="flex flex-col gap-3 mt-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            Про додаток
          </h2>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Info className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-lg mb-1">Перекличка</div>
              <div className="text-sm text-muted-foreground mb-3">Версія 1.0.0</div>
              <p className="text-sm leading-relaxed text-foreground">
                Швидкий та зручний інструмент для ведення переклички особового складу навчальної роти.
                Всі дані зберігаються виключно на вашому пристрої без використання інтернету.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
