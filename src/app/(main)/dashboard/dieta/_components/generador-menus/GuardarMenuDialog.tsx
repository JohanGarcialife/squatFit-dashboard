"use client";

import { useState } from "react";

import { Save, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GuardarMenuDialogProps } from "./types";

export function GuardarMenuDialog({
  isOpen,
  onOpenChange,
  nombreMenu,
  setNombreMenu,
  onGuardar,
}: GuardarMenuDialogProps) {
  const [clienteBusqueda, setClienteBusqueda] = useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Guardar Menú</DialogTitle>
        <DialogDescription>Guarda este plan alimenticio para asignarlo a un cliente</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Nombre del menú</Label>
          <Input
            placeholder="Ej: Plan de definición - Semana 1"
            value={nombreMenu}
            onChange={(e) => setNombreMenu(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Asignar a cliente (opcional)</Label>
          <div className="relative">
            <Users className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              placeholder="Buscar cliente..."
              value={clienteBusqueda}
              onChange={(e) => setClienteBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={onGuardar}>
          <Save className="mr-2 size-4" />
          Guardar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
