import React from "react";

import { Search } from "lucide-react";

import Chat from "./_components/Chat";
import Conversation from "./_components/Conversation";
import FichaTecnica from "./_components/FichaTecnica";
import Filtros from "./_components/Filtros";

export default function Page() {
  return (
    <>
      {/* LEFT COLUMN */}
      <div className="flex h-full min-h-[600px] flex-col gap-4 lg:flex-row">
        <div className="border-primary/10 h-full w-full space-y-5 border-r pr-2 lg:w-1/4">
          <div className="border-border flex h-fit w-full flex-row items-center gap-2 rounded-full border bg-[#d7e3ee] p-2">
            <Search className="text-[#6c727e]" />
            <input placeholder="Buscar un chat o iniciar nuevo" type="text" className="w-full" />
          </div>
          <Filtros />
          <Chat />
          <div className="flex w-full items-end justify-end p-4">
            <div className="bg-primary flex w-fit cursor-pointer items-center justify-center rounded-full px-4 py-2 transition-transform hover:scale-105">
              <p className="text-2xl font-bold text-white">+</p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="flex h-full w-full flex-col gap-4 lg:w-2/4">
          <Conversation />
        </div>
        {/* RIGHT COLUMN */}
        <div className="flex h-full w-full flex-col gap-4 lg:w-1/4">
          <FichaTecnica />
        </div>
      </div>
    </>
  );
}
