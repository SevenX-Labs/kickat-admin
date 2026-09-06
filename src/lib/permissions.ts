export type PermissionRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "MODERATOR";

export const RolePermissions: Record<PermissionRole, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "products:manage",
    "orders:manage",
    "categories:manage",
    "reviews:manage",
    "shipments:manage",
    "campaigns:manage",
    "blogs:manage",
    "reports:view",
    "settings:view",
  ],
  STAFF: ["orders:read", "orders:status", "shipments:read", "products:read"],
  MODERATOR: ["reviews:manage", "blogs:manage"],
};

export function hasPermission(role: PermissionRole, permission: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  const perms = RolePermissions[role] || [];
  return perms.includes(permission) || perms.includes("*");
}
