import {
  ShoppingBag,
  Forklift,
  Mail,
  MessageSquare,
  Calendar,
  Kanban,
  ReceiptText,
  Users,
  Lock,
  Fingerprint,
  SquareArrowUpRight,
  LayoutDashboard,
  ChartBar,
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
        title: "Entrenadores",
        url: "/dashboard/entrenadores",
        icon: Users,
      },
      {
        title: "Finanzas",
        url: "/dashboard/finanzas",
        icon: Banknote,
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
        title: "Alumnos",
        url: "/alumnos",
        icon: Users,
        comingSoon: true,
      },
      {
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
        comingSoon: true,
      },

      {
        title: "Facturas",
        url: "/facturas",
        icon: ReceiptText,
        comingSoon: true,
      },

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
