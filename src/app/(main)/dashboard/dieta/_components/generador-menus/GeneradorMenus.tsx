"use client";

import { useState, useMemo } from "react";

import { Download, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { ComidaMenu } from "../schema";

import { ComidaEditor } from "./ComidaEditor";
import { ConfiguracionPanel } from "./ConfiguracionPanel";
import { DiaSelector } from "./DiaSelector";
import { GuardarMenuDialog } from "./GuardarMenuDialog";
import { MacroCalculadora } from "./MacroCalculadora";

export function GeneradorMenus() {
  const [nombreMenu, setNombreMenu] = useState("");
  const [objetivo, setObjetivo] = useState<string>("mantenimiento");
  const [restriccionesSeleccionadas, setRestriccionesSeleccionadas] = useState<string[]>([]);
  const [diaActivo, setDiaActivo] = useState("lunes");
  const [comidas, setComidas] = useState<Record<string, ComidaMenu[]>>({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calcular totales del día actual
  const totalesDia = useMemo(() => {
    const comidasDia = comidas[diaActivo] ?? [];
    return {
      calorias: comidasDia.reduce((sum, c) => sum + (c.activo ? c.calorias : 0), 0),
      proteinas: comidasDia.reduce((sum, c) => sum + (c.activo ? c.proteinas : 0), 0),
      carbohidratos: comidasDia.reduce((sum, c) => sum + (c.activo ? c.carbohidratos : 0), 0),
      grasas: comidasDia.reduce((sum, c) => sum + (c.activo ? c.grasas : 0), 0),
    };
  }, [comidas, diaActivo]);

  const handleAddComida = () => {
    const nuevaComida: ComidaMenu = {
      id: `comida-${Date.now()}`,
      tipoComida: "comida",
      usaReceta: true,
      porciones: 1,
      calorias: 0,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
      activo: true,
    };

    setComidas((prev) => ({
      ...prev,
      [diaActivo]: [...(prev[diaActivo] ?? []), nuevaComida],
    }));
  };

  const handleUpdateComida = (index: number, comida: ComidaMenu) => {
    setComidas((prev) => ({
      ...prev,
      [diaActivo]: prev[diaActivo].map((c, i) => (i === index ? comida : c)),
    }));
  };

  const handleDeleteComida = (index: number) => {
    setComidas((prev) => ({
      ...prev,
      [diaActivo]: prev[diaActivo].filter((_, i) => i !== index),
    }));
  };

  const handleCopiarDia = (diaOrigen: string) => {
    setComidas((prev) => ({
      ...prev,
      [diaActivo]: prev[diaOrigen].map((c) => ({ ...c, id: `comida-${Date.now()}-${Math.random()}` })),
    }));
  };

  const handleToggleRestriccion = (codigo: string) => {
    setRestriccionesSeleccionadas((prev) =>
      prev.includes(codigo) ? prev.filter((r) => r !== codigo) : [...prev, codigo],
    );
  };

  const handleGuardarMenu = () => {
    // TODO: Integrar con backend
    console.log("Guardando menú:", {
      nombre: nombreMenu,
      objetivo,
      restricciones: restriccionesSeleccionadas,
      comidas,
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Generador de Menús</h2>
          <p className="text-muted-foreground text-sm">Crea planes alimenticios personalizados para tus clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="mr-2 size-4" />
                Guardar Menú
              </Button>
            </DialogTrigger>
            <GuardarMenuDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              nombreMenu={nombreMenu}
              setNombreMenu={setNombreMenu}
              onGuardar={handleGuardarMenu}
            />
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Panel de configuración */}
        <ConfiguracionPanel
          objetivo={objetivo}
          setObjetivo={setObjetivo}
          restriccionesSeleccionadas={restriccionesSeleccionadas}
          onToggleRestriccion={handleToggleRestriccion}
          totalesDia={totalesDia}
        />

        {/* Panel principal de edición */}
        <DiaSelector
          diaActivo={diaActivo}
          setDiaActivo={setDiaActivo}
          comidas={comidas}
          onCopiarDia={handleCopiarDia}
          onAddComida={handleAddComida}
        >
          {comidas[diaActivo]?.map((comida, index) => (
            <ComidaEditor
              key={comida.id}
              comida={comida}
              onUpdate={(c) => handleUpdateComida(index, c)}
              onDelete={() => handleDeleteComida(index)}
            />
          ))}
        </DiaSelector>
      </div>

      {/* Calculadora rápida */}
      <MacroCalculadora />
    </div>
  );
}
