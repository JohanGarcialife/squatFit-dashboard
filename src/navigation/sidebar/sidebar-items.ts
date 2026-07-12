import {
  MessageSquare,
  Users,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Package,
  UtensilsCrossed,
  Apple,
  FileText,
  TrendingUp,
  Dumbbell,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  // Iconos propios del diseño (PNG/SVG): normal (índigo) y activo (naranja).
  // Si están presentes, tienen prioridad sobre `icon` (lucide).
  iconNormal?: string;
  iconActive?: string;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Inicio",
    items: [
      {
        title: "Inicio",
        url: "/dashboard/default",
        icon: LayoutDashboard,
        iconNormal: "/menu-icons/inicio-normal.png",
        iconActive: "/menu-icons/inicio-active.png",
      },
      {
        title: "Pedidos",
        url: "/dashboard/pedidos",
        icon: Package,
        iconNormal: "/menu-icons/pedidos-normal.svg",
        iconActive: "/menu-icons/pedidos-active.svg",
      },
      {
        title: "Equipo",
        url: "/dashboard/equipo",
        icon: Users,
        iconNormal: "/menu-icons/equipo-normal.svg",
        iconActive: "/menu-icons/equipo-active.svg",
      },
      {
        title: "Cursos",
        url: "/dashboard/cursos",
        icon: GraduationCap,
        iconNormal: "/menu-icons/cursos-normal.png",
        iconActive: "/menu-icons/cursos-active.png",
      },
      {
        title: "Cocina",
        url: "/dashboard/libros",
        icon: BookOpen,
        iconNormal: "/menu-icons/libros-normal.png",
        iconActive: "/menu-icons/libros-active.png",
      },
      {
        title: "Productos",
        url: "/dashboard/packs",
        icon: Package,
        iconNormal: "/menu-icons/productos-normal.svg",
        iconActive: "/menu-icons/productos-active.svg",
      },
    ],
  },
  {
    id: 2,
    label: "Clientes",
    items: [
      {
        title: "Usuarios",
        url: "/dashboard/alumnos",
        icon: Users,
        iconNormal: "/menu-icons/usuarios-normal.svg",
        iconActive: "/menu-icons/usuarios-active.svg",
      },
      {
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
        iconNormal: "/menu-icons/chat-normal.png",
        iconActive: "/menu-icons/chat-active.png",
      },
      // {
      //   title: "Soporte",
      //   url: "/dashboard/support",
      //   icon: Headphones,
      // },
    ],
  },
  {
    id: 3,
    label: "Nutrición",
    items: [
      {
        title: "Nutri",
        url: "/dashboard/nutri",
        icon: UtensilsCrossed,
        subItems: [
          {
            title: "Dieta",
            url: "/dashboard/dieta",
            icon: Apple,
          },
          {
            title: "Pautas",
            url: "/dashboard/pautas",
            icon: FileText,
          },
          {
            title: "Seguimiento",
            url: "/dashboard/seguimiento",
            icon: TrendingUp,
          },
        ],
      },
    ],
  },
  // {
  //   id: 4,
  //   label: "Operaciones",
  //   items: [
  //     {
  //       title: "Trainer",
  //       url: "/dashboard/trainer",
  //       icon: Dumbbell,
  //     },
  //     // {
  //     //   title: "Ventas",
  //     //   url: "/dashboard/ventas",
  //     //   icon: ShoppingCart,
  //     // },
  //   ],
  // },
  // {
  //   id: 5,
  //   label: "Marketing",
  //   items: [
  //     {
  //       title: "Marketing y KPIs",
  //       url: "/dashboard/marketing",
  //       icon: BarChart3,
  //       isNew: true,
  //     },
  //   ],
  // },
];

/**
 * Filtra los items del sidebar según el rol del usuario
 * - Solo "admin" puede ver "Entrenadores", "Cursos", "Libros", "Packs" y "Usuarios"
 * - Solo "admin" y "support" pueden ver "Marketing y KPIs"
 * @param userRole - Rol del usuario actual
 * @returns Array de NavGroup filtrado según el rol
 */
export const getSidebarItemsForRole = (userRole: string | null | undefined): NavGroup[] => {
  if (!userRole) {
    // Si no hay rol, devolver items restringidos
    return sidebarItems
      .filter((group) => group.id !== 5) // Ocultar Marketing
      .map((group) => {
        if (group.id === 1) {
          // Grupo "Home" - filtrar "Entrenadores", "Cursos" y "Libros"
          return {
            ...group,
            items: group.items.filter(
              (item) =>
                item.url !== "/dashboard/pedidos" &&
                item.url !== "/dashboard/equipo" &&
                item.url !== "/dashboard/cursos" &&
                item.url !== "/dashboard/libros" &&
                item.url !== "/dashboard/packs",
            ),
          };
        }
        if (group.id === 2) {
          // Grupo "Clientes" - filtrar "Usuarios"
          return {
            ...group,
            items: group.items.filter((item) => item.url !== "/dashboard/alumnos"),
          };
        }
        return group;
      });
  }

  const role = userRole.toLowerCase();

  // Admin ve todos los items
  if (role === "admin") {
    return sidebarItems;
  }

  // Soporte puede ver Marketing pero no Entrenadores, Cursos, Libros ni Usuarios
  if (role === "support" || role === "soporte") {
    return sidebarItems.map((group) => {
      if (group.id === 1) {
        // Grupo "Home" - filtrar items restringidos
        return {
          ...group,
          items: group.items.filter(
            (item) =>
              item.url !== "/dashboard/pedidos" &&
              item.url !== "/dashboard/equipo" &&
              item.url !== "/dashboard/cursos" &&
              item.url !== "/dashboard/libros" &&
              item.url !== "/dashboard/packs",
          ),
        };
      }
      if (group.id === 2) {
        // Grupo "Clientes" - filtrar "Usuarios"
        return {
          ...group,
          items: group.items.filter((item) => item.url !== "/dashboard/alumnos"),
        };
      }
      return group;
    });
  }

  // Para otros roles, filtrar Entrenadores, Cursos, Libros, Packs, Usuarios y Marketing
  return sidebarItems
    .filter((group) => group.id !== 5) // Ocultar Marketing
    .map((group) => {
      if (group.id === 1) {
        // Grupo "Home" - filtrar items restringidos
        return {
          ...group,
          items: group.items.filter(
            (item) =>
              item.url !== "/dashboard/pedidos" &&
              item.url !== "/dashboard/equipo" &&
              item.url !== "/dashboard/cursos" &&
              item.url !== "/dashboard/libros" &&
              item.url !== "/dashboard/packs",
          ),
        };
      }
      if (group.id === 2) {
        // Grupo "Clientes" - filtrar "Usuarios"
        return {
          ...group,
          items: group.items.filter((item) => item.url !== "/dashboard/alumnos"),
        };
      }
      return group;
    });
};
