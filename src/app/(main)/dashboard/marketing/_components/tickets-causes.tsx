"use client";

import { useMemo } from "react";

import { TrendingUp, TrendingDown, Minus, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { getMockCausasTickets } from "./data";
import type { CausaTicket } from "./schema";

const tendenciaConfig = {
  subiendo: {
    icon: TrendingUp,
    color: "text-red-500",
    label: "Subiendo",
  },
  bajando: {
    icon: TrendingDown,
    color: "text-green-500",
    label: "Bajando",
  },
  estable: {
    icon: Minus,
    color: "text-gray-500",
    label: "Estable",
  },
};

interface TicketCauseItemProps {
  causa: CausaTicket;
  index: number;
}

function TicketCauseItem({ causa, index }: TicketCauseItemProps) {
  const config = tendenciaConfig[causa.tendencia];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4">
      <div className="bg-muted flex size-8 items-center justify-center rounded-full text-sm font-semibold">
        {index + 1}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{causa.causa}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="tabular-nums">
              {causa.cantidad}
            </Badge>
            <Icon className={`size-4 ${config.color}`} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={causa.porcentaje} className="h-2 flex-1" />
          <span className="text-muted-foreground text-sm tabular-nums">{causa.porcentaje.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export function TicketsCauses() {
  const causas = useMemo(() => getMockCausasTickets(), []);
  const totalTickets = causas.reduce((acc, curr) => acc + curr.cantidad, 0);

  const tendenciasResumen = {
    subiendo: causas.filter((c) => c.tendencia === "subiendo").length,
    bajando: causas.filter((c) => c.tendencia === "bajando").length,
    estable: causas.filter((c) => c.tendencia === "estable").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="size-5 text-purple-500" />
              Top 5 Causas de Tickets
            </CardTitle>
            <CardDescription>Principales motivos de consultas recibidas</CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg tabular-nums">
            {totalTickets} tickets
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {causas.map((causa, index) => (
            <TicketCauseItem key={causa.id} causa={causa} index={index} />
          ))}
        </div>

        <div className="bg-muted/50 mt-6 flex items-center justify-center gap-6 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="size-4 text-red-500" />
            <span className="text-muted-foreground">Subiendo:</span>
            <span className="font-semibold">{tendenciasResumen.subiendo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="size-4 text-green-500" />
            <span className="text-muted-foreground">Bajando:</span>
            <span className="font-semibold">{tendenciasResumen.bajando}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Minus className="size-4 text-gray-500" />
            <span className="text-muted-foreground">Estable:</span>
            <span className="font-semibold">{tendenciasResumen.estable}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
