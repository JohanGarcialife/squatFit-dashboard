"use client";

import { MessageSquare } from "lucide-react";

import SupportChat from "@/components/SupportChat";
import { useSupport } from "@/contexts/support-context";
import { getAuthToken } from "@/lib/auth/auth-utils";

export default function TicketConversation() {
  const { selectedTicket, getCurrentUserId } = useSupport();

  if (!selectedTicket) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
          <MessageSquare size={48} className="text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Selecciona un ticket</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Elige un ticket de la lista para ver la conversación</p>
      </div>
    );
  }

  const currentUserId = getCurrentUserId();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SupportChat ticketId={selectedTicket.id} userId={selectedTicket.user_id || ""} agentId={currentUserId || ""} />
    </div>
  );
}
