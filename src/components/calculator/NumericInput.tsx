import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from "react";

import { cn } from "@/components/ui/utils";

/**
 * Numeric text input that accepts digits and an optional single decimal point
 * ("123", "123.45", "0.5"). Rejects everything else.
 *
 * Uses `type="text"` instead of `type="number"` to avoid the native wheel /
 * arrow-key spinner behavior that silently mutates the value when focused
 * (e.g. scrolling over the field accidentally decrements it).
 *
 * The mobile decimal keypad is preserved via `inputMode="decimal"`.
 *
 * Default font-size is 16px on mobile (`text-base md:text-sm`) to prevent
 * iOS Safari's auto-zoom-on-focus behavior. Consumers can still override
 * the font-size via className — tailwind-merge wins the later utility.
 */
export type NumericInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "inputMode"
> & {
  value: string;
  onChange: (value: string) => void;
};

const NUMERIC_PATTERN = /^\d*\.?\d*$/;

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onChange, autoComplete = "off", className, ...rest }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (next === "" || NUMERIC_PATTERN.test(next)) onChange(next);
    };

    return (
      <input
        {...rest}
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete={autoComplete}
        value={value}
        onChange={handleChange}
        className={cn("text-base md:text-sm", className)}
      />
    );
  },
);

NumericInput.displayName = "NumericInput";
