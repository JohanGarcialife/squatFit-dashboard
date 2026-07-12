import { getAuthToken } from "@/lib/auth/auth-utils";

// ============================================================================
// Servicio de PRODUCTOS SUELTOS del catálogo (tabla `products` del backend).
// Endpoints: /api/v1/admin-panel/products
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const REQUEST_TIMEOUT = 10000;

export interface ProductApi {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  currency: string;
  type: string; // product | subscription
  area?: string | null; // cursos | cocina | planes | libros | otros
  billing_period?: string | null;
  stripe_price_id?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Producto {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  area: string;
  billingPeriod: string | null;
  stripePriceId: string | null;
  active: boolean;
  createdAt: string | null;
}

export interface CreateProductoDto {
  name: string;
  description?: string;
  price: string;
  currency?: string;
  type?: string;
  area?: string;
  billing_period?: string;
  stripe_price_id?: string;
}

export type UpdateProductoDto = Partial<CreateProductoDto> & { active?: boolean };

export class ProductsService {
  private static getDefaultHeaders(token: string | null): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (typeof window !== "undefined") {
      try {
        const t = localStorage.getItem("authToken");
        if (t) headers.Authorization = `Bearer ${t}`;
      } catch {
        // ignore
      }
    }
    return headers;
  }

  private static async handleError(response: Response): Promise<never> {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) throw new Error("Unauthorized");
    throw new Error(err.message ?? err.error ?? `Error ${response.status}`);
  }

  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...this.getDefaultHeaders(token), ...(options.headers as Record<string, string>) },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) await this.handleError(res);
      // DELETE/status devuelven { message }
      if (res.status === 204) return undefined as T;
      return res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === "AbortError") throw new Error("La petición tardó demasiado");
      throw e;
    }
  }

  private static transform(api: ProductApi): Producto {
    return {
      id: api.id,
      name: api.name,
      description: api.description ?? "",
      price: parseFloat(api.price) || 0,
      currency: api.currency ?? "eur",
      type: api.type ?? "product",
      area: api.area ?? "otros",
      billingPeriod: api.billing_period ?? null,
      stripePriceId: api.stripe_price_id ?? null,
      active: api.active ?? true,
      createdAt: api.created_at ?? null,
    };
  }

  static async getProductos(): Promise<Producto[]> {
    const res = await this.makeRequest<ProductApi[] | { data: ProductApi[] }>("/api/v1/admin-panel/products");
    const arr = Array.isArray(res) ? res : (res.data ?? []);
    return arr.map((p) => this.transform(p));
  }

  static async createProducto(data: CreateProductoDto): Promise<Producto> {
    const res = await this.makeRequest<ProductApi | { data: ProductApi }>("/api/v1/admin-panel/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const api = (res as { data?: ProductApi }).data ?? (res as ProductApi);
    return this.transform(api);
  }

  static async updateProducto(id: string, data: UpdateProductoDto): Promise<Producto> {
    const res = await this.makeRequest<ProductApi | { data: ProductApi }>(`/api/v1/admin-panel/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const api = (res as { data?: ProductApi }).data ?? (res as ProductApi);
    return this.transform(api);
  }

  static async setProductoStatus(id: string, active: boolean): Promise<void> {
    await this.makeRequest(`/api/v1/admin-panel/products/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ active }),
    });
  }

  static async deleteProducto(id: string): Promise<void> {
    await this.makeRequest(`/api/v1/admin-panel/products/${id}`, { method: "DELETE" });
  }
}
