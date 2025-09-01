"use client";

import React from "react";

import clsx from "clsx";
import { MoreHorizontal, Paperclip, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Datos de ejemplo para la conversación
const conversation = {
  contact: {
    name: "Manu Reyes",
    tags: ["Nutrición", "Entrenamiento"],
  },
  messages: [
    {
      id: 1,
      sender: "other",
      text: "¡Hola! Tengo una duda sobre mi alimentación.",
      timestamp: "09:15",
      date: "2024-03-16",
    },
    {
      id: 2,
      sender: "me",
      text: "Claro, cuéntame tu duda y te ayudo. ¿Quieres revisar tu plan de comidas o tienes alguna pregunta específica?",
      timestamp: "09:17",
      date: "2024-03-16",
    },
    {
      id: 3,
      sender: "me",
      text: "Recuerda que puedes enviarme tu rutina para revisarla.",
      timestamp: "09:18",
      date: "2024-03-16",
    },
    {
      id: 4,
      sender: "other",
      text: "¿Me recomiendas agregar 50g de avena en el desayuno?",
      timestamp: "08:30",
      date: "2024-05-01",
    },
  ],
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", { month: "long", day: "numeric" });
};

export default function Conversation() {
  let lastDate: string | null = null;

  return (
    <div className="flex h-full flex-col rounded-lg bg-white dark:bg-gray-900/50">
      {/* Header de la Conversación */}
      <header className="flex items-center border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex-grow">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{conversation.contact.name}</h2>
          <p className="text-primary dark:text-primary-400 text-sm">{conversation.contact.tags.join(" | ")}</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="text-gray-500 dark:text-gray-400" />
        </Button>
      </header>

      {/* Área de Mensajes */}
      <main className="flex-grow overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {conversation.messages.map((message) => {
            const showDateSeparator = message.date && message.date !== lastDate;
            if (message.date) {
              lastDate = message.date;
            }

            return (
              <React.Fragment key={message.id}>
                {showDateSeparator && (
                  <div className="my-2 flex justify-center">
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                      {formatDate(message.date)}
                    </span>
                  </div>
                )}
                <div
                  className={clsx("flex items-end gap-2", {
                    "justify-end": message.sender === "me",
                    "justify-start": message.sender === "other",
                  })}
                >
                  <div
                    className={clsx("max-w-md rounded-lg p-3", {
                      "bg-primary text-primary-foreground rounded-br-none": message.sender === "me",
                      "bg-muted text-foreground rounded-bl-none": message.sender === "other",
                    })}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="mt-1 text-right text-xs opacity-70">{message.timestamp}</p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </main>

      {/* Footer para escribir mensaje */}
      <footer className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="text-gray-500 dark:text-gray-400" />
          </Button>
          <Input placeholder="Escribe un mensaje..." className="flex-grow" />
          <Button variant="default" size="icon" className="bg-primary h-10 w-10 rounded-full">
            <Mic className="text-white" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
