import { NextRequest, NextResponse } from "next/server";

import { setAuthTokenInCookies } from "@/lib/auth/server-utils";
import { LoginRequest } from "@/lib/auth/types";
import { AuthService } from "@/lib/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password }: LoginRequest = await request.json();

    // Validación básica
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    // Llamar al backend usando el servicio
    const result = await AuthService.login({ email, password });

    // Guardar token en cookie HttpOnly
    await setAuthTokenInCookies(result.token);

    // Devolver respuesta con el token para que el cliente lo guarde en localStorage
    return NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: {
        email,
        // No incluir información sensible
      },
      token: result.token, // Incluir token para localStorage
    });
  } catch (error) {
    console.error("Error en login:", error);

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
