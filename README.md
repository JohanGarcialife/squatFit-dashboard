# Squat Fit Dashboard

Un dashboard moderno y elegante construido con Next.js 15, Tailwind CSS v4 y shadcn/ui para la gestión del back office de Squat Fit.

## 🚀 Características

### Tecnologías Principales
- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS v4** - Framework CSS utility-first
- **shadcn/ui** - Componentes de UI modernos y accesibles

### Funcionalidades Implementadas
- ✅ **Sistema de Autenticación** - Login administrativo con integración a API backend
- ✅ **Dashboard Responsive** - Interfaz adaptativa para todos los dispositivos
- ✅ **Tema Claro/Oscuro** - Soporte para múltiples temas
- ✅ **Sidebar Colapsible** - Navegación lateral personalizable
- ✅ **Componentes UI Reutilizables** - Biblioteca completa de componentes
- ✅ **Validación de Formularios** - Con Zod y React Hook Form
- ✅ **Gestión de Estado** - Con React Query y hooks personalizados
- ✅ **Tablas de Datos** - Con funcionalidades de ordenamiento y paginación
- ✅ **Gráficos Interactivos** - Con Recharts
- ✅ **Notificaciones** - Sistema de toast con Sonner

### Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (external)/        # Rutas públicas
│   ├── (main)/           # Rutas protegidas
│   │   ├── auth/         # Autenticación
│   │   └── dashboard/    # Dashboard principal
├── components/            # Componentes reutilizables
│   ├── ui/              # Componentes base de shadcn/ui
│   └── data-table/      # Componentes de tablas
├── config/              # Configuración de la aplicación
├── hooks/               # Hooks personalizados
├── lib/                 # Utilidades y helpers
├── middleware/          # Middleware de autenticación
└── navigation/          # Configuración de navegación
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd squatFit-dashboard
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
npm start
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con Turbopack
- `npm run build` - Construcción para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting con ESLint
- `npm run format` - Formateo con Prettier
- `npm run format:check` - Verificar formato

## 🔐 Autenticación

El sistema de autenticación está integrado con el backend de Squat Fit para acceso administrativo:

- **Login Administrativo**: Sistema seguro con cookies HttpOnly
- **Protección de Rutas**: Middleware automático de autenticación
- **Logout Seguro**: Limpieza completa de sesión desde múltiples puntos
- **Context Global**: Estado de autenticación accesible en toda la aplicación

📖 **Documentación Técnica**: Ver [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) para detalles de implementación.

## 🎨 Temas y Personalización

### Temas Disponibles
- **Claro** - Tema por defecto
- **Oscuro** - Tema alternativo
- **Sistema** - Seguir preferencias del sistema

### Personalización de Layout
- Sidebar colapsible
- Layout centrado o completo
- Controles de navegación personalizables

## 📊 Componentes Principales

### Dashboard
- **Cards de Resumen** - Métricas principales
- **Gráficos Interactivos** - Visualización de datos
- **Tablas de Datos** - Gestión de información
- **Filtros y Búsqueda** - Navegación de datos

### CRM
- **Tarjetas de Insight** - Análisis de datos
- **Tarjetas Operacionales** - Métricas operativas
- **Tablas de Gestión** - Administración de clientes

## 🔒 Seguridad

### Implementado
- ✅ Cookies HttpOnly para máxima seguridad
- ✅ Middleware de autenticación automático
- ✅ Protección de rutas con redirección segura
- ✅ Validación de formularios con Zod
- ✅ Context de autenticación global

### Documentación de Seguridad
📋 **Checklist Completo**: Ver [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md) para recomendaciones detalladas.

## 🧪 Testing

### Configurado
- ✅ ESLint con reglas de seguridad
- ✅ Prettier para formateo
- ✅ TypeScript para tipado
- ✅ Husky para pre-commit hooks

### Pendiente
- ⏳ Tests unitarios con Jest
- ⏳ Tests de integración
- ⏳ Tests E2E con Playwright

## 📱 Responsive Design

El dashboard está completamente optimizado para:
- 📱 **Móviles** - Navegación adaptativa
- 📱 **Tablets** - Layout intermedio
- 💻 **Desktop** - Experiencia completa

## 🚀 Despliegue

### Plataformas Soportadas
- **Vercel** - Recomendado para Next.js
- **Netlify** - Alternativa
- **AWS Amplify** - Para entornos empresariales

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_API_URL=https://squatfit-api-cyrc2g3zra-no.a.run.app
NEXT_PUBLIC_APP_NAME=Squat Fit Dashboard
```

## 🤝 Contribución

### Estándares de Código
- **Convenciones**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Branches**: Git Flow
- **Reviews**: Pull Request obligatorio

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear feature branch
3. Implementar cambios
4. Ejecutar tests
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- 📧 Email: [contacto@squatfit.com]
- 📱 WhatsApp: [+1234567890]
- 🐛 Issues: [GitHub Issues]

---

**Desarrollado con ❤️ para Squat Fit** 