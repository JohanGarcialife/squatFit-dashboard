"use client";

import { PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VentasPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
        <p className="text-muted-foreground">Gestión de ventas y transacciones.</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground text-sm">Contenido de Ventas - En desarrollo</p>
      </div>

      {/* Acción «Añadir producto» (13.12.1) — se moverá a las acciones por fila de
          cada pedido cuando el módulo de Pedidos esté disponible. El diálogo
          reutilizable (GrantProductDialog) ya acepta `orderId` para el contexto
          del pedido. Se muestra deshabilitado hasta que exista la lista de
          pedidos con su usuario asociado. */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="size-5" />
            Añadir producto a un pedido
          </CardTitle>
          <CardDescription>
            Asigna manualmente un producto del catálogo al cliente de un pedido (p. ej. tras un pago externo o una
            incidencia).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button disabled className="gap-2">
            <PackagePlus className="size-4" />
            Añadir producto
          </Button>
          <p className="text-muted-foreground text-xs">
            Disponible al integrar el módulo de Pedidos (cada fila abrirá el selector de producto con el pedido y su
            usuario ya cargados). La misma acción ya está operativa en <strong>Usuarios</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
