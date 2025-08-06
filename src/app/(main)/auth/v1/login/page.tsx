import { Command } from "lucide-react";

import { LoginForm } from "@/components/auth";

export default function LoginV1() {
  return (
    <div className="flex h-dvh">
      <div className="bg-primary hidden lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <Command className="text-primary-foreground mx-auto size-12" />
            <div className="space-y-2">
              <h1 className="text-primary-foreground text-5xl font-light">Hola!</h1>
              <p className="text-primary-foreground/80 text-xl">Inicia sesión para continuar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <div className="text-foreground font-medium tracking-tight">Iniciar Sesión</div>
            <div className="text-muted-foreground mx-auto max-w-xl">Bienvenido. ingresa tu email y contraseña.</div>
          </div>
          <div className="space-y-4">
            <LoginForm />
            {/* <Button className="w-full" variant="outline">
              Continue with Google
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
