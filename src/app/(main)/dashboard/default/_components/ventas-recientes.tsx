"use client";

/**
 * Componente de ventas recientes para el HOME
 * Muestra las últimas 5 ventas en una tabla simple
 */

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRecentSales } from "@/hooks/use-sales";

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatea la fecha al formato local
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Formatea el precio con el símbolo de moneda
 */
function formatPrice(amount: number | null | undefined, currency?: string): string {
  // Validar que amount sea un número válido
  if (amount == null || amount === undefined) {
    return "—";
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return "—";
  }

  const symbol = currency === "USD" ? "$" : "€";
  return `${symbol}${numAmount.toFixed(2)}`;
}

/**
 * Obtiene el color del badge según el tipo de venta
 */
function getSaleTypeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  switch (type) {
    case "course":
      return "default";
    case "advice":
      return "secondary";
    case "book":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Traduce el tipo de venta al español
 */
function translateSaleType(type: string): string {
  switch (type) {
    case "course":
      return "Curso";
    case "advice":
      return "Asesoría";
    case "book":
      return "Libro";
    default:
      return type;
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function VentasRecientes() {
  const { data, isLoading, error } = useRecentSales();

  return (
    <Card className="border-primary col-span-2">
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
        <CardDescription>Últimas 5 transacciones del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">No se obtuvieron datos</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {data.sales.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground text-sm">No hay ventas registradas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{formatDate(sale.created_at)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{sale.title}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {sale.user_name ?? sale.user_email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSaleTypeBadgeVariant(sale.type)}>{translateSaleType(sale.type)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(sale.amount_value, sale.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/ventas">
            Ver todas las ventas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
