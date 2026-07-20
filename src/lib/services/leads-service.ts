import { getAuthToken } from "@/lib/auth/auth-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";

// ============================================================================
// CRM — LEADS (13.13)
// ----------------------------------------------------------------------------
// Contrato esperado de Fase 6 (backend en paralelo):
//   • GET    /api/v1/admin-panel/leads                (lista; permiso 'leads')
//   • POST   /api/v1/admin-panel/leads                (crear)
//   • PUT    /api/v1/admin-panel/leads/:id            (actualizar; incl. estado)
//   • DELETE /api/v1/admin-panel/leads/:id            (borrar)
//   • POST   /api/v1/admin-panel/leads/import         (importar CSV; multipart)
//   • POST   /api/v1/admin-panel/leads/:id/notes      (añadir nota)
//
// Verificado 20 jul 2026: el endpoint AÚN NO existe en prod (404). Por eso todo
// va tras `LEADS_API_READY`. Mientras sea `false`, el módulo funciona con datos
// de ejemplo (en memoria) para que la UI sea revisable y quede lista para
// encender: cuando el backend despliegue, poner `LEADS_API_READY = true` y
// confirmar los nombres de campo del contrato.
// ============================================================================

/** Interruptor global: `true` cuando el backend de leads esté desplegado. */
export const LEADS_API_READY = false;

/** Estados del pipeline (contrato de Fase 6). El orden define las columnas kanban. */
export const LEAD_STATES = ["Nuevo", "Contactado", "Agendado", "Asistió", "Ganado", "Perdido"] as const;
export type LeadState = (typeof LEAD_STATES)[number];

/** Orígenes soportados por el filtro. */
export const LEAD_SOURCES = ["web", "ig"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  web: "Web",
  ig: "Instagram",
};

export interface LeadNote {
  id: string;
  body: string;
  author?: string;
  created_at: string;
}

export interface LeadHistoryEntry {
  id: string;
  /** Descripción del evento (cambio de estado, nota, importación…). */
  event: string;
  from_state?: LeadState;
  to_state?: LeadState;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  state: LeadState;
  /** Etiqueta libre (programa de interés, campaña…). */
  interest?: string;
  notes: LeadNote[];
  history: LeadHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface LeadsQuery {
  search?: string;
  source?: LeadSource | "all";
  state?: LeadState | "all";
}

export interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  state?: LeadState;
  interest?: string;
}

// ─── Datos de ejemplo (solo mientras LEADS_API_READY === false) ──────────────
// Cubren todos los estados y los dos orígenes para poder revisar tabla y kanban.
const SAMPLE_LEADS: Lead[] = [
  {
    id: "sample-1",
    name: "Lucía Fernández",
    email: "lucia.fer@example.com",
    phone: "+34 600 111 222",
    source: "ig",
    state: "Nuevo",
    interest: "Programa Transfórmate",
    notes: [],
    history: [{ id: "h1", event: "Lead creado desde Instagram (DM)", created_at: "2026-07-18T09:12:00Z" }],
    created_at: "2026-07-18T09:12:00Z",
    updated_at: "2026-07-18T09:12:00Z",
  },
  {
    id: "sample-2",
    name: "Marcos Ruiz",
    email: "marcosruiz@example.com",
    phone: "+34 611 333 444",
    source: "web",
    state: "Contactado",
    interest: "Asesoría 1:1",
    notes: [
      { id: "n1", body: "Le envié el enlace de la llamada.", author: "Staff", created_at: "2026-07-17T16:40:00Z" },
    ],
    history: [
      { id: "h2", event: "Lead creado desde formulario web", created_at: "2026-07-16T11:00:00Z" },
      {
        id: "h3",
        event: "Cambio de estado",
        from_state: "Nuevo",
        to_state: "Contactado",
        created_at: "2026-07-17T16:41:00Z",
      },
    ],
    created_at: "2026-07-16T11:00:00Z",
    updated_at: "2026-07-17T16:41:00Z",
  },
  {
    id: "sample-3",
    name: "Anaïs Prieto",
    email: "anais.p@example.com",
    source: "ig",
    state: "Agendado",
    interest: "Curso La Mujer",
    notes: [],
    history: [{ id: "h4", event: "Llamada agendada para el 22/07", created_at: "2026-07-18T12:00:00Z" }],
    created_at: "2026-07-15T08:00:00Z",
    updated_at: "2026-07-18T12:00:00Z",
  },
  {
    id: "sample-4",
    name: "Diego Santos",
    phone: "+34 622 555 666",
    source: "web",
    state: "Asistió",
    interest: "Programa Transfórmate",
    notes: [],
    history: [{ id: "h5", event: "Asistió a la llamada de valoración", created_at: "2026-07-14T18:00:00Z" }],
    created_at: "2026-07-10T10:00:00Z",
    updated_at: "2026-07-14T18:00:00Z",
  },
  {
    id: "sample-5",
    name: "Paula Gómez",
    email: "paulag@example.com",
    source: "web",
    state: "Ganado",
    interest: "Asesoría 1:1",
    notes: [{ id: "n2", body: "Contrató el plan trimestral.", author: "Staff", created_at: "2026-07-12T10:20:00Z" }],
    history: [{ id: "h6", event: "Cliente ganado 🎉", created_at: "2026-07-12T10:20:00Z" }],
    created_at: "2026-07-05T09:00:00Z",
    updated_at: "2026-07-12T10:20:00Z",
  },
  {
    id: "sample-6",
    name: "Iván Torres",
    email: "ivan.torres@example.com",
    source: "ig",
    state: "Perdido",
    interest: "Curso La Mujer",
    notes: [
      { id: "n3", body: "No encaja el presupuesto ahora mismo.", author: "Staff", created_at: "2026-07-11T15:00:00Z" },
    ],
    history: [{ id: "h7", event: "Marcado como perdido", created_at: "2026-07-11T15:00:00Z" }],
    created_at: "2026-07-02T13:00:00Z",
    updated_at: "2026-07-11T15:00:00Z",
  },
];

// Copia mutable en memoria para que mover tarjetas / editar funcione en demo.
let sampleStore: Lead[] | null = null;
function getSampleStore(): Lead[] {
  sampleStore ??= SAMPLE_LEADS.map((l) => ({ ...l, notes: [...l.notes], history: [...l.history] }));
  return sampleStore;
}

const nowIso = () => new Date().toISOString();

function applyFilters(leads: Lead[], query?: LeadsQuery): Lead[] {
  let out = leads;
  if (query?.source && query.source !== "all") out = out.filter((l) => l.source === query.source);
  if (query?.state && query.state !== "all") out = out.filter((l) => l.state === query.state);
  if (query?.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    out = out.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.interest?.toLowerCase().includes(q),
    );
  }
  return out;
}

export class LeadsService {
  private static authHeaders(json = true): Record<string, string> {
    const token = getAuthToken() ?? (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);
    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private static async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, init);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? body.error ?? `Error ${res.status}`);
    }
    return res.json();
  }

  static async getLeads(query?: LeadsQuery): Promise<Lead[]> {
    if (!LEADS_API_READY) {
      return applyFilters(getSampleStore(), query);
    }
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.source && query.source !== "all") params.set("source", query.source);
    if (query?.state && query.state !== "all") params.set("state", query.state);
    const qs = params.toString();
    const data = await this.request<any>(`/api/v1/admin-panel/leads${qs ? `?${qs}` : ""}`, {
      headers: this.authHeaders(),
    });
    return Array.isArray(data) ? data : (data.data ?? data.leads ?? []);
  }

  static async createLead(input: CreateLeadInput): Promise<Lead> {
    if (!LEADS_API_READY) {
      const lead: Lead = {
        id: `sample-${Date.now()}`,
        name: input.name,
        email: input.email,
        phone: input.phone,
        source: input.source,
        state: input.state ?? "Nuevo",
        interest: input.interest,
        notes: [],
        history: [{ id: `h-${Date.now()}`, event: "Lead creado", created_at: nowIso() }],
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      getSampleStore().unshift(lead);
      return lead;
    }
    return this.request<Lead>(`/api/v1/admin-panel/leads`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(input),
    });
  }

  static async updateLeadState(id: string, state: LeadState): Promise<Lead> {
    if (!LEADS_API_READY) {
      const store = getSampleStore();
      const lead = store.find((l) => l.id === id);
      if (!lead) throw new Error("Lead no encontrado");
      if (lead.state !== state) {
        lead.history.push({
          id: `h-${Date.now()}`,
          event: "Cambio de estado",
          from_state: lead.state,
          to_state: state,
          created_at: nowIso(),
        });
        lead.state = state;
        lead.updated_at = nowIso();
      }
      return { ...lead };
    }
    return this.request<Lead>(`/api/v1/admin-panel/leads/${id}`, {
      method: "PUT",
      headers: this.authHeaders(),
      body: JSON.stringify({ state }),
    });
  }

  static async addNote(id: string, body: string): Promise<LeadNote> {
    if (!LEADS_API_READY) {
      const lead = getSampleStore().find((l) => l.id === id);
      if (!lead) throw new Error("Lead no encontrado");
      const note: LeadNote = { id: `n-${Date.now()}`, body, author: "Tú", created_at: nowIso() };
      lead.notes.unshift(note);
      lead.history.push({ id: `h-${Date.now()}`, event: "Nota añadida", created_at: nowIso() });
      lead.updated_at = nowIso();
      return note;
    }
    return this.request<LeadNote>(`/api/v1/admin-panel/leads/${id}/notes`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify({ body }),
    });
  }

  /**
   * Importa leads desde un CSV. Cabeceras aceptadas (flexible):
   * name/nombre, email/correo, phone/telefono, source/origen, state/estado, interest/interes.
   * Con el backend apagado, parsea en cliente y los añade al store de ejemplo.
   */
  static async importCsv(file: File): Promise<{ imported: number; errors: string[] }> {
    if (!LEADS_API_READY) {
      const text = await file.text();
      const { rows, errors } = parseLeadsCsv(text);
      for (const r of rows) {
        await this.createLead(r);
      }
      return { imported: rows.length, errors };
    }
    const form = new FormData();
    form.append("file", file);
    return this.request<{ imported: number; errors: string[] }>(`/api/v1/admin-panel/leads/import`, {
      method: "POST",
      headers: this.authHeaders(false),
      body: form,
    });
  }
}

// ─── Parser CSV mínimo (sin dependencias) ────────────────────────────────────
const SOURCE_ALIASES: Record<string, LeadSource> = {
  web: "web",
  website: "web",
  formulario: "web",
  ig: "ig",
  instagram: "ig",
  insta: "ig",
};

function normalizeState(v: string): LeadState | undefined {
  const found = LEAD_STATES.find((s) => s.toLowerCase() === v.trim().toLowerCase());
  return found;
}

/** Divide una línea CSV respetando comillas dobles. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export function parseLeadsCsv(text: string): { rows: CreateLeadInput[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { rows: [], errors: ["El archivo está vacío."] };

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (names: string[]) => headers.findIndex((h) => names.includes(h));
  const iName = idx(["name", "nombre"]);
  const iEmail = idx(["email", "correo", "e-mail"]);
  const iPhone = idx(["phone", "telefono", "teléfono", "móvil", "movil"]);
  const iSource = idx(["source", "origen"]);
  const iState = idx(["state", "estado"]);
  const iInterest = idx(["interest", "interes", "interés", "programa"]);

  if (iName === -1) {
    return { rows: [], errors: ["Falta la columna obligatoria «name» (o «nombre»)."] };
  }

  const rows: CreateLeadInput[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = splitCsvLine(lines[r]);
    const name = cols[iName]?.trim();
    if (!name) {
      errors.push(`Fila ${r + 1}: sin nombre, omitida.`);
      continue;
    }
    const sourceRaw = (iSource >= 0 ? cols[iSource] : "").trim().toLowerCase();
    const source = SOURCE_ALIASES[sourceRaw] ?? "web";
    rows.push({
      name,
      email: iEmail >= 0 ? cols[iEmail]?.trim() || undefined : undefined,
      phone: iPhone >= 0 ? cols[iPhone]?.trim() || undefined : undefined,
      source,
      state: iState >= 0 ? normalizeState(cols[iState] ?? "") : undefined,
      interest: iInterest >= 0 ? cols[iInterest]?.trim() || undefined : undefined,
    });
  }
  return { rows, errors };
}
