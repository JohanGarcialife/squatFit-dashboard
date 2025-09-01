"use client";

import React, { useState } from "react";

export default function Filtros() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  return (
    <div>
      <div className="flex w-full flex-row gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* botones */}
        <button
          className={`rounded-full px-4 py-2 whitespace-nowrap ${
            activeFilter === "Todos" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveFilter("Todos")}
        >
          Todos
        </button>
        <button
          className={`rounded-full px-4 py-2 whitespace-nowrap ${
            activeFilter === "Miembros" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveFilter("Miembros")}
        >
          Miembros
        </button>
        <button
          className={`rounded-full px-4 py-2 whitespace-nowrap ${
            activeFilter === "Soporte" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveFilter("Soporte")}
        >
          Soporte
        </button>
        <button
          className={`rounded-full px-4 py-2 whitespace-nowrap ${
            activeFilter === "Ventas" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveFilter("Ventas")}
        >
          Ventas
        </button>
      </div>
    </div>
  );
}
