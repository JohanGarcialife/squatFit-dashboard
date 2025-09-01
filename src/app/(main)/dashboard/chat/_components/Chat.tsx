"use client";

import { useState } from "react";

import clsx from "clsx";
import { User, MoreHorizontal } from "lucide-react";

export default function Chat() {
  const [selectedChatId, setSelectedChatId] = useState(10);

  const chatList = [
    {
      id: 10,
      name: "Manu Reyes",
      tags: ["Nutricion", "Entrenamiento"],
      unread: 0,
    },
    {
      id: 1,
      name: "Sergio Sánchez",
      tags: ["Entrenamiento"],
      unread: 0,
    },
    {
      id: 2,
      name: "Nico Vazquez",
      tags: ["Entrenamiento", "Emocional"],
      unread: 0,
    },
    {
      id: 3,
      name: "Nuevos Leads",
      tags: ["8 incricajes no leídos"],
      unread: 8,
    },
    {
      id: 4,
      name: "Sandy gym",
      tags: [],
      unread: 0,
    },
    {
      id: 5,
      name: "Psychologia",
      tags: [],
      unread: 0,
    },
    {
      id: 6,
      name: "Fuga Club",
      tags: [],
      unread: 0,
    },
    {
      id: 7,
      name: "Tecnología",
      tags: [],
      unread: 0,
    },
    {
      id: 8,
      name: "sport@sysanto...",
      tags: [],
      unread: 0,
    },
    {
      id: 9,
      name: "Santiago Gallo Smirnov",
      tags: [],
      unread: 0,
    },
  ];

  return (
    <div className="flex flex-col gap-1 p-2">
      {chatList.map((chat) => (
        <div
          key={chat.id}
          className={clsx("flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors duration-150", {
            "bg-blue-100/70 dark:bg-blue-900/40": selectedChatId === chat.id,
            "hover:bg-gray-100/80 dark:hover:bg-gray-800/60": selectedChatId !== chat.id,
          })}
          onClick={() => setSelectedChatId(chat.id)}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <User size={20} className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          {/* Chat Info */}
          <div className="flex-grow overflow-hidden">
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{chat.name}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{chat.tags.join(" | ")}</p>
          </div>

          {/* Metadata */}
          {(chat.unread > 0 || chat.name === "Nuevos Leads") && (
            <div className="ml-2 flex flex-shrink-0 flex-col items-end gap-y-1">
              {chat.name === "Nuevos Leads" ? (
                <MoreHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <div className="h-5 w-5" /> // Placeholder for alignment
              )}
              {chat.unread > 0 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {chat.unread}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
