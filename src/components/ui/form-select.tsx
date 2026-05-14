"use client";

import { useId, type ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FormSelectProps = {
  /** Current value. Use the empty string (or undefined) to mean "no selection" — the placeholder shows. */
  value: string | undefined;
  /** Called with the new value when the user picks an option. */
  onValueChange: (value: string) => void;
  /** Options shown in the dropdown. Hoist this array to a module-level constant so the reference is stable across renders. */
  options: FormSelectOption[];
  /** Text shown in the trigger when value is empty or doesn't match any option. */
  placeholder?: string;
  /** Disables the trigger and the dropdown. */
  disabled?: boolean;
  /** Sets aria-invalid on the trigger; the base CSS renders a red border. */
  invalid?: boolean;
  /** "compact" = h-8 (use for tight contexts like pagination); "default" = h-10. */
  size?: "compact" | "default";
  /** Forwarded to the trigger. Intended for width utilities only (`w-full`, `w-[120px]`) — color, border, and focus styling are owned by the component. */
  className?: string;
  /** Label rendered above the trigger. Accepts JSX (e.g. for inline asterisks). When provided, FormSelect wraps the output in a `space-y-2` div and wires `htmlFor` ↔ trigger id. */
  label?: ReactNode;
  /** Per-page styling for the rendered label. Color/weight/size only — spacing is owned by the component. */
  labelClassName?: string;
  id?: string;
  name?: string;
  "aria-labelledby"?: string;
};

export const FormSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  invalid,
  size = "default",
  className,
  label,
  labelClassName,
  id,
  name,
  "aria-labelledby": ariaLabelledBy,
}: FormSelectProps) => {
  const triggerSize = size === "compact" ? "sm" : "default";
  const generatedId = useId();
  const triggerId = id ?? generatedId;

  const selectMarkup = (
    <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled} name={name}>
      <SelectTrigger
        id={triggerId}
        size={triggerSize}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid || undefined}
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (label === undefined) {
    return selectMarkup;
  }

  return (
    <div className="space-y-2">
      <label htmlFor={triggerId} className={labelClassName}>
        {label}
      </label>
      {selectMarkup}
    </div>
  );
};
