# 📡 Análisis Completo de la API SquatFit para Dashboard Administrativo

**Fecha de Análisis:** 12 de Octubre, 2025  
**API Base URL:** `https://squatfit-api-cyrc2g3zra-no.a.run.app`  
**Documentación Swagger:** [Ver Swagger](https://squatfit-api-cyrc2g3zra-no.a.run.app/api/docs)  
**Tipo:** REST API con autenticación JWT

---

## 🎯 RESUMEN EJECUTIVO

La API de SquatFit está dividida en módulos funcionales que ya tienes parcialmente implementados. Este documento detalla los endpoints que debes usar para completar tu dashboard administrativo **Back Office**.

---

## 🔐 ENDPOINTS YA IMPLEMENTADOS

### **1. Autenticación - Admin Panel**

**Base URL (Auth):** `https://squatfit-api-985835765452.europe-southwest1.run.app`

#### **Login Administrativo**

```http
POST /api/v1/admin-panel/login
Content-Type: application/json

{
  "email": "admin@squatfit.com",
  "password": "password123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@squatfit.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

**Estado:** ✅ **IMPLEMENTADO** en `src/lib/services/auth-service.ts`

#### **Logout**

```http
POST /api/v1/admin-panel/logout
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Logout successful"
}
```

**Estado:** ✅ **IMPLEMENTADO** en `src/lib/services/auth-service.ts`

---

### **2. Sistema de Chat - Coach Chat**

**Base URL (Chat):** `https://squatfit-api-cyrc2g3zra-no.a.run.app`

#### **Obtener Conversaciones**

```http
GET /api/v1/coach-chat/conversations
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "name": "Juan Pérez",
      "user_email": "juan@example.com",
      "unread_count": 3,
      "last_message": {
        "content": "Hola, necesito ayuda",
        "created_at": "2024-10-12T10:30:00Z",
        "sender_id": "user-uuid"
      },
      "tags": ["nutricion", "entrenamiento"],
      "isActive": true
    }
  ]
}
```

**Estado:** ✅ **IMPLEMENTADO** en `src/lib/services/chat-service.ts`

#### **Obtener Mensajes de una Conversación**

```http
GET /api/v1/coach-chat/conversations/{chatId}/messages?page=1&limit=100
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": "message-uuid",
      "chatId": "chat-uuid",
      "content": "Hola, ¿cómo estás?",
      "sender_id": "user-uuid",
      "created_at": "2024-10-12T10:30:00Z",
      "isRead": false,
      "messageType": "text"
    }
  ]
}
```

**Estado:** ✅ **IMPLEMENTADO** en `src/lib/services/chat-service.ts`

#### **Enviar Mensaje**

```http
POST /api/v1/coach-chat/conversations/{chatId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Hola, te puedo ayudar",
  "messageType": "text"
}

Response 201:
{
  "data": {
    "id": "new-message-uuid",
    "chatId": "chat-uuid",
    "content": "Hola, te puedo ayudar",
    "sender_id": "coach-uuid",
    "created_at": "2024-10-12T10:35:00Z",
    "messageType": "text"
  }
}
```

**Estado:** ✅ **IMPLEMENTADO** en `src/lib/services/chat-service.ts`

#### **Marcar Mensajes como Leídos**

```http
POST /api/v1/coach-chat/conversations/{chatId}/messages/read
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Messages marked as read"
}
```

**Estado:** ✅ **IMPLEMENTADO** en `src/lib/services/chat-service.ts`

#### **Obtener Estadísticas del Chat**

```http
GET /api/v1/coach-chat/stats
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "totalConversations": 45,
    "unreadMessages": 12,
    "activeChats": 8,
    "averageResponseTime": "5 min"
  }
}
```

**Estado:** ✅ **IMPLEMENTADO** en `src/lib/services/chat-service.ts`

---

## 🚨 ENDPOINTS QUE DEBES IMPLEMENTAR

Basándose en la estructura de tu dashboard y la [documentación Swagger](https://squatfit-api-cyrc2g3zra-no.a.run.app/api/docs), estos son los endpoints que necesitas implementar:

### **3. Gestión de Cursos**

#### **Listar Cursos**

```http
GET /api/v1/courses
Authorization: Bearer {token}
Query Parameters:
  - page (optional): número de página
  - limit (optional): resultados por página
  - status (optional): "Activo" | "Inactivo" | "En Desarrollo"
  - category (optional): categoría del curso

Response 200:
{
  "data": [
    {
      "id": "course-uuid",
      "name": "Fundamentos de Entrenamiento Funcional",
      "description": "Aprende las bases del entrenamiento funcional",
      "instructor": "Carlos Martínez",
      "price": 49.99,
      "currency": "EUR",
      "status": "Activo",
      "students": 234,
      "duration": "8 semanas",
      "level": "Principiante",
      "category": "Entrenamiento",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-10-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Obtener Curso por ID**

```http
GET /api/v1/courses/{id}
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "id": "course-uuid",
    "name": "Fundamentos de Entrenamiento Funcional",
    // ... todos los campos
    "syllabus": [
      { "week": 1, "title": "Introducción", "content": "..." }
    ]
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Crear Curso**

```http
POST /api/v1/courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Curso",
  "description": "Descripción del curso",
  "instructor": "Nombre del instructor",
  "price": 99.99,
  "currency": "EUR",
  "status": "En Desarrollo",
  "duration": "12 semanas",
  "level": "Intermedio",
  "category": "Nutrición"
}

Response 201:
{
  "data": {
    "id": "new-course-uuid",
    // ... todos los campos creados
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Actualizar Curso**

```http
PUT /api/v1/courses/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nombre actualizado",
  "status": "Activo"
  // ... otros campos a actualizar
}

Response 200:
{
  "data": {
    "id": "course-uuid",
    // ... todos los campos actualizados
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Eliminar Curso**

```http
DELETE /api/v1/courses/{id}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Activar/Desactivar Curso**

```http
PATCH /api/v1/courses/{id}/toggle-status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Activo" | "Inactivo"
}

Response 200:
{
  "data": {
    "id": "course-uuid",
    "status": "Activo"
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

---

### **4. Gestión de Entrenadores**

#### **Listar Entrenadores**

```http
GET /api/v1/coaches
Authorization: Bearer {token}
Query Parameters:
  - page (optional): número de página
  - limit (optional): resultados por página
  - status (optional): "Activo" | "Inactivo" | "Vacaciones" | "Pendiente"
  - specialty (optional): especialidad del entrenador

Response 200:
{
  "data": [
    {
      "id": "coach-uuid",
      "firstName": "Carlos",
      "lastName": "Martínez",
      "email": "carlos.martinez@squatfit.com",
      "phone": "+34 612 345 678",
      "specialties": ["Entrenamiento Funcional", "CrossFit"],
      "status": "Activo",
      "experience": 8,
      "rating": 4.9,
      "clients": 45,
      "certifications": ["NSCA-CPT", "CrossFit Level 2"],
      "joinDate": "2020-01-15T00:00:00Z",
      "hourlyRate": 45,
      "availability": "Disponible"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Obtener Entrenador por ID**

```http
GET /api/v1/coaches/{id}
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "id": "coach-uuid",
    "firstName": "Carlos",
    // ... todos los campos
    "bio": "Biografía del entrenador",
    "stats": {
      "totalClients": 45,
      "activeClients": 38,
      "completedSessions": 456
    }
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Crear Entrenador**

```http
POST /api/v1/coaches
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Nuevo",
  "lastName": "Entrenador",
  "email": "nuevo@squatfit.com",
  "phone": "+34 600 000 000",
  "specialties": ["Yoga", "Pilates"],
  "certifications": ["RYT-200"],
  "experience": 5,
  "hourlyRate": 40
}

Response 201:
{
  "data": {
    "id": "new-coach-uuid",
    // ... todos los campos creados
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Actualizar Entrenador**

```http
PUT /api/v1/coaches/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Vacaciones",
  "availability": "No Disponible"
  // ... otros campos
}

Response 200:
{
  "data": {
    "id": "coach-uuid",
    // ... campos actualizados
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Eliminar Entrenador**

```http
DELETE /api/v1/coaches/{id}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Coach deleted successfully"
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Asignar Cliente a Entrenador**

```http
POST /api/v1/coaches/{coachId}/clients/{clientId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Client assigned successfully"
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

---

### **5. Gestión Financiera**

#### **Obtener Dashboard Financiero**

```http
GET /api/v1/finances/dashboard
Authorization: Bearer {token}
Query Parameters:
  - period (optional): "week" | "month" | "year"

Response 200:
{
  "data": {
    "totalRevenue": 203847.50,
    "totalExpenses": 45000.00,
    "netProfit": 158847.50,
    "coursesRevenue": 150000.00,
    "coachingRevenue": 53847.50,
    "recentTransactions": [
      {
        "id": "txn-uuid",
        "type": "income",
        "amount": 49.99,
        "description": "Curso vendido",
        "date": "2024-10-12T00:00:00Z"
      }
    ]
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Obtener Transacciones**

```http
GET /api/v1/finances/transactions
Authorization: Bearer {token}
Query Parameters:
  - page: número de página
  - limit: resultados por página
  - type: "income" | "expense"
  - startDate: fecha inicio
  - endDate: fecha fin

Response 200:
{
  "data": [
    {
      "id": "txn-uuid",
      "type": "income",
      "amount": 49.99,
      "currency": "EUR",
      "description": "Venta de curso",
      "category": "courses",
      "date": "2024-10-12T00:00:00Z",
      "userId": "user-uuid",
      "status": "completed"
    }
  ],
  "meta": {
    "total": 456,
    "page": 1,
    "limit": 20
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

---

### **6. Analíticas y Reportes**

#### **Dashboard General**

```http
GET /api/v1/analytics/dashboard
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "totalUsers": 1245,
    "activeUsers": 892,
    "newUsersThisMonth": 45,
    "totalCourses": 10,
    "activeCourses": 8,
    "totalCoaches": 12,
    "activeCoaches": 9,
    "revenue": {
      "today": 450.00,
      "week": 3200.00,
      "month": 15000.00,
      "year": 180000.00
    }
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Reportes de Cursos**

```http
GET /api/v1/analytics/courses
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "mostPopular": [
      {
        "courseId": "uuid",
        "name": "Yoga para Principiantes",
        "students": 456,
        "rating": 4.9
      }
    ],
    "revenue": {
      "byCourse": [
        {
          "courseId": "uuid",
          "name": "Yoga para Principiantes",
          "revenue": 17784.44
        }
      ]
    }
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

---

### **7. Gestión de Usuarios y Roles**

#### **Listar Usuarios**

```http
GET /api/v1/users
Authorization: Bearer {token}
Query Parameters:
  - page: número de página
  - limit: resultados por página
  - role: "admin" | "coach" | "user"
  - status: "active" | "inactive"

Response 200:
{
  "data": [
    {
      "id": "user-uuid",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "user",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-10-12T10:00:00Z"
    }
  ],
  "meta": {
    "total": 1245,
    "page": 1,
    "limit": 20
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

#### **Asignar Rol**

```http
POST /api/v1/users/{userId}/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "coach"
}

Response 200:
{
  "data": {
    "userId": "user-uuid",
    "role": "coach"
  }
}
```

**Estado:** ❌ **PENDIENTE DE IMPLEMENTAR**

---

## 📊 ESTRUCTURA RECOMENDADA PARA IMPLEMENTACIÓN

### **Paso 1: Crear Servicios por Módulo**

```typescript
src/lib/services/
├── auth-service.ts          ✅ YA EXISTE
├── chat-service.ts          ✅ YA EXISTE
├── cursos-service.ts        ❌ CREAR
├── entrenadores-service.ts  ❌ CREAR
├── finanzas-service.ts      ❌ CREAR
├── analytics-service.ts     ❌ CREAR
└── users-service.ts         ❌ CREAR
```

### **Paso 2: Estructura de un Servicio**

```typescript
// Ejemplo: cursos-service.ts
import { getAuthToken } from "@/lib/auth/auth-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://squatfit-api-cyrc2g3zra-no.a.run.app";

export class CursosService {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error en la petición");
    }

    return await response.json();
  }

  static async getCursos(): Promise<Curso[]> {
    const response = await this.makeRequest<{ data: Curso[] }>("/api/v1/courses");
    return response.data;
  }

  static async createCurso(data: CreateCursoDto): Promise<Curso> {
    const response = await this.makeRequest<{ data: Curso }>("/api/v1/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // ... más métodos
}
```

### **Paso 3: Integrar con React Query**

```typescript
// hooks/use-cursos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CursosService } from "@/lib/services/cursos-service";

export function useCursos() {
  return useQuery({
    queryKey: ["cursos"],
    queryFn: () => CursosService.getCursos(),
  });
}

export function useCreateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCursoDto) => CursosService.createCurso(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
    },
  });
}
```

---

## 🔑 CONFIGURACIÓN DE AUTENTICACIÓN

### **Headers Requeridos**

Todas las peticiones (excepto login) requieren:

```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### **Manejo de Tokens**

El token se obtiene del login y debe:

1. ✅ Guardarse en `localStorage` (ya implementado)
2. ✅ Guardarse en cookies HttpOnly (ya implementado)
3. ✅ Incluirse en todas las peticiones protegidas

### **Refresh Token**

Si el token expira:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "stored-refresh-token"
}

Response 200:
{
  "token": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### **Prioridad ALTA**

1. **Crear `cursos-service.ts`**
   - Implementar CRUD completo
   - Conectar con la página ya creada

2. **Crear `entrenadores-service.ts`**
   - Implementar CRUD completo
   - Conectar con la página ya creada

3. **Crear `finanzas-service.ts`**
   - Implementar endpoints de finanzas
   - Conectar con página de finanzas

### **Prioridad MEDIA**

4. **Crear `analytics-service.ts`**
   - Dashboard general
   - Reportes por módulo

5. **Crear `users-service.ts`**
   - Gestión de usuarios
   - Asignación de roles

### **Prioridad BAJA**

6. **WebSocket para notificaciones**
   - Ya tienes WebSocket para chat
   - Extender para notificaciones globales

---

## 📝 NOTAS IMPORTANTES

1. **Dos URLs de API detectadas:**
   - Auth: `https://squatfit-api-985835765452.europe-southwest1.run.app`
   - Main: `https://squatfit-api-cyrc2g3zra-no.a.run.app`

   **Recomendación:** Unificar en una sola URL o centralizar la configuración.

2. **Versionado de API:**
   - Todos los endpoints usan `/api/v1/`
   - Mantener consistencia en versiones

3. **Paginación:**
   - Usar `page` y `limit` en todas las listas
   - Implementar `meta` en respuestas

4. **Manejo de Errores:**
   - Todos los errores vienen en formato:

   ```json
   {
     "statusCode": 400,
     "message": "Error message",
     "error": "Bad Request"
   }
   ```

5. **WebSocket:**
   - Ya implementado para chat
   - URL: `wss://squatfit-api-985835765452.europe-southwest1.run.app/notifications`

---

## 🎯 RESUMEN

| Módulo            | Endpoints | Estado       | Prioridad |
| ----------------- | --------- | ------------ | --------- |
| **Autenticación** | 2/2       | ✅ Completo  | -         |
| **Chat**          | 5/5       | ✅ Completo  | -         |
| **Cursos**        | 0/6       | ❌ Pendiente | 🔴 Alta   |
| **Entrenadores**  | 0/7       | ❌ Pendiente | 🔴 Alta   |
| **Finanzas**      | 0/2       | ❌ Pendiente | 🟡 Media  |
| **Analíticas**    | 0/2       | ❌ Pendiente | 🟡 Media  |
| **Usuarios**      | 0/2       | ❌ Pendiente | 🟢 Baja   |

**Progreso Total:** 7/26 endpoints (27%)

---

**Documento generado por:** Análisis de API SquatFit  
**Basado en:** Swagger Documentation + Código Existente  
**Última actualización:** 12 de Octubre, 2025
