import { cookies } from "next/headers";

// Utilidades para manejo de cookies HttpOnly (servidor)
export const getAuthTokenFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("authToken")?.value ?? null;
};

export const setAuthTokenInCookies = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600, // 1 hora
    path: "/",
  });
};

export const removeAuthTokenFromCookies = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete("authToken");
};

// Utilidades para el cliente (solo para verificación)
export const getAuthTokenFromClient = (): string | null => {
  if (typeof window === "undefined") return null;

  // Intentar obtener de cookies (no HttpOnly para verificación)
  const cookies = document.cookie.split(";");
  const authCookie = cookies.find((cookie) => cookie.trim().startsWith("authToken="));
  return authCookie ? authCookie.split("=")[1] : null;
};
