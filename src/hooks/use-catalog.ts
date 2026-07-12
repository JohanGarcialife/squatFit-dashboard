"use client";

import { useMemo } from "react";

import { useCursos } from "@/hooks/use-cursos";
import { usePacks } from "@/hooks/use-packs";
import { useProductos } from "@/hooks/use-productos";

// ============================================================================
// Catálogo unificado de productos
// ----------------------------------------------------------------------------
// Agrega en el frontend las entidades vendibles que hoy viven en endpoints
// distintos (cursos, packs de libros) en un único modelo `CatalogProduct`.
// Diseñado para ampliarse: añadir suscripciones (Cocina) o calculadoras es
// sumar otra fuente al `useMemo` de abajo con el mismo shape.
// ============================================================================

export type CatalogProductType = "curso" | "pack" | "producto" | "suscripcion";
export type CatalogProductStatus = "Activo" | "Inactivo" | "En Desarrollo";

export interface CatalogProduct {
  /** id original de la entidad */
  id: string;
  /** clave única en el catálogo (type+id), para getRowId */
  key: string;
  type: CatalogProductType;
  name: string;
  description: string;
  price: number;
  currency: string;
  status: CatalogProductStatus;
}

export function useCatalogProductos() {
  const cursosQ = useCursos();
  const packsQ = usePacks();
  const productosQ = useProductos();

  const productos = useMemo<CatalogProduct[]>(() => {
    const cursos: CatalogProduct[] = (cursosQ.data ?? []).map((c) => ({
      id: c.id,
      key: `curso-${c.id}`,
      type: "curso",
      name: c.name,
      description: c.description ?? "",
      price: c.price ?? 0,
      currency: c.currency ?? "€",
      status: (c.status as CatalogProductStatus) ?? "Activo",
    }));

    const packs: CatalogProduct[] = (packsQ.data ?? []).map((p) => ({
      id: p.id,
      key: `pack-${p.id}`,
      type: "pack",
      name: p.name,
      description: p.description ?? "",
      price: p.price ?? 0,
      currency: "€",
      status: "Activo",
    }));

    const sueltos: CatalogProduct[] = (productosQ.data ?? []).map((p) => ({
      id: p.id,
      key: `producto-${p.id}`,
      type: p.type === "subscription" ? "suscripcion" : "producto",
      name: p.name,
      description: p.description ?? "",
      price: p.price ?? 0,
      currency: p.currency === "eur" ? "€" : (p.currency ?? "€"),
      status: p.active ? "Activo" : "Inactivo",
    }));

    return [...cursos, ...packs, ...sueltos];
  }, [cursosQ.data, packsQ.data, productosQ.data]);

  return {
    productos,
    // Los productos sueltos no bloquean la carga: si su endpoint aún no está
    // desplegado (401), el catálogo sigue mostrando cursos y packs.
    isLoading: cursosQ.isLoading || packsQ.isLoading,
    isError: cursosQ.isError || packsQ.isError,
    error: cursosQ.error ?? packsQ.error,
  };
}
