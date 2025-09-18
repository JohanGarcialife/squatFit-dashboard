// Utilidades para el cliente (solo para verificación)
// Este archivo solo contiene funciones que pueden ejecutarse en el cliente

export const getAuthTokenFromClient = (): string | null => {
  if (typeof window === "undefined") return null;

  // Intentar obtener de cookies (no HttpOnly para verificación)
  const cookies = document.cookie.split(";");
  const authCookie = cookies.find((cookie) => cookie.trim().startsWith("authToken="));
  return authCookie ? authCookie.split("=")[1] : null;
};

// Función para obtener token de localStorage como fallback
export const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem("authToken");
  } catch (error) {
    console.warn("Error accessing localStorage:", error);
    return null;
  }
};

// Función para guardar token en localStorage (solo para desarrollo)
export const setAuthTokenInStorage = (token: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("authToken", token);
  } catch (error) {
    console.warn("Error saving to localStorage:", error);
  }
};

// Función para remover token de localStorage
export const removeAuthTokenFromStorage = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("authToken");
  } catch (error) {
    console.warn("Error removing from localStorage:", error);
  }
};
