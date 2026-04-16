"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DynamicListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addLabel?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function DynamicList<T>({
  items,
  onAdd,
  onRemove,
  renderItem,
  addLabel = "추가",
  emptyMessage = "항목을 추가하세요",
  disabled = false,
}: DynamicListProps<T>) {
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <div className="flex-1">{renderItem(item, i)}</div>
          {!disabled && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemove(i)}
              className="mt-1 shrink-0"
            >
              <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button variant="ghost" size="xs" onClick={onAdd}>
          <Plus className="size-3.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

interface StringListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function StringList({
  items,
  onChange,
  placeholder = "입력하세요",
  addLabel = "추가",
  emptyMessage = "항목을 추가하세요",
  disabled = false,
}: StringListProps) {
  return (
    <DynamicList
      items={items}
      onAdd={() => onChange([...items, ""])}
      onRemove={(i) => onChange(items.filter((_, idx) => idx !== i))}
      addLabel={addLabel}
      emptyMessage={emptyMessage}
      disabled={disabled}
      renderItem={(item, i) => (
        <input
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={item}
          onChange={(e) => {
            const next = [...items];
            next[i] = e.target.value;
            onChange(next);
          }}
          disabled={disabled}
        />
      )}
    />
  );
}
