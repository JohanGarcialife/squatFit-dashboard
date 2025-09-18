import { NextResponse } from "next/server";

import { removeAuthTokenFromCookies } from "@/lib/auth/server-utils";
import { AuthService } from "@/lib/services/auth-service";

export async function POST() {
  try {
    // Intentar logout en el backend
    await AuthService.logout();

    // Remover token de cookies
    await removeAuthTokenFromCookies();

    return NextResponse.json({
      success: true,
      message: "Logout exitoso",
    });
  } catch (error) {
    console.error("Error en logout:", error);

    // Aún así, limpiar cookies locales
    await removeAuthTokenFromCookies();

    return NextResponse.json({
      success: true,
      message: "Logout exitoso (local)",
    });
  }
}
