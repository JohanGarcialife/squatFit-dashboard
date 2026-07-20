"use client";

import { Mail, Phone } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Lead } from "@/lib/services/leads-service";

import { LeadSourceBadge, LeadStateBadge } from "./lead-badges";

interface LeadsTableProps {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
}

export function LeadsTable({ leads, onOpen }: LeadsTableProps) {
  if (leads.length === 0) {
    return <p className="text-muted-foreground py-10 text-center text-sm">No hay leads que coincidan con el filtro.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Interés</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Alta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer" onClick={() => onOpen(lead)}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>
                <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
                  {lead.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3" />
                      {lead.email}
                    </span>
                  )}
                  {lead.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3" />
                      {lead.phone}
                    </span>
                  )}
                  {!lead.email && !lead.phone && <span>—</span>}
                </div>
              </TableCell>
              <TableCell>
                <LeadSourceBadge source={lead.source} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{lead.interest ?? "—"}</TableCell>
              <TableCell>
                <LeadStateBadge state={lead.state} />
              </TableCell>
              <TableCell className="text-muted-foreground text-right text-xs">
                {new Date(lead.created_at).toLocaleDateString("es-ES")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
