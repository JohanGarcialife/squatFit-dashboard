"use client";

import { Boxes, GraduationCap, Package, Tag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCatalogProductos } from "@/hooks/use-catalog";

/**
 * Tarjetas de métricas del catálogo de productos (estilo peach del home).
 */
export function ProductosCatalogCards() {
  const { productos } = useCatalogProductos();

  const total = productos.length;
  const cursos = productos.filter((p) => p.type === "curso").length;
  const packs = productos.filter((p) => p.type === "pack").length;
  const sueltos = productos.filter((p) => p.type === "producto" || p.type === "suscripcion").length;

  const cards = [
    { title: "Total productos", value: total, icon: Boxes, sub: "En el catálogo" },
    { title: "Cursos", value: cursos, icon: GraduationCap, sub: "Publicados" },
    { title: "Packs", value: packs, icon: Package, sub: "De libros" },
    { title: "Productos sueltos", value: sueltos, icon: Tag, sub: "Suscripciones y otros" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title} className="sqf-metric-card @container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            <c.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
            <p className="text-muted-foreground text-xs">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
