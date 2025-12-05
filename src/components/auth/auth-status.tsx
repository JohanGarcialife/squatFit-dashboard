"use client";

import { LogOut, User, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export function AuthStatus() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cargando...</CardTitle>
          <CardDescription>Verificando autenticación</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            No Autenticado
          </CardTitle>
          <CardDescription>Debes iniciar sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/auth/v1/login">Ir al Login</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-green-500" />
          Usuario Autenticado
        </CardTitle>
        <CardDescription>Información de tu sesión</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-muted-foreground text-sm">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rol:</span>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
