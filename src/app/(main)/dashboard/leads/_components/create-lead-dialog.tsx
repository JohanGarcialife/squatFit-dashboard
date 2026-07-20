"use client";

import { useState } from "react";

import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLead } from "@/hooks/use-leads";
import { LEAD_SOURCE_LABEL, LEAD_SOURCES, type LeadSource } from "@/lib/services/leads-service";

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeadDialog({ open, onOpenChange }: CreateLeadDialogProps) {
  const createLead = useCreateLead();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [source, setSource] = useState<LeadSource>("web");

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setInterest("");
    setSource("web");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    createLead.mutate(
      {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        interest: interest.trim() || undefined,
        source,
      },
      {
        onSuccess: () => {
          toast.success("Lead creado");
          reset();
          onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo crear el lead"),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Nuevo lead
          </DialogTitle>
          <DialogDescription>Registra un lead manualmente en el pipeline (entra como «Nuevo»).</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="lead-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellidos"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Teléfono</Label>
              <Input id="lead-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lead-source">Origen</Label>
              <Select value={source} onValueChange={(v: LeadSource) => setSource(v)}>
                <SelectTrigger id="lead-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAD_SOURCE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-interest">Interés</Label>
              <Input
                id="lead-interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Programa, curso…"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createLead.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={createLead.isPending} className="gap-2">
            {createLead.isPending && <Loader2 className="size-4 animate-spin" />}
            Crear lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
