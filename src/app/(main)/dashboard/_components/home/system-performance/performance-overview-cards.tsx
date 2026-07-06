"use client";

import { Activity, Brain, Target, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { SystemOverview } from "@/lib/services/system-metrics-types";

interface PerformanceOverviewCardsProps {
  overview: SystemOverview;
}

export function PerformanceOverviewCards({ overview }: PerformanceOverviewCardsProps) {
  const cards = [
    {
      title: "Precisión de Clasificación",
      value: `${(overview.classification.accuracy * 100).toFixed(0)}%`,
      subtitle: `Confianza: ${(overview.classification.confidence * 100).toFixed(0)}%`,
      icon: Target,
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-500",
      borderGlow: "group-hover:border-blue-500/50",
    },
    {
      title: "Latencia Promedio",
      value: `${overview.latency.averageResponseTime}ms`,
      subtitle: "Tiempo de respuesta",
      icon: Zap,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-500",
      borderGlow: "group-hover:border-amber-500/50",
    },
    {
      title: "Patrones Aprendidos",
      value: overview.learning.patternsLearned,
      subtitle: "Machine learning",
      icon: Brain,
      gradient: "from-fuchsia-500/20 to-purple-500/20",
      iconColor: "text-fuchsia-500",
      borderGlow: "group-hover:border-fuchsia-500/50",
    },
    {
      title: "Satisfacción del Cliente",
      value: `${overview.satisfaction.clientSatisfaction}/5`,
      subtitle: "Nivel general",
      icon: Activity,
      gradient: "from-emerald-500/20 to-green-500/20",
      iconColor: "text-emerald-500",
      borderGlow: "group-hover:border-emerald-500/50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card
          key={i}
          className={`group bg-background/50 relative overflow-hidden border backdrop-blur-xl transition-all duration-500 hover:shadow-lg ${card.borderGlow}`}
        >
          {/* Subtle gradient background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
          />

          <CardContent className="relative flex flex-col justify-between p-6">
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`bg-background flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${card.iconColor}`}
              >
                <card.icon className="h-6 w-6" />
              </div>
            </div>

            <div>
              <h3 className="text-muted-foreground text-sm font-medium">{card.title}</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight">{card.value}</p>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{card.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
