import { useRef, useState } from "react";
import { Download, Upload, Trash2, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useImportExport } from "@/hooks/useImportExport";

type Toast = { kind: 'success' | 'error'; message: string } | null;

export default function SettingsPage() {
  const { exportData, importData, clearData } = useImportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (kind: 'success' | 'error', message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importData(file);

    if (result.status === 'ok') {
      const parts: string[] = [];
      if (result.soldiersAdded > 0) parts.push(`додано ${result.soldiersAdded} бійців`);
      if (result.soldiersUpdated > 0) parts.push(`оновлено ${result.soldiersUpdated}`);
      if (result.sessionsAdded > 0) parts.push(`додано ${result.sessionsAdded} переклички`);
      const summary = parts.length > 0 ? parts.join(', ') : 'нічого нового';
      showToast('success', `Імпорт завершено: ${summary}.`);
    } else {
      showToast('error', 'Помилка імпорту. Файл пошкоджений або має невірний формат.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

        {/* Backup section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            Резервне копіювання
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={exportData}
              className="w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation border-b border-border"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Експортувати дані</div>
                <div className="text-sm text-muted-foreground mt-0.5">Зберегти файл на пристрій</div>
              </div>
            </button>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Імпортувати дані</div>
                <div className="text-sm text-muted-foreground mt-0.5">Об'єднати з файлом резервної копії</div>
              </div>
            </button>
          </div>
        </section>

        {/* Danger zone */}
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

        {/* About */}
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
