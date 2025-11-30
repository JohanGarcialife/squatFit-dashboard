"use client";

import { Copy, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ComidaMenu } from "../schema";

import { diasSemana, DiaSelectorProps } from "./types";

interface DiaSelectorExtendedProps extends DiaSelectorProps {
  onCopiarDia: (diaOrigen: string) => void;
  onAddComida: () => void;
  children: React.ReactNode;
}

export function DiaSelector({
  diaActivo,
  setDiaActivo,
  comidas,
  onCopiarDia,
  onAddComida,
  children,
}: DiaSelectorExtendedProps) {
  return (
    <div className="space-y-4 lg:col-span-3">
      {/* Selector de día */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {diasSemana.map((dia) => (
          <Button
            key={dia.value}
            variant={diaActivo === dia.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDiaActivo(dia.value)}
            className="min-w-[100px]"
          >
            {dia.label}
            {comidas[dia.value]?.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {comidas[dia.value].length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Copiar desde otro día */}
      {(comidas[diaActivo]?.length ?? 0) === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-muted-foreground mb-3 text-sm">Este día está vacío. ¿Quieres copiar de otro día?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {diasSemana
                .filter((d) => d.value !== diaActivo && (comidas[d.value]?.length ?? 0) > 0)
                .map((dia) => (
                  <Button key={dia.value} variant="outline" size="sm" onClick={() => onCopiarDia(dia.value)}>
                    <Copy className="mr-2 size-3" />
                    {dia.label}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de comidas */}
      <div className="space-y-3">{children}</div>

      {/* Botón añadir comida */}
      <Button variant="outline" className="w-full border-dashed" onClick={onAddComida}>
        <Plus className="mr-2 size-4" />
        Añadir comida
      </Button>
    </div>
  );
}
