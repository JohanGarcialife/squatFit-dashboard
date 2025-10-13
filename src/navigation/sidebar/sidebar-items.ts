import {
  MessageSquare,
  ReceiptText,
  Users,
  Lock,
  LayoutDashboard,
  Banknote,
  Gauge,
  GraduationCap,
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
    label: "Home",
    items: [
      {
        title: "Home",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "Entrenadores",
        url: "/dashboard/entrenadores",
        icon: Users,
      },
      {
        title: "Cursos",
        url: "/dashboard/cursos",
        icon: GraduationCap,
      },
      {
        title: "Finanzas",
        url: "/dashboard/finanzas",
        icon: Banknote,
        comingSoon: true,
      },
      {
        title: "Analiticas",
        url: "/dashboard/analiticas",
        icon: Gauge,
        comingSoon: true,
      },
      {
        title: "Roles",
        url: "/roles",
        icon: Lock,
        comingSoon: true,
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
      },
      {
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },

      /* {
        title: "Facturas",
        url: "/dashboard/facturas",
        icon: ReceiptText,
        comingSoon: true,
      },*/

      // {
      //   title: "Authentication",
      //   url: "/auth",
      //   icon: Fingerprint,
      //   subItems: [
      //     { title: "Login v1", url: "/auth/v1/login", newTab: true },
      //     { title: "Login v2", url: "/auth/v2/login", newTab: true },
      //     { title: "Register v1", url: "/auth/v1/register", newTab: true },
      //     { title: "Register v2", url: "/auth/v2/register", newTab: true },
      //   ],
      // },
    ],
  },
];
