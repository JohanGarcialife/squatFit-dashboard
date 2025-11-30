"use client";

import { useState, useMemo } from "react";

import { User } from "lucide-react";

import { Card } from "@/components/ui/card";

import { clientesData } from "../data";

import { ClienteCard } from "./ClienteCard";
import { FilterBar, EstadosResumen } from "./FilterBar";

export function PanelClientes() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<string>("todos");
  const [ordenarPor, setOrdenarPor] = useState<string>("nombre");

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientesData];

    // Filtrar por búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.nombre.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.plan.toLowerCase().includes(searchLower),
      );
    }

    // Filtrar por estado de pago
    if (filtroEstadoPago !== "todos") {
      resultado = resultado.filter((c) => c.estadoPago === filtroEstadoPago);
    }

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenarPor) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        case "proximaRevision":
          if (!a.proximaRevision) return 1;
          if (!b.proximaRevision) return -1;
          return new Date(a.proximaRevision).getTime() - new Date(b.proximaRevision).getTime();
        case "estadoPago": {
          const orden = { vencido: 0, pendiente: 1, parcial: 2, pagado: 3 };
          return orden[a.estadoPago] - orden[b.estadoPago];
        }
        case "cumplimiento":
          return a.cumplimientoSemanal - b.cumplimientoSemanal;
        default:
          return 0;
      }
    });

    return resultado;
  }, [busqueda, filtroEstadoPago, ordenarPor]);

  // Conteo por estado
  const conteoEstados = useMemo(() => {
    return {
      total: clientesData.length,
      pagado: clientesData.filter((c) => c.estadoPago === "pagado").length,
      pendiente: clientesData.filter((c) => c.estadoPago === "pendiente").length,
      vencido: clientesData.filter((c) => c.estadoPago === "vencido").length,
      parcial: clientesData.filter((c) => c.estadoPago === "parcial").length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <EstadosResumen conteoEstados={conteoEstados} clientesFiltrados={clientesFiltrados.length} />

      {/* Filtros */}
      <FilterBar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtroEstadoPago={filtroEstadoPago}
        setFiltroEstadoPago={setFiltroEstadoPago}
        ordenarPor={ordenarPor}
        setOrdenarPor={setOrdenarPor}
      />

      {/* Grid de clientes */}
      {clientesFiltrados.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clientesFiltrados.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <User className="text-muted-foreground/50 mb-4 size-12" />
            <h3 className="font-semibold">No se encontraron clientes</h3>
            <p className="text-muted-foreground mt-1 text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </Card>
      )}
    </div>
  );
}
