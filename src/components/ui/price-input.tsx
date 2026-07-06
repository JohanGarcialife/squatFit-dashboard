"use client";

import * as React from "react";
import { Input } from "./input";

interface PriceInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: string | number;
  onChange: (value: any) => void;
  valueType?: "string" | "number";
}

export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, valueType = "string", ...props }, ref) => {
    // Formatear el valor inicial / actual
    const getFormattedValue = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null || val === "") return "0.00";
      const num = typeof val === "number" ? val : parseFloat(val);
      if (isNaN(num)) return "0.00";
      return num.toFixed(2);
    };

    const formattedValue = getFormattedValue(value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Extraer solo los dígitos numéricos
      const digits = rawValue.replace(/\D/g, "");

      if (digits === "") {
        const resetVal = valueType === "number" ? 0 : "0.00";
        onChange(resetVal);
        return;
      }

      const numValue = parseFloat(digits) / 100;
      const finalFormatted = numValue.toFixed(2);

      onChange(valueType === "number" ? numValue : finalFormatted);
    };

    // Prevenir el tipeo de caracteres no numéricos o comas/puntos manuales 
    // para forzar la escritura desde el centavo
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Tab" ||
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Enter"
      ) {
        return;
      }
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={formattedValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    );
  }
);

PriceInput.displayName = "PriceInput";
