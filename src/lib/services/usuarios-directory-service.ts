import { getAuthToken } from "@/lib/auth/auth-utils";

// ============================================================================
// Directorio de usuarios (tabla Usuarios del diseño).
// Endpoint: /api/v1/admin-panel/users-directory
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const REQUEST_TIMEOUT = 15000;

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address?: string;
  apartment?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  dni_cif?: string;
  notes?: string;
}

export interface UsuarioDirectorioApi {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  phone_number: string | null;
  role_name: string | null;
  assigned: { name: string; type: string }[];
  segments: string[];
  shipping_address?: ShippingAddress | null;
  created_at?: string;
}

export interface UsuarioDirectorio {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  roleName: string;
  assigned: { name: string; type: string }[];
  segments: string[];
  /** Última dirección de envío usada en un pedido, formateada en una línea. */
  address: string;
  createdAt: string | null;
}

/** "Calle Mayor 12, 3.º B, 28013 Madrid, ES" a partir del JSON del pedido. */
export function formatShippingAddress(a?: ShippingAddress | null): string {
  if (!a) return "—";
  const cityLine = [a.postalCode, a.city].filter(Boolean).join(" ");
  return [a.address, a.apartment, cityLine, a.country].filter(Boolean).join(", ") || "—";
}

export interface UsuariosDirectoryCounts {
  all: number;
  admins: number;
  subscribers: number;
  students: number;
}

export interface UsuariosDirectoryResult {
  usuarios: UsuarioDirectorio[];
  total: number;
  counts: UsuariosDirectoryCounts;
}

export type UsuariosTab = "all" | "admin" | "subscriber" | "student";

export interface GetUsuariosDirectoryParams {
  tab?: UsuariosTab;
  search?: string;
  page?: number;
  limit?: number;
}

export class UsuariosDirectoryService {
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  private static async makeRequest<T>(endpoint: string): Promise<T> {
    const token = getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getDefaultHeaders(token),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        throw new Error(err.message ?? `Error ${res.status}`);
      }
      return res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === "AbortError") throw new Error("La petición tardó demasiado");
      throw e;
    }
  }

  private static transform(api: UsuarioDirectorioApi): UsuarioDirectorio {
    const name = [api.firstName, api.lastName].filter(Boolean).join(" ") || (api.username ?? "Sin nombre");
    return {
      id: api.id,
      name,
      email: api.email,
      username: api.username ?? "—",
      phone: api.phone_number ?? "—",
      roleName: api.role_name ?? "—",
      assigned: api.assigned ?? [],
      segments: api.segments ?? [],
      address: formatShippingAddress(api.shipping_address),
      createdAt: api.created_at ?? null,
    };
  }

  static async getDirectory(params: GetUsuariosDirectoryParams = {}): Promise<UsuariosDirectoryResult> {
    const qs = new URLSearchParams();
    if (params.tab && params.tab !== "all") qs.set("tab", params.tab);
    if (params.search) qs.set("search", params.search);
    qs.set("page", String(params.page ?? 1));
    qs.set("limit", String(params.limit ?? 50));
    const res = await this.makeRequest<{
      data: UsuarioDirectorioApi[];
      total: number;
      counts: UsuariosDirectoryCounts;
    }>(`/api/v1/admin-panel/users-directory?${qs.toString()}`);
    return {
      usuarios: (res.data ?? []).map((u) => this.transform(u)),
      total: res.total ?? 0,
      counts: res.counts ?? { all: 0, admins: 0, subscribers: 0, students: 0 },
    };
  }
}
