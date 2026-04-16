"use client";

import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Button } from "./button";
import { format } from "date-fns";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateInput({ value, onChange, placeholder, disabled }: DateInputProps) {
  const parsed = Date.parse(value);
  const dateValue = Number.isNaN(parsed) ? undefined : new Date(parsed);

  return (
    <div className="relative flex items-center">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "YYYY-MM-DD 또는 분기"}
        disabled={disabled}
        className="pr-9"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 size-7"
            disabled={disabled}
            type="button"
          >
            <CalendarIcon className="size-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
