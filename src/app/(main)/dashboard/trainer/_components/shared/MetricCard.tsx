/**
 * Componente reutilizable: Card de Métrica Genérica
 */

import { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  badge?: {
    text: string;
    icon?: LucideIcon;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
  footer?: React.ReactNode;
  valueClassName?: string;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  badge,
  footer,
  valueClassName,
  isLoading,
  className,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("@container/card", className)}>
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        {footer && (
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        )}
      </Card>
    );
  }

  const BadgeIcon = badge?.icon;

  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className={cn("text-2xl font-semibold tabular-nums @[250px]/card:text-3xl", valueClassName)}>
          {value}
        </CardTitle>
        {badge && (
          <CardAction>
            <Badge variant={badge.variant || "outline"} className={badge.className}>
              {BadgeIcon && <BadgeIcon className="size-4" />}
              {badge.text}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {footer && <CardFooter className="flex-col items-start gap-1.5 text-sm">{footer}</CardFooter>}
    </Card>
  );
}
