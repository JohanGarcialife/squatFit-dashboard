import { cookies } from "next/headers";

// Utilidades para manejo de cookies HttpOnly (SOLO SERVIDOR)
// Este archivo solo debe ser importado en Server Components o API Routes

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

