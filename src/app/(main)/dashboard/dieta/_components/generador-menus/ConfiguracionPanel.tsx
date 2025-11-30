"use client";

import { RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { restriccionesData, objetivosMenu } from "../data";

import { ConfiguracionPanelProps } from "./types";

export function ConfiguracionPanel({
  objetivo,
  setObjetivo,
  restriccionesSeleccionadas,
  onToggleRestriccion,
  totalesDia,
}: ConfiguracionPanelProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Configuración</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Objetivo */}
        <div className="space-y-2">
          <Label>Objetivo</Label>
          <Select value={objetivo} onValueChange={setObjetivo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {objetivosMenu.map((obj) => (
                <SelectItem key={obj.value} value={obj.value}>
                  {obj.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Restricciones */}
        <div className="space-y-2">
          <Label>Restricciones</Label>
          <div className="flex flex-wrap gap-1">
            {restriccionesData
              .filter((r) => r.activo)
              .map((restriccion) => (
                <Badge
                  key={restriccion.id}
                  variant={restriccionesSeleccionadas.includes(restriccion.codigo) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onToggleRestriccion(restriccion.codigo)}
                >
                  {restriccion.icono} {restriccion.nombre}
                </Badge>
              ))}
          </div>
        </div>

        <Separator />

        {/* Resumen diario */}
        <div className="space-y-2">
          <Label>Totales del día</Label>
          <div className="bg-muted/50 space-y-1 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span>Calorías</span>
              <span className="font-medium">{totalesDia.calorias.toFixed(0)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span>Proteínas</span>
              <span className="font-medium">{totalesDia.proteinas.toFixed(0)}g</span>
            </div>
            <div className="flex justify-between">
              <span>Carbohidratos</span>
              <span className="font-medium">{totalesDia.carbohidratos.toFixed(0)}g</span>
            </div>
            <div className="flex justify-between">
              <span>Grasas</span>
              <span className="font-medium">{totalesDia.grasas.toFixed(0)}g</span>
            </div>
          </div>
        </div>

        {/* Sustitución automática */}
        {restriccionesSeleccionadas.length > 0 && (
          <Button variant="outline" size="sm" className="w-full">
            <RefreshCcw className="mr-2 size-4" />
            Aplicar sustituciones
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
