import { AuthStatus, LogoutButton } from "@/components/auth";

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Dashboard - Squat Fit</h1>
            <p className="text-muted-foreground">Panel de administración seguro con autenticación implementada.</p>
          </div>
          <LogoutButton variant="destructive" size="sm">
            Cerrar Sesión
          </LogoutButton>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <AuthStatus />
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-6 dark:bg-green-950">
              <h2 className="mb-4 text-xl font-semibold text-green-900 dark:text-green-100">
                ✅ Autenticación Implementada
              </h2>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li>
                  • <strong>Cookies HttpOnly:</strong> Máxima seguridad
                </li>
                <li>
                  • <strong>API Routes:</strong> Manejo seguro del backend
                </li>
                <li>
                  • <strong>Middleware:</strong> Protección de rutas
                </li>
                <li>
                  • <strong>Context:</strong> Estado global de autenticación
                </li>
                <li>
                  • <strong>Rate Limiting:</strong> Manejo de límites del backend
                </li>
                <li>
                  • <strong>Logout Seguro:</strong> Limpieza completa de sesión
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-950">
              <h2 className="mb-4 text-xl font-semibold text-blue-900 dark:text-blue-100">🔧 Próximos Pasos</h2>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>
                  • <strong>CRUD Operations:</strong> Gestión de datos
                </li>
                <li>
                  • <strong>User Management:</strong> Administración de usuarios
                </li>
                <li>
                  • <strong>Real-time Updates:</strong> Actualizaciones en tiempo real
                </li>
                <li>
                  • <strong>Analytics:</strong> Reportes y métricas
                </li>
                <li>
                  • <strong>Settings:</strong> Configuración del sistema
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
