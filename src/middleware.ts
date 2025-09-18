import { NextRequest, NextResponse } from "next/server";

import { isAuthenticatedServer } from "@/lib/auth/server-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/auth", "/unauthorized", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar autenticación para rutas protegidas
  const authenticated = await isAuthenticatedServer();

  if (!authenticated) {
    // Redirigir a login si no hay token válido
    const loginUrl = new URL("/auth/v1/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/admin/:path*"],
};
