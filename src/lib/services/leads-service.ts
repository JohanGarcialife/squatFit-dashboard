import { getAuthToken } from "@/lib/auth/auth-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-985835765452.europe-southwest1.run.app";

// ============================================================================
// CRM — LEADS (13.13 · Fase 10)
// ----------------------------------------------------------------------------
// Backend v1 (lote 4, EN PROD desde el 20-jul-2026):
//   • GET    /api/v1/admin-panel/leads                (lista)
//   • POST   /api/v1/admin-panel/leads                (crear)
//   • PUT    /api/v1/admin-panel/leads/:id            (actualizar; incl. estado)
//   • DELETE /api/v1/admin-panel/leads/:id            (borrar)
//   • POST   /api/v1/admin-panel/leads/import         (importar CSV; multipart)
//   • POST   /api/v1/admin-panel/leads/:id/notes      (añadir nota)
//
// Contrato v2 (Fase 9, backend en paralelo — AÚN NO publicado):
//   • status ampliado: `realizada` (llamada hecha) y `esperando_pago`
//     (+ `seguimiento` para repesca; ver decisión abajo)
//   • campos nuevos por lead: `objection`, `intake_date`, `converted_user_id`,
//     `is_customer`
//   • POST /api/v1/admin-panel/leads/:id/convert      (convertir en cliente)
//
// Sondeo 20-jul-2026: `/admin-panel/leads` responde 401 (existe, v1);
// `/admin-panel/leads/:id/convert` responde 404 (no existe todavía).
//
// Estrategia de encendido:
//   • Los campos v2 se AUTODETECTAN: si el GET devuelve leads con `objection`/
//     `intake_date`/`is_customer`, se habilita la escritura v2 sola. Además
//     `LEADS_V2_WRITE_READY` fuerza el encendido manual si hiciera falta.
//   • Mientras no haya v2: «Llamada hecha» se escribe como el estado legado
//     «Asistió» (equivalente semántico que el v1 sí acepta); «Esperando pago»
//     y «Seguimiento» no se pueden persistir (error claro al usuario) y la
//     objeción no es editable contra la API real.
//   • `?demo=1` en /dashboard/leads fuerza los datos de ejemplo (cubren ambos
//     kanbans) aunque la API real esté activa, para poder revisar la UI de
//     Fase 10 antes de que Fase 9 publique.
// ============================================================================

/** Interruptor global: `true` cuando el backend de leads esté desplegado. */
export const LEADS_API_READY = true; // encendido 20-jul-2026 (backend lote 4 en prod);

/**
 * Escritura del contrato v2 (Fase 9): estados `realizada`/`esperando_pago`/
 * `seguimiento` y campo `objection` en el PUT. Se autodetecta cuando el GET
 * devuelve los campos nuevos; esta constante solo fuerza el encendido manual.
 */
export const LEADS_V2_WRITE_READY = false;

/** `POST /admin-panel/leads/:id/convert` — 404 en prod a 20-jul-2026. */
export const LEAD_CONVERT_READY = false;

/** Columnas del kanban «Pipeline comercial» (en orden). */
export const PIPELINE_STATES = [
  "Nuevo",
  "Contactado",
  "Agendado",
  "Llamada hecha",
  "Esperando pago",
  "Ganado",
  "Perdido",
] as const;

/**
 * Todos los estados posibles de un lead. «Seguimiento» no es columna del
 * pipeline: es el aparcadero de repesca (junto a «Perdido») y se asigna desde
 * el panel del lead. Decisión Fase 10: el contrato de Fase 9 solo lista
 * `realizada`/`esperando_pago` como estados nuevos; si `seguimiento` no llega
 * a existir en backend, simplemente ningún lead tendrá ese estado y la
 * repesca mostrará solo «Perdido» (sin romper nada).
 */
export const LEAD_STATES = [...PIPELINE_STATES, "Seguimiento"] as const;
export type LeadState = (typeof LEAD_STATES)[number];

/** Estados que entran en el kanban «Repesca». */
export const REPESCA_STATES: readonly LeadState[] = ["Perdido", "Seguimiento"];

/** Orígenes soportados por el filtro. */
export const LEAD_SOURCES = ["web", "ig"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  web: "Web",
  ig: "Instagram",
};

/** Objeciones de venta (contrato Fase 9) — agrupan el kanban «Repesca». */
export const LEAD_OBJECTIONS = ["precio", "timing", "confianza", "otros"] as const;
export type LeadObjection = (typeof LEAD_OBJECTIONS)[number];

export const LEAD_OBJECTION_LABEL: Record<LeadObjection, string> = {
  precio: "Precio",
  timing: "Timing / Pospone",
  confianza: "Confianza",
  otros: "Otros",
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
  /** Objeción de venta (repesca). */
  objection?: LeadObjection;
  /** Fecha de ingreso del lead — ordena tarjetas y listado (fallback: created_at). */
  intake_date: string;
  /** El lead ya se convirtió en cliente (Fase 9). */
  is_customer: boolean;
  /** Usuario creado al convertir → enlaza a /dashboard/alumnos/:id. */
  converted_user_id?: string;
  /** Setter asignado (solo filtro; el contrato de Fase 9 no lo incluye aún). */
  setter?: string;
  /** Closer asignado (solo filtro; el contrato de Fase 9 no lo incluye aún). */
  closer?: string;
  notes: LeadNote[];
  history: LeadHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface LeadsQuery {
  search?: string;
  source?: LeadSource | "all";
  state?: LeadState | "all";
  /** Fuerza los datos de ejemplo aunque la API esté activa (`?demo=1`). */
  demo?: boolean;
}

export interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  state?: LeadState;
  interest?: string;
  objection?: LeadObjection;
  setter?: string;
  closer?: string;
}

export interface UpdateLeadInput {
  state?: LeadState;
  /** `null` limpia la objeción. */
  objection?: LeadObjection | null;
}

// ─── Normalización estado/objeción (tolerante a v1, v2 y CSVs) ───────────────

const STATE_ALIASES: Record<string, LeadState> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  agendado: "Agendado",
  // «Asistió» (v1) ≡ «Llamada hecha» (v2 `realizada`)
  asistio: "Llamada hecha",
  asistió: "Llamada hecha",
  realizada: "Llamada hecha",
  "llamada hecha": "Llamada hecha",
  llamada_hecha: "Llamada hecha",
  "esperando pago": "Esperando pago",
  esperando_pago: "Esperando pago",
  ganado: "Ganado",
  perdido: "Perdido",
  seguimiento: "Seguimiento",
};

/** Estado desde la API o un CSV (v1 «Asistió», v2 `realizada`, etc.). */
export function normalizeLeadState(value: unknown): LeadState | undefined {
  if (typeof value !== "string") return undefined;
  return STATE_ALIASES[value.trim().toLowerCase()];
}

const OBJECTION_ALIASES: Record<string, LeadObjection> = {
  precio: "precio",
  price: "precio",
  caro: "precio",
  timing: "timing",
  pospone: "timing",
  "timing/pospone": "timing",
  "timing / pospone": "timing",
  tiempo: "timing",
  confianza: "confianza",
  trust: "confianza",
  otros: "otros",
  otro: "otros",
  other: "otros",
};

export function normalizeLeadObjection(value: unknown): LeadObjection | undefined {
  if (typeof value !== "string") return undefined;
  return OBJECTION_ALIASES[value.trim().toLowerCase()];
}

const SOURCE_ALIASES: Record<string, LeadSource> = {
  web: "web",
  website: "web",
  formulario: "web",
  ig: "ig",
  instagram: "ig",
  insta: "ig",
};

// ─── Detección runtime de los campos v2 (Fase 9) ─────────────────────────────

let leadsV2Detected = false;

/** ¿El GET de leads ya devuelve los campos del contrato de Fase 9? */
export function leadsApiHasV2Fields(): boolean {
  return leadsV2Detected;
}

/** ¿Podemos escribir estados/objeción v2 contra la API real? */
export function leadsV2WritesEnabled(): boolean {
  return LEADS_V2_WRITE_READY || leadsV2Detected;
}

function detectV2Fields(raw: unknown): void {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if ("objection" in o || "intake_date" in o || "is_customer" in o || "converted_user_id" in o) {
      leadsV2Detected = true;
    }
  }
}

/** Tolerante a alias de campo entre v1 y v2. */
function normalizeLead(raw: any): Lead {
  const created = raw.created_at ?? raw.createdAt ?? nowIso();
  return {
    id: String(raw.id),
    name: raw.name ?? "(sin nombre)",
    email: raw.email ?? undefined,
    phone: raw.phone ?? undefined,
    source: SOURCE_ALIASES[String(raw.source ?? "").toLowerCase()] ?? "web",
    state: normalizeLeadState(raw.state ?? raw.status) ?? "Nuevo",
    interest: raw.interest ?? undefined,
    objection: normalizeLeadObjection(raw.objection),
    intake_date: raw.intake_date ?? raw.intakeDate ?? created,
    is_customer: Boolean(raw.is_customer ?? raw.isCustomer ?? raw.converted_user_id),
    converted_user_id: raw.converted_user_id ?? raw.convertedUserId ?? undefined,
    setter: raw.setter ?? raw.setter_name ?? undefined,
    closer: raw.closer ?? raw.closer_name ?? undefined,
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    history: Array.isArray(raw.history) ? raw.history : [],
    created_at: created,
    updated_at: raw.updated_at ?? raw.updatedAt ?? created,
  };
}

/**
 * Estado UI → valor que la API acepta HOY. Sin v2, «Llamada hecha» se escribe
 * como «Asistió» (equivalente v1); «Esperando pago»/«Seguimiento» no se pueden
 * persistir todavía → error claro (la tarjeta vuelve a su columna).
 */
function stateToApi(state: LeadState): string {
  if (leadsV2WritesEnabled()) {
    if (state === "Llamada hecha") return "realizada";
    if (state === "Esperando pago") return "esperando_pago";
    if (state === "Seguimiento") return "seguimiento";
    return state;
  }
  if (state === "Llamada hecha") return "Asistió";
  if (state === "Esperando pago" || state === "Seguimiento") {
    throw new Error(`El estado «${state}» se activará cuando el backend (Fase 9) publique el nuevo contrato de leads.`);
  }
  return state;
}

// ─── Datos de ejemplo (con `!LEADS_API_READY` o `?demo=1`) ───────────────────
// Cubren los DOS kanbans: los 7 estados del pipeline + «Seguimiento», las 4
// objeciones, leads >30 días para el filtro de repesca, un convertido en
// cliente y setters/closers para los filtros.
const SAMPLE_LEADS: Lead[] = [
  {
    id: "sample-1",
    name: "Lucía Fernández",
    email: "lucia.fer@example.com",
    phone: "+34 600 111 222",
    source: "ig",
    state: "Nuevo",
    interest: "Programa Transfórmate",
    intake_date: "2026-07-19T10:30:00Z",
    is_customer: false,
    setter: "María",
    notes: [],
    history: [{ id: "h1", event: "Lead creado desde Instagram (DM)", created_at: "2026-07-19T10:30:00Z" }],
    created_at: "2026-07-19T10:30:00Z",
    updated_at: "2026-07-19T10:30:00Z",
  },
  {
    id: "sample-2",
    name: "Carla Jiménez",
    email: "carlajim@example.com",
    source: "web",
    state: "Nuevo",
    interest: "Curso La Mujer",
    intake_date: "2026-07-17T08:05:00Z",
    is_customer: false,
    setter: "Laura",
    notes: [],
    history: [{ id: "h2", event: "Lead creado desde formulario web", created_at: "2026-07-17T08:05:00Z" }],
    created_at: "2026-07-17T08:05:00Z",
    updated_at: "2026-07-17T08:05:00Z",
  },
  {
    id: "sample-3",
    name: "Marcos Ruiz",
    email: "marcosruiz@example.com",
    phone: "+34 611 333 444",
    source: "web",
    state: "Contactado",
    interest: "Asesoría 1:1",
    intake_date: "2026-07-16T11:00:00Z",
    is_customer: false,
    setter: "María",
    notes: [
      { id: "n1", body: "Le envié el enlace de la llamada.", author: "Staff", created_at: "2026-07-17T16:40:00Z" },
    ],
    history: [
      { id: "h3", event: "Lead creado desde formulario web", created_at: "2026-07-16T11:00:00Z" },
      {
        id: "h4",
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
    id: "sample-4",
    name: "Anaïs Prieto",
    email: "anais.p@example.com",
    source: "ig",
    state: "Agendado",
    interest: "Curso La Mujer",
    intake_date: "2026-07-15T08:00:00Z",
    is_customer: false,
    setter: "Laura",
    closer: "Hamlet",
    notes: [],
    history: [{ id: "h5", event: "Llamada agendada para el 22/07", created_at: "2026-07-18T12:00:00Z" }],
    created_at: "2026-07-15T08:00:00Z",
    updated_at: "2026-07-18T12:00:00Z",
  },
  {
    id: "sample-5",
    name: "Diego Santos",
    phone: "+34 622 555 666",
    source: "web",
    state: "Llamada hecha",
    interest: "Programa Transfórmate",
    intake_date: "2026-07-10T10:00:00Z",
    is_customer: false,
    setter: "María",
    closer: "Hamlet",
    notes: [],
    history: [{ id: "h6", event: "Llamada de valoración realizada", created_at: "2026-07-14T18:00:00Z" }],
    created_at: "2026-07-10T10:00:00Z",
    updated_at: "2026-07-14T18:00:00Z",
  },
  {
    id: "sample-6",
    name: "Nerea Campos",
    email: "nerea.campos@example.com",
    phone: "+34 633 777 888",
    source: "ig",
    state: "Esperando pago",
    interest: "Programa Transfórmate",
    intake_date: "2026-07-08T09:30:00Z",
    is_customer: false,
    setter: "Laura",
    closer: "Hamlet",
    notes: [
      {
        id: "n2",
        body: "Enlace de pago enviado tras la llamada.",
        author: "Staff",
        created_at: "2026-07-16T13:00:00Z",
      },
    ],
    history: [{ id: "h7", event: "Esperando el pago del programa", created_at: "2026-07-16T13:00:00Z" }],
    created_at: "2026-07-08T09:30:00Z",
    updated_at: "2026-07-16T13:00:00Z",
  },
  {
    id: "sample-7",
    name: "Paula Gómez",
    email: "paulag@example.com",
    source: "web",
    state: "Ganado",
    interest: "Asesoría 1:1",
    intake_date: "2026-07-05T09:00:00Z",
    is_customer: true,
    converted_user_id: "sample-user-paula",
    setter: "María",
    closer: "Hamlet",
    notes: [{ id: "n3", body: "Contrató el plan trimestral.", author: "Staff", created_at: "2026-07-12T10:20:00Z" }],
    history: [{ id: "h8", event: "Cliente ganado 🎉", created_at: "2026-07-12T10:20:00Z" }],
    created_at: "2026-07-05T09:00:00Z",
    updated_at: "2026-07-12T10:20:00Z",
  },
  {
    id: "sample-8",
    name: "Iván Torres",
    email: "ivan.torres@example.com",
    source: "ig",
    state: "Perdido",
    interest: "Curso La Mujer",
    objection: "precio",
    intake_date: "2026-07-02T13:00:00Z",
    is_customer: false,
    setter: "Laura",
    closer: "Hamlet",
    notes: [
      { id: "n4", body: "No encaja el presupuesto ahora mismo.", author: "Staff", created_at: "2026-07-11T15:00:00Z" },
    ],
    history: [{ id: "h9", event: "Marcado como perdido (precio)", created_at: "2026-07-11T15:00:00Z" }],
    created_at: "2026-07-02T13:00:00Z",
    updated_at: "2026-07-11T15:00:00Z",
  },
  {
    id: "sample-9",
    name: "Sonia Vidal",
    email: "sonia.vidal@example.com",
    phone: "+34 644 222 333",
    source: "web",
    state: "Perdido",
    interest: "Programa Transfórmate",
    objection: "timing",
    intake_date: "2026-06-05T10:00:00Z",
    is_customer: false,
    setter: "María",
    notes: [
      { id: "n5", body: "Quiere empezar después del verano.", author: "Staff", created_at: "2026-06-12T09:00:00Z" },
    ],
    history: [{ id: "h10", event: "Pospone la decisión a septiembre", created_at: "2026-06-12T09:00:00Z" }],
    created_at: "2026-06-05T10:00:00Z",
    updated_at: "2026-06-12T09:00:00Z",
  },
  {
    id: "sample-10",
    name: "Rubén Ortega",
    phone: "+34 655 444 555",
    source: "ig",
    state: "Perdido",
    interest: "Asesoría 1:1",
    objection: "confianza",
    intake_date: "2026-05-20T17:00:00Z",
    is_customer: false,
    setter: "Laura",
    closer: "Hamlet",
    notes: [],
    history: [{ id: "h11", event: "Duda de los resultados; pide referencias", created_at: "2026-05-28T11:00:00Z" }],
    created_at: "2026-05-20T17:00:00Z",
    updated_at: "2026-05-28T11:00:00Z",
  },
  {
    id: "sample-11",
    name: "Elena Sanz",
    email: "elenasanz@example.com",
    source: "web",
    state: "Perdido",
    interest: "Curso La Mujer",
    intake_date: "2026-06-28T12:00:00Z",
    is_customer: false,
    setter: "María",
    notes: [],
    history: [{ id: "h12", event: "No respondió tras dos intentos", created_at: "2026-07-06T10:00:00Z" }],
    created_at: "2026-06-28T12:00:00Z",
    updated_at: "2026-07-06T10:00:00Z",
  },
  {
    id: "sample-12",
    name: "Javier Molina",
    email: "javimolina@example.com",
    phone: "+34 666 888 999",
    source: "ig",
    state: "Seguimiento",
    interest: "Programa Transfórmate",
    objection: "precio",
    intake_date: "2026-06-10T09:00:00Z",
    is_customer: false,
    setter: "Laura",
    closer: "Hamlet",
    notes: [
      {
        id: "n6",
        body: "Retomar cuando salga la promo de agosto.",
        author: "Staff",
        created_at: "2026-06-20T16:00:00Z",
      },
    ],
    history: [{ id: "h13", event: "Pasa a seguimiento (campaña agosto)", created_at: "2026-06-20T16:00:00Z" }],
    created_at: "2026-06-10T09:00:00Z",
    updated_at: "2026-06-20T16:00:00Z",
  },
  {
    id: "sample-13",
    name: "Marta Iglesias",
    email: "marta.igl@example.com",
    source: "web",
    state: "Seguimiento",
    interest: "Asesoría 1:1",
    objection: "otros",
    intake_date: "2026-07-01T15:00:00Z",
    is_customer: false,
    setter: "María",
    notes: [],
    history: [{ id: "h14", event: "Pendiente de decidir con su pareja", created_at: "2026-07-09T18:00:00Z" }],
    created_at: "2026-07-01T15:00:00Z",
    updated_at: "2026-07-09T18:00:00Z",
  },
];

// Copia mutable en memoria para que mover tarjetas / editar funcione en demo.
let sampleStore: Lead[] | null = null;
function getSampleStore(): Lead[] {
  sampleStore ??= SAMPLE_LEADS.map((l) => ({ ...l, notes: [...l.notes], history: [...l.history] }));
  return sampleStore;
}

/** Los ids del store de ejemplo llevan este prefijo; sus mutaciones son locales. */
function isSampleId(id: string): boolean {
  return id.startsWith("sample-");
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
    if (!LEADS_API_READY || query?.demo) {
      // Copias frescas: el store es mutable y, si devolviéramos las mismas
      // referencias, react-query/useMemo no verían los cambios tras mutar.
      return applyFilters(getSampleStore(), query).map((l) => ({ ...l, notes: [...l.notes], history: [...l.history] }));
    }
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.source && query.source !== "all") params.set("source", query.source);
    if (query?.state && query.state !== "all") params.set("state", query.state);
    const qs = params.toString();
    const data = await this.request<any>(`/api/v1/admin-panel/leads${qs ? `?${qs}` : ""}`, {
      headers: this.authHeaders(),
    });
    const raw: any[] = Array.isArray(data) ? data : (data.data ?? data.leads ?? []);
    raw.forEach(detectV2Fields);
    // Refiltra en cliente por si el backend ignora algún parámetro.
    return applyFilters(raw.map(normalizeLead), query);
  }

  static async createLead(input: CreateLeadInput, opts?: { demo?: boolean }): Promise<Lead> {
    if (!LEADS_API_READY || opts?.demo) {
      const now = nowIso();
      const lead: Lead = {
        id: `sample-${Date.now()}`,
        name: input.name,
        email: input.email,
        phone: input.phone,
        source: input.source,
        state: input.state ?? "Nuevo",
        interest: input.interest,
        objection: input.objection,
        intake_date: now,
        is_customer: false,
        setter: input.setter,
        closer: input.closer,
        notes: [],
        history: [{ id: `h-${Date.now()}`, event: "Lead creado", created_at: now }],
        created_at: now,
        updated_at: now,
      };
      getSampleStore().unshift(lead);
      return lead;
    }
    // El DTO v1 valida con forbidNonWhitelisted: los campos v2 (objection) y
    // los que no están en ningún contrato (setter/closer) solo se envían
    // cuando la escritura v2 está habilitada — si no, 400.
    const body: Record<string, unknown> = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      source: input.source,
      interest: input.interest,
      ...(input.state ? { state: stateToApi(input.state) } : {}),
      ...(leadsV2WritesEnabled() && input.objection ? { objection: input.objection } : {}),
    };
    const raw = await this.request<any>(`/api/v1/admin-panel/leads`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    });
    detectV2Fields(raw);
    return normalizeLead(raw);
  }

  /** Actualiza estado y/o objeción del lead. */
  static async updateLead(id: string, patch: UpdateLeadInput): Promise<Lead> {
    if (!LEADS_API_READY || isSampleId(id)) {
      const lead = getSampleStore().find((l) => l.id === id);
      if (!lead) throw new Error("Lead no encontrado");
      if (patch.state && patch.state !== lead.state) {
        lead.history.push({
          id: `h-${Date.now()}`,
          event: "Cambio de estado",
          from_state: lead.state,
          to_state: patch.state,
          created_at: nowIso(),
        });
        lead.state = patch.state;
      }
      if (patch.objection !== undefined) {
        const next = patch.objection ?? undefined;
        if (next !== lead.objection) {
          lead.history.push({
            id: `h-${Date.now()}-o`,
            event: next ? `Objeción: ${LEAD_OBJECTION_LABEL[next]}` : "Objeción retirada",
            created_at: nowIso(),
          });
          lead.objection = next;
        }
      }
      lead.updated_at = nowIso();
      return { ...lead };
    }

    if (patch.objection !== undefined && !leadsV2WritesEnabled()) {
      throw new Error("La objeción se guardará cuando el backend (Fase 9) publique el nuevo contrato de leads.");
    }
    const body: Record<string, unknown> = {
      ...(patch.state ? { state: stateToApi(patch.state) } : {}),
      ...(patch.objection !== undefined ? { objection: patch.objection } : {}),
    };
    const raw = await this.request<any>(`/api/v1/admin-panel/leads/${id}`, {
      method: "PUT",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
    });
    detectV2Fields(raw);
    return normalizeLead(raw);
  }

  /** Compatibilidad: cambio de estado (kanban / panel). */
  static async updateLeadState(id: string, state: LeadState): Promise<Lead> {
    return this.updateLead(id, { state });
  }

  /**
   * Convierte el lead en cliente (crea/enlaza el usuario en backend).
   * `POST /admin-panel/leads/:id/convert` — tras `LEAD_CONVERT_READY` hasta
   * que Fase 9 lo publique (hoy 404).
   */
  static async convertLead(id: string): Promise<Lead> {
    if (!LEADS_API_READY || isSampleId(id)) {
      const lead = getSampleStore().find((l) => l.id === id);
      if (!lead) throw new Error("Lead no encontrado");
      lead.is_customer = true;
      lead.converted_user_id ??= `sample-user-${id}`;
      lead.state = "Ganado";
      lead.history.push({ id: `h-${Date.now()}`, event: "Convertido en cliente ✅", created_at: nowIso() });
      lead.updated_at = nowIso();
      return { ...lead };
    }
    if (!LEAD_CONVERT_READY) {
      throw new Error("«Convertir en cliente» se activará cuando el backend (Fase 9) publique el endpoint.");
    }
    const raw = await this.request<any>(`/api/v1/admin-panel/leads/${id}/convert`, {
      method: "POST",
      headers: this.authHeaders(),
    });
    detectV2Fields(raw);
    return normalizeLead(raw);
  }

  static async addNote(id: string, body: string): Promise<LeadNote> {
    if (!LEADS_API_READY || isSampleId(id)) {
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
   * name/nombre, email/correo, phone/telefono, source/origen, state/estado,
   * interest/interes, objection/objecion, setter, closer.
   * Con el backend apagado (o en demo), parsea en cliente y alimenta el store.
   */
  static async importCsv(file: File, opts?: { demo?: boolean }): Promise<{ imported: number; errors: string[] }> {
    if (!LEADS_API_READY || opts?.demo) {
      const text = await file.text();
      const { rows, errors } = parseLeadsCsv(text);
      for (const r of rows) {
        await this.createLead(r, { demo: true });
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

// ─── Export CSV (repesca → campañas de recuperación) ─────────────────────────

function csvCell(value: string | undefined): string {
  const v = value ?? "";
  return /[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Genera un CSV (con BOM para Excel) con los leads seleccionados. */
export function leadsToCsv(leads: Lead[]): string {
  const header = ["nombre", "email", "telefono", "origen", "interes", "estado", "objecion", "alta", "setter", "closer"];
  const rows = leads.map((l) =>
    [
      l.name,
      l.email,
      l.phone,
      LEAD_SOURCE_LABEL[l.source],
      l.interest,
      l.state,
      l.objection ? LEAD_OBJECTION_LABEL[l.objection] : "",
      new Date(l.intake_date).toLocaleDateString("es-ES"),
      l.setter,
      l.closer,
    ]
      .map(csvCell)
      .join(","),
  );
  return `\uFEFF${header.join(",")}\n${rows.join("\n")}`;
}

// ─── Parser CSV mínimo (sin dependencias) ────────────────────────────────────

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
  const iObjection = idx(["objection", "objecion", "objeción"]);
  const iSetter = idx(["setter"]);
  const iCloser = idx(["closer"]);

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
      state: iState >= 0 ? normalizeLeadState(cols[iState]) : undefined,
      interest: iInterest >= 0 ? cols[iInterest]?.trim() || undefined : undefined,
      objection: iObjection >= 0 ? normalizeLeadObjection(cols[iObjection]) : undefined,
      setter: iSetter >= 0 ? cols[iSetter]?.trim() || undefined : undefined,
      closer: iCloser >= 0 ? cols[iCloser]?.trim() || undefined : undefined,
    });
  }
  return { rows, errors };
}
