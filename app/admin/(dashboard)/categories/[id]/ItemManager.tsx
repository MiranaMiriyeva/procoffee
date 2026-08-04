"use client";

import Image from "next/image";
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
import { GripVertical, Pencil, Trash2, Plus, ImageOff } from "lucide-react";
import { toast } from "sonner";
import {
  deleteItem,
  reorderItems,
  toggleAvailability,
} from "@/app/admin/actions/items";
import { formatPrice } from "@/lib/utils";
import ItemFormDialog, { type ItemFormValues } from "./ItemFormDialog";

export type UIItem = {
  id: string;
  title: string;
  titleAz: string | null;
  titleRu: string | null;
  subtitle: string | null;
  subtitleAz: string | null;
  subtitleRu: string | null;
  description: string | null;
  descriptionAz: string | null;
  descriptionRu: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  displayOrder: number;
  categoryId: string;
};

export default function ItemManager({
  categoryId,
  initial,
}: {
  categoryId: string;
  initial: UIItem[];
}) {
  const [items, setItems] = useState<UIItem[]>(initial);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UIItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    startTransition(async () => {
      try {
        await reorderItems(categoryId, { ids: next.map((i) => i.id) });
      } catch {
        toast.error("Couldn't save new order");
        setItems(items);
      }
    });
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: UIItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  function handleSaved(saved: UIItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved];
    });
    setDialogOpen(false);
  }

  function handleDelete(item: UIItem) {
    if (!confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteItem(item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.success(`Deleted "${item.title}"`);
      } catch {
        toast.error("Couldn't delete item");
      }
    });
  }

  function handleToggle(item: UIItem, next: boolean) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: next } : i)));
    startTransition(async () => {
      try {
        await toggleAvailability(item.id, next);
      } catch {
        toast.error("Couldn't update availability");
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: !next } : i)));
      }
    });
  }

  const initialFormValues: Partial<ItemFormValues> = editing
    ? {
        title: editing.title,
        titleAz: editing.titleAz ?? "",
        titleRu: editing.titleRu ?? "",
        subtitle: editing.subtitle ?? "",
        subtitleAz: editing.subtitleAz ?? "",
        subtitleRu: editing.subtitleRu ?? "",
        description: editing.description ?? "",
        descriptionAz: editing.descriptionAz ?? "",
        descriptionRu: editing.descriptionRu ?? "",
        price: editing.price,
        imageUrl: editing.imageUrl ?? "",
        available: editing.available,
      }
    : { available: true };

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ul className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  onEdit={() => openEdit(item)}
                  onDelete={() => handleDelete(item)}
                  onToggle={(v) => handleToggle(item, v)}
                  disabled={isPending}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}

      {items.length === 0 && (
        <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          No items yet. Add your first one below.
        </div>
      )}

      <button
        type="button"
        onClick={openCreate}
        className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition"
      >
        <Plus className="w-4 h-4" />
        Add item
      </button>

      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoryId={categoryId}
        editingId={editing?.id ?? null}
        initialValues={initialFormValues}
        onSaved={handleSaved}
      />
    </div>
  );
}

function SortableItemRow({
  item,
  onEdit,
  onDelete,
  onToggle,
  disabled,
}: {
  item: UIItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (v: boolean) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-2xl bg-card border border-border p-3 shadow-sm"
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

      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageOff className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-base font-medium truncate">{item.title}</p>
          {!item.available && (
            <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Sold out
            </span>
          )}
        </div>
        {item.subtitle && (
          <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
        )}
      </div>

      <span className="hidden sm:inline text-sm font-medium tabular-nums shrink-0">
        {formatPrice(item.price)}
      </span>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={item.available}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 accent-[var(--primary)]"
        />
        <span className="hidden sm:inline">Available</span>
      </label>

      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit"
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
