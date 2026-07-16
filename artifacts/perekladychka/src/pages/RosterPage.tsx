import { useState, useState as useReactState } from "react";
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
import { Plus, User, Trash2, X, GripVertical } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export default function RosterPage() {
  const { soldiers, addSoldier, updateSoldier, deleteSoldier, reorderSoldiers } = useRoster();
  const [editingSoldier, setEditingSoldier] = useReactState<Soldier | null | "new">(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = soldiers.findIndex((s) => s.id === active.id);
    const newIndex = soldiers.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSoldiers(oldIndex, newIndex);
    }
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
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        <div className="flex flex-col gap-2 pb-20">
          {soldiers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Список порожній. Додайте військовослужбовців.
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
    </Layout>
  );
}

function SortableRow({
  soldier,
  onEdit,
}: {
  soldier: Soldier;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: soldier.id });

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
        isDragging && "opacity-50 shadow-lg z-10"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex items-center justify-center pl-3 pr-1 py-4 text-muted-foreground/50 touch-none cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Перетягнути"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Tap area to edit */}
      <button
        onClick={onEdit}
        className="flex items-center gap-3 flex-1 pr-4 py-3 text-left active-elevate"
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
            <div className="flex flex-wrap gap-2">
              {chars.map((char, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLastName(setAccent(lastName, i))}
                  className={cn(
                    "w-10 h-10 rounded-lg text-lg font-bold flex items-center justify-center transition-colors border",
                    accentIdx === i
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background border-border text-foreground hover:bg-secondary"
                  )}
                >
                  {char}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLastName(removeAccent(lastName))}
                className="w-auto px-3 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-colors border bg-background border-border text-foreground hover:bg-secondary ml-auto"
              >
                ✕ скинути
              </button>
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
