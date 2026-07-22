"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { getAuthToken } from "@/lib/auth/auth-utils";
import { decodeToken } from "@/lib/auth/jwt-utils";

/**
 * Rol de staff del usuario logado, para la matriz de visibilidad de la ficha.
 * Prioriza el user del contexto (viene de /api/auth/me); si aún no ha cargado,
 * decodifica el JWT del almacenamiento local. `null` mientras no se conozca.
 */
export function useStaffRole(): string | null {
  const { user } = useAuth();
  const [tokenRole, setTokenRole] = useState<string | null>(null);

  useEffect(() => {
    // Solo en cliente: el token vive en localStorage/cookie del navegador.
    const token = getAuthToken();
    if (!token) return;
    const decoded = decodeToken(token);
    if (decoded?.role) setTokenRole(decoded.role);
  }, [user]);

  return user?.role ?? tokenRole;
}
