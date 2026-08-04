"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Plus, X, Languages } from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/app/admin/actions/categories";

type Category = {
  id: string;
  name: string;
  nameAz: string | null;
  nameRu: string | null;
  slug: string;
  _count?: { items: number };
};

type DialogState = {
  mode: "create" | "edit";
  id: string | null;
  name: string;
  nameAz: string;
  nameRu: string;
};

const emptyDialog: DialogState = {
  mode: "create",
  id: null,
  name: "",
  nameAz: "",
  nameRu: "",
};

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<DialogState | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(categories, oldIndex, newIndex);
    setCategories(next);
    startTransition(async () => {
      try {
        await reorderCategories({ ids: next.map((c) => c.id) });
      } catch {
        toast.error("Couldn't save new order");
        setCategories(categories);
      }
    });
  }

  function handleSave() {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;

    const payload = {
      name,
      nameAz: editing.nameAz.trim(),
      nameRu: editing.nameRu.trim(),
    };

    startTransition(async () => {
      try {
        if (editing.mode === "create") {
          const created = await createCategory(payload);
          setCategories((cs) => [
            ...cs,
            {
              ...created,
              nameAz: created.nameAz ?? null,
              nameRu: created.nameRu ?? null,
              _count: { items: 0 },
            },
          ]);
          toast.success(`Added "${created.name}"`);
        } else if (editing.id) {
          const updated = await updateCategory(editing.id, payload);
          setCategories((cs) =>
            cs.map((c) =>
              c.id === editing.id
                ? {
                    ...c,
                    name: updated.name,
                    nameAz: updated.nameAz ?? null,
                    nameRu: updated.nameRu ?? null,
                    slug: updated.slug,
                  }
                : c
            )
          );
          toast.success("Saved");
        }
        setEditing(null);
      } catch {
        toast.error("Couldn't save category");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its items? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteCategory(id);
        setCategories((cs) => cs.filter((c) => c.id !== id));
        toast.success(`Deleted "${name}"`);
      } catch {
        toast.error("Couldn't delete category");
      }
    });
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {categories.map((c) => (
              <SortableRow
                key={c.id}
                category={c}
                onEdit={() =>
                  setEditing({
                    mode: "edit",
                    id: c.id,
                    name: c.name,
                    nameAz: c.nameAz ?? "",
                    nameRu: c.nameRu ?? "",
                  })
                }
                onDelete={() => handleDelete(c.id, c.name)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </ul>

      {categories.length === 0 && (
        <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          No categories yet. Add your first one below.
        </div>
      )}

      <button
        type="button"
        onClick={() => setEditing({ ...emptyDialog })}
        className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition"
      >
        <Plus className="w-4 h-4" />
        Add category
      </button>

      {editing && (
        <EditCategoryDialog
          state={editing}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
          saving={isPending}
        />
      )}
    </div>
  );
}

function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const hasTranslations = !!(category.nameAz || category.nameRu);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-2xl bg-card border border-border p-3 shadow-card"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="touch-none p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <Link
        href={`/admin/categories/${category.id}`}
        className="flex-1 min-w-0 flex items-baseline gap-3"
      >
        <span className="text-base font-medium truncate">{category.name}</span>
        {hasTranslations && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
            <Languages className="w-3 h-3" />
            {category.nameAz ? "AZ" : ""} {category.nameRu ? "RU" : ""}
          </span>
        )}
        <span className="text-xs text-muted-foreground shrink-0 ml-auto">
          {category._count?.items ?? 0} items
        </span>
      </Link>

      <button
        type="button"
        onClick={onEdit}
        aria-label="Rename / translate"
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete"
        className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}

function EditCategoryDialog({
  state,
  onChange,
  onCancel,
  onSave,
  saving,
}: {
  state: DialogState;
  onChange: (s: DialogState) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-card-xl border border-border max-h-[92dvh] overflow-y-auto"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
          <h2 className="text-lg font-semibold">
            {state.mode === "create" ? "New category" : "Edit category"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Field label="English" required>
            <input
              autoFocus
              value={state.name}
              onChange={(e) => onChange({ ...state, name: e.target.value })}
              maxLength={60}
              className={inputCls}
              placeholder="Espresso"
            />
          </Field>
          <Field label="Azərbaycanca">
            <input
              value={state.nameAz}
              onChange={(e) => onChange({ ...state, nameAz: e.target.value })}
              maxLength={60}
              className={inputCls}
              placeholder="Espresso (Azərbaycanca)"
            />
          </Field>
          <Field label="Русский">
            <input
              value={state.nameRu}
              onChange={(e) => onChange({ ...state, nameRu: e.target.value })}
              maxLength={60}
              className={inputCls}
              placeholder="Эспрессо"
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Translations are optional — customers see the English name if a translation is empty.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 pt-0">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-4 rounded-full text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || state.name.trim().length === 0}
            className="h-11 px-6 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover"
          >
            {saving ? "Saving…" : state.mode === "create" ? "Add category" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-11 rounded-lg border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:border-ring";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
