"use client";
/* eslint-disable max-lines */

import { useState, useEffect, useMemo } from "react";

import { Calculator, TrendingUp, History, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIMC } from "@/hooks/use-imc";
import {
  calculateIMCLocal,
  getIMCCategory,
  IMCCategoryMap,
  type IMCCalculationResponse,
} from "@/lib/services/calculator-types";
import type { IMCHistoryRecord } from "@/lib/services/trainer-types";

import { IMCHistory } from "./imc-history";

// ============================================================================
// INTERFACES
// ============================================================================

interface IMCCalculatorProps {
  /**
   * Valor inicial del peso en kg
   */
  initialWeight?: number;
  /**
   * Valor inicial de la altura en cm
   */
  initialHeight?: number;
  /**
   * Callback cuando se calcula el IMC exitosamente
   */
  onCalculated?: (result: IMCCalculationResponse) => void;
  /**
   * Si es true, muestra el botón de historial
   */
  showHistory?: boolean;
  /**
   * Clase CSS adicional
   */
  className?: string;
  /**
   * Si es true, calcula automáticamente cuando cambian peso/altura
   */
  autoCalculate?: boolean;
  /**
   * Si es true, oculta el título y descripción (útil para integración en formularios)
   */
  compact?: boolean;
  /**
   * Valor actual del IMC para mostrar
   */
  currentIMC?: number | null;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function IMCCalculator({
  initialWeight,
  initialHeight,
  onCalculated,
  showHistory = false,
  className,
  autoCalculate = false,
  compact = false,
  currentIMC,
}: IMCCalculatorProps) {
  const { calculateIMCAsync, isCalculating, lastCalculation, resetCalculation } = useIMC({
    autoFetchHistory: false,
  });

  const [weight, setWeight] = useState<string>(initialWeight?.toString() ?? "");
  const [height, setHeight] = useState<string>(initialHeight?.toString() ?? "");
  const [localIMC, setLocalIMC] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sincronizar con valores iniciales cuando cambian
  useEffect(() => {
    if (initialWeight !== undefined) {
      setWeight(initialWeight.toString());
    }
  }, [initialWeight]);

  useEffect(() => {
    if (initialHeight !== undefined) {
      setHeight(initialHeight.toString());
    }
  }, [initialHeight]);

  // Sincronizar con IMC actual si se proporciona
  useEffect(() => {
    if (currentIMC !== undefined && currentIMC !== null) {
      setLocalIMC(currentIMC);
    }
  }, [currentIMC]);

  // Calcular IMC local para preview
  const calculatedIMC = useMemo(() => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (weightNum > 0 && heightNum > 0) {
      return calculateIMCLocal(weightNum, heightNum);
    }
    return null;
  }, [weight, height]);

  // Actualizar IMC local cuando cambia el cálculo
  useEffect(() => {
    if (calculatedIMC !== null && calculatedIMC !== localIMC && !lastCalculation) {
      setLocalIMC(calculatedIMC);
    }
  }, [calculatedIMC, localIMC, lastCalculation]);

  // Auto-calcular si está habilitado (deshabilitado por defecto para evitar demasiadas peticiones)
  useEffect(() => {
    if (autoCalculate && calculatedIMC !== null && calculatedIMC > 0 && !lastCalculation) {
      const timeoutId = setTimeout(() => {
        handleCalculate();
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timeoutId);
    }
  }, [autoCalculate, calculatedIMC]);

  // Obtener categoría del IMC calculado o del último cálculo del servidor
  const displayIMC = lastCalculation?.imc ?? calculatedIMC ?? currentIMC;
  const currentCategory = displayIMC ? getIMCCategory(displayIMC) : null;
  const categoryInfo = currentCategory ? IMCCategoryMap[currentCategory] : null;

  // Validar inputs
  const isValid = useMemo(() => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    return weightNum > 0 && heightNum > 0 && weightNum < 500 && heightNum < 300;
  }, [weight, height]);

  // Manejar cálculo
  const handleCalculate = async () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!isValid) {
      toast.error("Datos inválidos", {
        description: "Por favor, ingresa valores válidos para peso y altura",
      });
      return;
    }

    try {
      resetCalculation();
      const result = await calculateIMCAsync({
        weight: weightNum,
        height: heightNum,
      });

      setLocalIMC(result.imc);

      toast.success("IMC calculado exitosamente", {
        description: `Tu IMC es ${result.imc.toFixed(1)} - ${categoryInfo?.label ?? ""}`,
      });

      if (onCalculated) {
        onCalculated(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al calcular el IMC";
      toast.error("Error al calcular IMC", {
        description: errorMessage,
      });
    }
  };

  // Manejar cambio de peso/altura manual
  const handleWeightChange = (value: string) => {
    setWeight(value);
    if (lastCalculation) {
      resetCalculation();
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    if (lastCalculation) {
      resetCalculation();
    }
  };

  const cardContent = (
    <CardContent className="space-y-4">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="imc-weight">Peso (kg)</Label>
          <Input
            id="imc-weight"
            type="number"
            step="0.1"
            min="0"
            max="500"
            placeholder="70.5"
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            disabled={isCalculating}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imc-height">Altura (cm)</Label>
          <Input
            id="imc-height"
            type="number"
            step="0.1"
            min="0"
            max="300"
            placeholder="175"
            value={height}
            onChange={(e) => handleHeightChange(e.target.value)}
            disabled={isCalculating}
            className="h-10"
          />
        </div>
      </div>

      {/* Resultado del cálculo local (preview) */}
      {calculatedIMC !== null && calculatedIMC > 0 && !lastCalculation && (
        <div className="bg-muted/50 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">IMC Estimado:</span>
            <span className="text-lg font-semibold">{calculatedIMC.toFixed(1)}</span>
          </div>
          {currentCategory && categoryInfo && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className={categoryInfo.color}>
                {categoryInfo.label}
              </Badge>
              <span className="text-muted-foreground text-xs">{categoryInfo.description}</span>
            </div>
          )}
        </div>
      )}

      {/* Resultado del cálculo del servidor */}
      {lastCalculation && (
        <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">IMC Calculado:</span>
                <span className="text-xl font-bold text-green-700 dark:text-green-300">
                  {lastCalculation.imc.toFixed(1)}
                </span>
              </div>
              {categoryInfo && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${categoryInfo.color} border-current`}>
                    {categoryInfo.label}
                  </Badge>
                </div>
              )}
              {lastCalculation.tips && lastCalculation.tips.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="text-xs font-medium text-green-900 dark:text-green-100">Recomendaciones:</span>
                  <ul className="space-y-1">
                    {lastCalculation.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-green-800 dark:text-green-200">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mostrar IMC actual si se proporciona y no hay cálculo reciente */}
      {currentIMC !== null && currentIMC !== undefined && !lastCalculation && !calculatedIMC && (
        <div className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">IMC Actual:</span>
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">{currentIMC.toFixed(1)}</span>
          </div>
          {currentCategory && categoryInfo && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className={categoryInfo.color}>
                {categoryInfo.label}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Advertencia de datos inválidos */}
      {weight && height && !isValid && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
          <AlertCircle className="mt-0.5 size-4 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100">Valores fuera de rango</p>
            <p className="mt-1 text-xs text-yellow-800 dark:text-yellow-200">
              El peso debe estar entre 0 y 500 kg, y la altura entre 0 y 300 cm
            </p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button onClick={handleCalculate} disabled={!isValid || isCalculating} className="flex-1" size="sm">
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="mr-2 size-4" />
              Calcular y Guardar
            </>
          )}
        </Button>
        {showHistory && (
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="mr-2 size-4" />
                Historial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl">
              <DialogHeader>
                <DialogTitle>Historial de IMC</DialogTitle>
                <DialogDescription>Visualiza tu progreso a lo largo del tiempo</DialogDescription>
              </DialogHeader>
              <IMCHistory
                onSelect={(record) => {
                  setWeight(record.weight.toString());
                  setHeight(record.height.toString());
                  setIsHistoryOpen(false);
                  if (onCalculated) {
                    onCalculated({
                      imc: record.imc,
                      category: record.category || getIMCCategory(record.imc),
                      tips: record.tips || [],
                      weight: record.weight,
                      height: record.height,
                    });
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Información adicional */}
      {displayIMC && (
        <div className="rounded-lg border-t pt-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <TrendingUp className="size-3" />
            <span>
              El IMC es una medida aproximada. Consulta con un profesional de la salud para una evaluación completa.
            </span>
          </div>
        </div>
      )}
    </CardContent>
  );

  if (compact) {
    return <Card className={className}>{cardContent}</Card>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4" />
          Calculadora de IMC
        </CardTitle>
        <CardDescription>Ingresa tu peso y altura para calcular tu Índice de Masa Corporal</CardDescription>
      </CardHeader>
      {cardContent}
    </Card>
  );
}
