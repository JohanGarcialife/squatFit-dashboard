/**
 * Componente reutilizable: Avatar de Cliente con Iniciales
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ClienteAvatarProps {
  nombre: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const getInitials = (nombre: string) => {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export function ClienteAvatar({ nombre, avatar, size = "md", className }: ClienteAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatar} alt={nombre} />
      <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(nombre)}</AvatarFallback>
    </Avatar>
  );
}
