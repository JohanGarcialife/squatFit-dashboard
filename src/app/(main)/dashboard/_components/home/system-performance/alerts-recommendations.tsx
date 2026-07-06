"use client";

import { AlertTriangle, Info, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SystemAlert, SystemRecommendation } from "@/lib/services/system-metrics-types";

interface AlertsRecommendationsProps {
  alerts: SystemAlert[];
  recommendations: SystemRecommendation[];
}

export function AlertsRecommendations({ alerts, recommendations }: AlertsRecommendationsProps) {
  const getAlertIcon = (type: SystemAlert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertStyle = (type: SystemAlert["type"]) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      case "error":
        return "bg-red-500/10 border-red-500/20";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/20";
    }
  };

  const getPriorityColor = (priority: SystemRecommendation["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Alertas */}
      <Card className="bg-background/40 border backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="text-destructive h-5 w-5" />
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <CheckCircle2 className="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
              <p className="text-muted-foreground text-sm">El sistema opera con normalidad.</p>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${getAlertStyle(alert.type)}`}
              >
                <div className="mt-0.5 shrink-0">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-none font-medium">{alert.message}</p>
                  <p className="text-muted-foreground text-xs tracking-wider uppercase">
                    {alert.category} • {alert.severity}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card className="bg-background/40 border backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Recomendaciones (AI)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <Sparkles className="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
              <p className="text-muted-foreground text-sm">No hay nuevas recomendaciones por ahora.</p>
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="group bg-card flex flex-col justify-between rounded-lg border p-4 transition-all hover:border-indigo-500/30 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <p className="text-sm leading-none font-medium transition-colors group-hover:text-indigo-500">
                    {rec.title}
                  </p>
                  <p className="text-muted-foreground text-xs">{rec.action}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 sm:mt-0">
                  <Badge variant="outline" className={`text-[10px] uppercase ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {rec.category}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
