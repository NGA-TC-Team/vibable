"use client";

import type { Key, ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedList, AnimatedListItem } from "@/components/editor/animated-list";

interface DynamicListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  /** prepend/삭제 시 리스트 안정화용 (예: 항목 id) */
  renderKey?: (item: T, index: number) => Key;
  addLabel?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function DynamicList<T>({
  items,
  onAdd,
  onRemove,
  renderItem,
  renderKey,
  addLabel = "추가",
  emptyMessage = "항목을 추가하세요",
  disabled = false,
}: DynamicListProps<T>) {
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
      <AnimatedList className="space-y-2">
        {items.map((item, i) => (
          <AnimatedListItem key={renderKey ? renderKey(item, i) : i}>
            <div className="flex items-center gap-2">
              <div className="flex-1">{renderItem(item, i)}</div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(i)}
                  className="shrink-0 self-center hover:border-destructive/40 hover:text-destructive"
                >
                  <Trash2 className="size-3.5 text-muted-foreground transition-colors group-hover/button:text-destructive" />
                </Button>
              )}
            </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>
      {!disabled && (
        <Button variant="outline" size="xs" onClick={onAdd}>
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
        <Input
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
