"use client";

import React from "react";

import { ChevronRight, Circle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const fichaData = {
  initials: "MR",
  name: "Manuel Reyes",
  tags: "Nutrición | Bienestar",
  details: [
    { label: "Objetivo", value: "Ponerse en forma" },
    { label: "Estado", value: "Activo" },
    { label: "Responsable", value: "Hamlet", interactive: true },
    {
      label: "Tarea",
      value: "Revisar dieta",
      interactive: true,
      icon: <Circle size={14} className="fill-current text-blue-500" />,
    },
    { label: "Estado emocional", value: "Calmado", action: "Agregar nota" },
  ],
  mainActions: ["Reasignar responsable", "Marcar tarea como completada", "Ver ficha completa"],
  secondaryActions: ["Asignar rutina", "Actualizar estado emocional", "Agregar nota"],
};

const DetailItem = ({ label, value, interactive, icon, action }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</span>
      {interactive && <ChevronRight size={16} className="text-gray-400" />}
      {action && <button className="text-sm text-orange-500 hover:underline">{action}</button>}
    </div>
  </div>
);

export default function FichaTecnica() {
  return (
    <div className="flex h-full flex-col gap-6 rounded-lg bg-gray-50/50 p-4 dark:bg-gray-900/20">
      <h2 className="text-primary text-lg font-bold">Ficha Técnica</h2>

      {/* User Info */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="h-20 w-20 bg-orange-500">
          <AvatarFallback className="bg-transparent text-2xl font-bold text-white">{fichaData.initials}</AvatarFallback>
        </Avatar>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{fichaData.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{fichaData.tags}</p>
      </div>

      {/* Details */}
      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
        {fichaData.details.map((item) => (
          <DetailItem key={item.label} {...item} />
        ))}
      </div>

      {/* Main Actions */}
      <div className="flex flex-col gap-3">
        {fichaData.mainActions.map((action) => (
          <Button
            key={action}
            variant="ghost"
            className="w-full justify-center bg-orange-400/20 text-orange-800 hover:bg-orange-400/30 hover:text-orange-900 dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30"
          >
            {action}
          </Button>
        ))}
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-col gap-4">
        {fichaData.secondaryActions.map((action) => (
          <button key={action} className="text-left text-sm text-gray-600 hover:underline dark:text-gray-300">
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
