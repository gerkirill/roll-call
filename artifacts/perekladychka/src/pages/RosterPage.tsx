import { useState } from "react";
import { Link } from "wouter";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Layout } from "@/components/Layout";
import { useRoster } from "@/hooks/useRoster";
import { Soldier } from "@/types";
import { getAccentIndex, setAccent, removeAccent, splitChars } from "@/utils/accent";
import { ClipboardPaste, Plus, User, Trash2, X, GripVertical } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type NewSoldier = Omit<Soldier, "id" | "updatedAt">;

const VOWEL_PATTERN = /^[аеєиіїоуюяёыэaeiou]$/iu;

function isVowel(char: string): boolean {
  return VOWEL_PATTERN.test(char);
}

export default function RosterPage() {
  const {
    soldiers,
    addSoldier,
    addSoldiers,
    updateSoldier,
    deleteSoldier,
    reorderSoldiers,
  } = useRoster();
  const [editingSoldier, setEditingSoldier] = useState<Soldier | null | "new">(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(false);

  const parsedSoldiers = parseRosterText(importText);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isReorderMode) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = soldiers.findIndex((s) => s.id === active.id);
    const newIndex = soldiers.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSoldiers(oldIndex, newIndex);
    }
  };

  const handleImportOpenChange = (open: boolean) => {
    setIsImportOpen(open);
    if (!open) setImportText("");
  };

  const handleImport = () => {
    if (parsedSoldiers.length === 0) return;
    addSoldiers(parsedSoldiers);
    handleImportOpenChange(false);
  };

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
        <header className="flex items-center justify-between py-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Особовий склад</h1>
            <p className="text-muted-foreground text-sm">{soldiers.length} військовослужбовців</p>
          </div>
          <button
            onClick={() => setEditingSoldier("new")}
            className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full active-elevate shadow-sm touch-manipulation"
            aria-label="Додати військовослужбовця"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {soldiers.length > 1 && (
          <button
            type="button"
            onClick={() => setIsReorderMode((enabled) => !enabled)}
            aria-pressed={isReorderMode}
            className={cn(
              "h-11 px-4 flex items-center justify-center gap-2 rounded-xl border font-semibold touch-manipulation active-elevate",
              isReorderMode
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            )}
          >
            <GripVertical className="w-4 h-4" />
            {isReorderMode ? "Завершити зміну порядку" : "Змінити порядок"}
          </button>
        )}

        <div
          className={cn(
            "flex flex-col gap-2 pb-20",
            isReorderMode && "select-none"
          )}
        >
          {soldiers.length === 0 ? (
            <div className="flex flex-col items-center text-center py-10 px-4">
              <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="font-semibold mb-1">Список порожній</div>
              <div className="text-sm text-muted-foreground max-w-xs mb-6">
                Додайте військовослужбовців вручну або вставте готовий список із тексту.
              </div>
              <div className="w-full max-w-sm flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  className="h-14 px-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl active-elevate touch-manipulation shadow-sm"
                >
                  <ClipboardPaste className="w-5 h-5" />
                  Імпортувати з тексту
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSoldier("new")}
                  className="h-14 px-4 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold rounded-xl active-elevate touch-manipulation"
                >
                  <Plus className="w-5 h-5" />
                  Додати вручну
                </button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={soldiers.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {soldiers.map((soldier) => (
                  <SortableRow
                    key={soldier.id}
                    soldier={soldier}
                    isReorderMode={isReorderMode}
                    onEdit={() => setEditingSoldier(soldier)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <Dialog.Root
        open={editingSoldier !== null}
        onOpenChange={(open) => !open && setEditingSoldier(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] bg-card border-t border-border rounded-t-3xl outline-none animate-in slide-in-from-bottom-full pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-3 mb-2" />
            <div className="px-5 py-4 max-w-md mx-auto w-full flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-xl font-bold">
                  {editingSoldier === "new" ? "Новий запис" : "Редагувати"}
                </Dialog.Title>
                <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>

              {editingSoldier && (
                <SoldierForm
                  initialData={editingSoldier === "new" ? undefined : editingSoldier}
                  onSave={(data) => {
                    if (editingSoldier === "new") {
                      addSoldier(data);
                    } else {
                      updateSoldier({ ...data, id: editingSoldier.id });
                    }
                    setEditingSoldier(null);
                  }}
                  onDelete={
                    editingSoldier !== "new"
                      ? () => {
                          if (confirm("Видалити військовослужбовця?")) {
                            deleteSoldier(editingSoldier.id);
                            setEditingSoldier(null);
                          }
                        }
                      : undefined
                  }
                />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isImportOpen} onOpenChange={handleImportOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto bg-card border-t border-border rounded-t-3xl outline-none animate-in slide-in-from-bottom-full pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-3 mb-2" />
            <div className="px-5 py-4 max-w-md mx-auto w-full flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <Dialog.Title className="text-xl font-bold">Імпорт особового складу</Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground mt-1">
                    Один військовослужбовець на кожному рядку.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground shrink-0 ml-3">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>

              <div className="space-y-2">
                <label htmlFor="roster-import" className="text-sm font-medium text-muted-foreground px-1">
                  Скопійований список
                </label>
                <textarea
                  id="roster-import"
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder={"ШЕВЧЕНКО тарас\nПЕТРЕНКО ІВАН ІВАНОВИЧ\nКОВАЛЕНКО а. б."}
                  rows={9}
                  autoFocus
                  className="w-full min-h-52 p-4 bg-background border border-input rounded-xl text-base resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground px-1">
                  Порожні рядки буде пропущено, зайві пробіли прибрано, регістр імен нормалізовано.
                </p>
              </div>

              <div className="flex items-center justify-between px-1 text-sm">
                <span className="text-muted-foreground">Буде імпортовано</span>
                <span className="font-semibold">{parsedSoldiers.length}</span>
              </div>

              <button
                type="button"
                onClick={handleImport}
                disabled={parsedSoldiers.length === 0}
                className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-xl active-elevate touch-manipulation shadow-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                Імпортувати {parsedSoldiers.length > 0 ? `(${parsedSoldiers.length})` : ""}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Layout>
  );
}

function SortableRow({
  soldier,
  isReorderMode,
  onEdit,
}: {
  soldier: Soldier;
  isReorderMode: boolean;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: soldier.id, disabled: !isReorderMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 bg-card border border-border rounded-xl touch-manipulation",
        isReorderMode && "select-none",
        isDragging && "opacity-50 shadow-lg z-10"
      )}
    >
      {isReorderMode && (
        <button
          type="button"
          className="flex items-center justify-center pl-3 pr-1 py-4 text-muted-foreground touch-none cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Перетягнути ${soldier.lastName}`}
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}

      <button
        type="button"
        onClick={onEdit}
        disabled={isReorderMode}
        className="flex items-center gap-3 flex-1 px-4 py-3 text-left active-elevate disabled:pointer-events-none"
      >
        <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold truncate leading-none mb-1">
            {soldier.lastName}
          </div>
          {soldier.firstName && (
            <div className="text-muted-foreground text-sm truncate">{soldier.firstName}</div>
          )}
        </div>
      </button>
    </div>
  );
}

function SoldierForm({
  initialData,
  onSave,
  onDelete,
}: {
  initialData?: Soldier;
  onSave: (data: Omit<Soldier, "id">) => void;
  onDelete?: () => void;
}) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");

  const capitalizeFirst = (s: string): string => {
    const clean = s.trimEnd();
    if (!clean) return clean;
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim()) return;
    const trimmedLastName = capitalizeFirst(lastName);
    const trimmedFirstName = firstName.trim() || undefined;
    onSave({ firstName: trimmedFirstName, lastName: trimmedLastName });
  };

  const chars = splitChars(lastName);
  const accentIdx = getAccentIndex(lastName);

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground px-1">
          Прізвище (з наголосом)
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Шевченко"
          className="w-full h-14 px-4 bg-background border border-input rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />

        {chars.length > 0 && (
          <div className="bg-secondary/30 rounded-xl p-3 border border-border">
            <div className="text-xs text-muted-foreground mb-2 px-1">Наголос:</div>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap items-center gap-0.5 flex-1 min-w-0">
                {chars.map((char, i) =>
                  isVowel(char) ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLastName(setAccent(lastName, i))}
                      aria-label={`Поставити наголос на літері ${char}`}
                      aria-pressed={accentIdx === i}
                      className={cn(
                        "min-w-9 h-10 px-1 rounded-lg text-lg font-bold flex items-center justify-center transition-colors border touch-manipulation",
                        accentIdx === i
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background border-border text-foreground active-elevate"
                      )}
                    >
                      {char}
                    </button>
                  ) : (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="min-w-7 h-10 px-0.5 text-lg font-bold flex items-center justify-center text-foreground/80"
                    >
                      {char}
                    </span>
                  )
                )}
              </div>
              {accentIdx >= 0 && (
                <button
                  type="button"
                  onClick={() => setLastName(removeAccent(lastName))}
                  aria-label="Скинути наголос"
                  className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors border bg-background border-border text-muted-foreground active-elevate"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground px-1">
          Ім'я або ініціали{" "}
          <span className="text-muted-foreground/60">(необов'язково)</span>
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Т. Г."
          className="w-full h-14 px-4 bg-background border border-input rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center w-14 shrink-0 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl touch-manipulation active-elevate"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          disabled={!lastName.trim()}
          className="flex-1 h-14 bg-primary text-primary-foreground font-bold rounded-xl active-elevate touch-manipulation shadow-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          Зберегти
        </button>
      </div>
    </form>
  );
}

function parseRosterText(text: string): NewSoldier[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .map((line) => {
      const [lastName, ...otherNames] = line.split(" ").map(normalizeNameToken);
      return {
        lastName,
        firstName: otherNames.length > 0 ? otherNames.join(" ") : undefined,
      };
    });
}

function normalizeNameToken(token: string): string {
  const lowerCased = token.toLocaleLowerCase("uk-UA");

  if (/^(?:\p{L}\.)+$/u.test(lowerCased)) {
    return lowerCased.replace(/\p{L}/gu, (letter) => letter.toLocaleUpperCase("uk-UA"));
  }

  return lowerCased.replace(/(^|[-–—])(\p{L})/gu, (_, separator: string, letter: string) => {
    return separator + letter.toLocaleUpperCase("uk-UA");
  });
}
