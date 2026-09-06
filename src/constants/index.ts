export const APP_NAME = "KickAt Admin";
export const APP_DESCRIPTION = "Official KickAt Admin & Commerce Portal";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const SIDEBAR_NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
      { label: "Analytics", href: "/admin/dashboard/analytics", icon: "BarChart3" },
    ],
  },
  {
    title: "Store Management",
    items: [
      { label: "Customers", href: "/admin/dashboard/customers", icon: "Users" },
      { label: "Products", href: "/admin/dashboard/products", icon: "Package" },
      { label: "Categories", href: "/admin/dashboard/categories", icon: "FolderTree" },
      { label: "Orders", href: "/admin/dashboard/orders", icon: "ShoppingBag" },
      { label: "Shipments", href: "/admin/dashboard/shipments", icon: "Truck" },
      { label: "Reviews", href: "/admin/dashboard/reviews", icon: "Star" },
    ],
  },
  {
    title: "Marketing & Content",
    items: [
      { label: "Campaigns", href: "/admin/dashboard/campaigns", icon: "Megaphone" },
      { label: "Blogs", href: "/admin/dashboard/blogs", icon: "FileText" },
    ],
  },
  {
    title: "System & Insights",
    items: [
      { label: "Reports", href: "/admin/dashboard/reports", icon: "PieChart" },
      { label: "Settings", href: "/admin/dashboard/settings", icon: "Settings" },
    ],
  },
];

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Analytics", href: "/admin/dashboard/analytics", icon: "BarChart3" },
  { label: "Customers", href: "/admin/dashboard/customers", icon: "Users" },
  { label: "Products", href: "/admin/dashboard/products", icon: "Package" },
  { label: "Categories", href: "/admin/dashboard/categories", icon: "FolderTree" },
  { label: "Orders", href: "/admin/dashboard/orders", icon: "ShoppingBag" },
  { label: "Shipments", href: "/admin/dashboard/shipments", icon: "Truck" },
  { label: "Reviews", href: "/admin/dashboard/reviews", icon: "Star" },
  { label: "Campaigns", href: "/admin/dashboard/campaigns", icon: "Megaphone" },
  { label: "Blogs", href: "/admin/dashboard/blogs", icon: "FileText" },
  { label: "Reports", href: "/admin/dashboard/reports", icon: "PieChart" },
  { label: "Settings", href: "/admin/dashboard/settings", icon: "Settings" },
  { label: "Admin Profile", href: "/admin/dashboard/profile", icon: "User" },
];
