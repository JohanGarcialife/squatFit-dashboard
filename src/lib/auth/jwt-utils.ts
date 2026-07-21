import { jwtDecode } from "jwt-decode";

import { AuthToken } from "./types";

// Utilidades para validación de JWT
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Roles de STAFF que pueden entrar al back office. El login del panel
 * (`/api/v1/admin-panel/login`) solo emite tokens de staff, pero como el
 * `authToken` es un JWT normal, un token de CLIENTE (rol `user`) también
 * pasaría el check de `exp`. Este allow-list bloquea a los no-staff.
 *
 * Roles aceptados (unión de los vistos en el código + los indicados en la
 * auditoría): admin, adviser, coach, dietitian, support_agent, sales,
 * psychologist, editor, staff. Se excluye `user` (cliente) y cualquier rol
 * desconocido/ausente. Añadir aquí si el backend crea un rol de staff nuevo.
 */
export const STAFF_ROLES = [
  "admin",
  "adviser",
  "coach",
  "dietitian",
  "support_agent",
  "sales",
  "psychologist",
  "editor",
  "staff",
] as const;

/** ¿El token pertenece a un rol de staff válido para el panel? */
export const isStaffToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    const role = String(decoded.role ?? "").trim().toLowerCase();
    return (STAFF_ROLES as readonly string[]).includes(role);
  } catch {
    return false;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): AuthToken | null => {
  try {
    return jwtDecode<AuthToken>(token);
  } catch {
    return null;
  }
};
