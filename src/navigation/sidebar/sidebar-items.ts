import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart,
  Settings,
  Fingerprint,
  SquareArrowUpRight,
  Shield,
  type LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  items: {
    title: string;
    url: string;
    newTab?: boolean;
  }[];
}

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "/dashboard" },
      { title: "Analytics", url: "/dashboard/analytics" },
      { title: "Reports", url: "/dashboard/reports" },
    ],
  },
  {
    title: "Management",
    icon: Users,
    items: [
      { title: "Customers", url: "/dashboard/customers" },
      { title: "Orders", url: "/dashboard/orders" },
      { title: "Products", url: "/dashboard/products" },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    items: [
      { title: "Orders", url: "/dashboard/orders" },
      { title: "Invoices", url: "/dashboard/invoices" },
      { title: "Refunds", url: "/dashboard/refunds" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart,
    items: [
      { title: "Overview", url: "/dashboard/analytics" },
      { title: "Sales", url: "/dashboard/analytics/sales" },
      { title: "Customers", url: "/dashboard/analytics/customers" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "General", url: "/dashboard/settings" },
      { title: "Security", url: "/dashboard/settings/security" },
      { title: "Billing", url: "/dashboard/settings/billing" },
    ],
  },
  {
    title: "Auth Pages",
    icon: Fingerprint,
    items: [{ title: "Login v1", url: "/auth/v1/login", newTab: true }],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      { title: "Security Overview", url: "/dashboard/security" },
      { title: "Access Logs", url: "/dashboard/security/logs" },
      { title: "Permissions", url: "/dashboard/security/permissions" },
    ],
  },
  {
    title: "External",
    icon: SquareArrowUpRight,
    items: [
      { title: "Documentation", url: "https://ui.shadcn.com", newTab: true },
      { title: "GitHub", url: "https://github.com/shadcn/ui", newTab: true },
    ],
  },
];
