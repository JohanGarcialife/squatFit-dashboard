import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/auth-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Devolver información segura del usuario
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        // No incluir información sensible como sub o iat
      },
    });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
