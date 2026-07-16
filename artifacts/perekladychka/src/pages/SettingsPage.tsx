import { useRef } from "react";
import { Download, Upload, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useImportExport } from "@/hooks/useImportExport";

export default function SettingsPage() {
  const { exportData, importData } = useImportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("Увага! Імпорт замінить всі поточні дані. Продовжити?")) {
      const result = await importData(file);
      if (result === 'ok') {
        alert("Дані успішно імпортовано");
      } else {
        alert("Помилка імпорту. Файл пошкоджений або має невірний формат.");
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-6">
        <header className="py-2">
          <h1 className="text-2xl font-bold tracking-tight">Налаштування</h1>
        </header>

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
                <div className="font-semibold text-destructive">Імпортувати дані</div>
                <div className="text-sm text-muted-foreground mt-0.5">Відновити з файлу (замінить поточні)</div>
              </div>
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3 mt-4">
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
