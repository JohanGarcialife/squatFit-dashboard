import { getAuthToken } from "@/lib/auth/auth-utils";

// ============================================================================
// Servicio de CONTENIDO de cursos (FASE contenido de formaciones)
// Módulos · Clases (con URL de Bunny) · Tests (por clase y por módulo).
// ----------------------------------------------------------------------------
// El backend expone estos endpoints en la rama features-lote-7 (admin-panel/
// courses/*), aún SIN desplegar. Mientras no esté en prod, COURSE_CONTENT_API_READY
// = false: la pantalla se ve con un árbol de ejemplo y un aviso; al desplegar,
// poner el flag a true (o ?real=1) y funciona contra la API sin más cambios.
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";
const REQUEST_TIMEOUT = 12000;

// Encender cuando el backend (features-lote-7) esté desplegado en prod.
export const COURSE_CONTENT_API_READY = false;

// ============================================================================
// Tipos (espejo del contrato del backend)
// ============================================================================
export interface TestMeta {
  id: string;
  title: string | null;
  kind: "class" | "module" | "final";
}

export interface Lesson {
  id: string;
  title: string;
  video_url: string | null;
  lesson_number: number | null;
  priority: number;
  module_id: string | null;
  test: TestMeta | null;
}

export interface ContentModule {
  id: string;
  name: string;
  subtitle: string | null;
  priority: number;
  module_test: TestMeta | null;
  lessons: Lesson[];
}

export interface ContentTree {
  course_id: string;
  modules: ContentModule[];
  lessons_without_module: Lesson[];
  final_test: TestMeta | null;
}

export interface TestOption {
  id?: string;
  text: string;
  correct: boolean;
  priority?: number;
}

export interface TestQuestion {
  id?: string;
  question: string;
  priority?: number;
  explanation?: string | null;
  options: TestOption[];
}

export interface FullTest extends TestMeta {
  questions: TestQuestion[];
}

// ============================================================================
// Cliente HTTP (mismo patrón que CursosService)
// ============================================================================
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers ?? {}) },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? `Error ${res.status}`);
    }
    // algunos DELETE devuelven 200 con cuerpo pequeño
    return (await res.json().catch(() => ({}))) as T;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

// ============================================================================
// Árbol de ejemplo (solo mientras COURSE_CONTENT_API_READY === false)
// ============================================================================
function demoTree(courseId: string): ContentTree {
  const mk = (n: number, title: string, url: string | null): Lesson => ({
    id: `demo-l-${n}`,
    title,
    video_url: url,
    lesson_number: n,
    priority: n,
    module_id: "demo-m-1",
    test: { id: `demo-t-${n}`, title: `Test — ${title}`, kind: "class" },
  });
  return {
    course_id: courseId,
    modules: [
      {
        id: "demo-m-1",
        name: "Fundamentos de la nutrición",
        subtitle: null,
        priority: 1,
        module_test: { id: "demo-mt-1", title: "Test del módulo — Fundamentos", kind: "module" },
        lessons: [
          mk(
            1,
            "Fundamentos de la nutrición: alimentación, homeostasis y transporte celular",
            "https://iframe.mediadelivery.net/embed/708831/f8b865b1-9117-448c-b95d-ea0e2da514f8?autoplay=false",
          ),
          mk(
            2,
            "Los hidratos de carbono: tipos, fibra e índice glucémico",
            "https://iframe.mediadelivery.net/embed/708831/f914db43-ecda-4fb7-afdd-972ce7eac357?autoplay=false",
          ),
          mk(3, "Las grasas dietéticas: tipos, colesterol y calidad de las fuentes", null),
        ],
      },
      {
        id: "demo-m-2",
        name: "Energía y composición corporal",
        subtitle: null,
        priority: 2,
        module_test: null,
        lessons: [mk(4, "Bioenergética y balance energético: cálculo del gasto y del déficit", null)],
      },
    ],
    lessons_without_module: [],
    final_test: { id: "demo-final", title: "Test final del curso", kind: "final" },
  };
}

function demoTest(testId: string): FullTest {
  return {
    id: testId,
    title: "Test de ejemplo",
    kind: "class",
    questions: [
      {
        id: "dq1",
        priority: 1,
        question: "¿Cuál es la principal diferencia entre alimentación y nutrición?",
        explanation: "La alimentación es la ingestión del alimento; la nutrición, su asimilación celular.",
        options: [
          { text: "Son sinónimos", correct: false },
          { text: "La alimentación es la ingestión; la nutrición, la asimilación y uso celular", correct: true },
          { text: "La nutrición es elegir alimentos y la alimentación digerir", correct: false },
          { text: "La alimentación depende del metabolismo y la nutrición del sistema nervioso", correct: false },
        ],
      },
    ],
  };
}

// ============================================================================
// API pública
// ============================================================================
export const CursoContenidoService = {
  ready: COURSE_CONTENT_API_READY,

  async getContentTree(courseId: string): Promise<ContentTree> {
    if (!COURSE_CONTENT_API_READY) return demoTree(courseId);
    return request<ContentTree>(`/api/v1/admin-panel/courses/${courseId}/content`);
  },

  async createModule(courseId: string, body: { name: string; subtitle?: string; priority?: number }) {
    return request(`/api/v1/admin-panel/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  async updateModule(moduleId: string, body: { name?: string; subtitle?: string; priority?: number }) {
    return request(`/api/v1/admin-panel/courses/modules/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  async deleteModule(moduleId: string) {
    return request(`/api/v1/admin-panel/courses/modules/${moduleId}`, { method: "DELETE" });
  },
  async reorderModules(items: { id: string; priority: number }[]) {
    return request(`/api/v1/admin-panel/courses/modules-order`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    });
  },

  async createLesson(
    moduleId: string,
    body: { title: string; video_url?: string; lesson_number?: number; priority?: number },
  ) {
    return request(`/api/v1/admin-panel/courses/modules/${moduleId}/lessons`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  async updateLesson(
    lessonId: string,
    body: { title?: string; video_url?: string; lesson_number?: number; priority?: number; module_id?: string },
  ) {
    return request(`/api/v1/admin-panel/courses/lessons/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  async deleteLesson(lessonId: string) {
    return request(`/api/v1/admin-panel/courses/lessons/${lessonId}`, { method: "DELETE" });
  },
  async reorderLessons(items: { id: string; priority: number }[]) {
    return request(`/api/v1/admin-panel/courses/lessons-order`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    });
  },

  async getLessonTest(lessonId: string): Promise<FullTest> {
    if (!COURSE_CONTENT_API_READY) return demoTest(`demo-t-${lessonId}`);
    return request<FullTest>(`/api/v1/admin-panel/courses/lessons/${lessonId}/test`);
  },
  async getModuleTest(moduleId: string): Promise<FullTest> {
    if (!COURSE_CONTENT_API_READY) return { ...demoTest(`demo-mt-${moduleId}`), kind: "module" };
    return request<FullTest>(`/api/v1/admin-panel/courses/modules/${moduleId}/test`);
  },
  async getTest(testId: string): Promise<FullTest> {
    if (!COURSE_CONTENT_API_READY) return demoTest(testId);
    return request<FullTest>(`/api/v1/admin-panel/courses/tests/${testId}`);
  },
  async replaceTest(testId: string, questions: TestQuestion[]): Promise<FullTest> {
    if (!COURSE_CONTENT_API_READY) return { ...demoTest(testId), questions };
    return request<FullTest>(`/api/v1/admin-panel/courses/tests/${testId}`, {
      method: "PUT",
      body: JSON.stringify({ questions }),
    });
  },
};

/** Normaliza cualquier URL de Bunny a formato embed (igual que la web del cliente). */
export function toBunnyEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.pathname.includes("/play/")) u.pathname = u.pathname.replace("/play/", "/embed/");
    if (!u.searchParams.has("responsive")) u.searchParams.set("responsive", "true");
    return u.toString();
  } catch {
    return url;
  }
}
