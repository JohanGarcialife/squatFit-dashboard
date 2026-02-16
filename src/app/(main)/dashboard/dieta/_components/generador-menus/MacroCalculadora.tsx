"use client";

import { Calculator } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MacroCalculadoraProps } from "./types";

export function MacroCalculadora({ className }: MacroCalculadoraProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4" />
          Calculadora de macros
        </CardTitle>
        <CardDescription>Ajusta las cantidades para alcanzar tus objetivos diarios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Objetivo calorías</Label>
            <Input type="number" placeholder="2000" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Proteínas (g)</Label>
            <Input type="number" placeholder="150" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Carbohidratos (g)</Label>
            <Input type="number" placeholder="200" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Grasas (g)</Label>
            <Input type="number" placeholder="70" className="h-9" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
