import { AppConfig, Permission, Role } from "./config";

type FlavorKey = "hq" | "branch" | "user";

/**
 * Check if the current user role has the specified permission
 */
export function hasPermission(permission: Permission): boolean {
  const role = AppConfig.getFlavor() as Role;
  const permissions: Permission[] = AppConfig.roles[role]?.permissions || [];
  return permissions.includes(permission);
}

/**
 * Get all permissions for the current role
 */
export function getRolePermissions(): Permission[] {
  const role = AppConfig.getFlavor() as Role;
  return AppConfig.roles[role]?.permissions || [];
}

/**
 * Check if current user is HQ
 */
export function isHQ(): boolean {
  return AppConfig.getFlavor() === "HQ";
}

/**
 * Check if current user is Branch Admin
 */
export function isBranch(): boolean {
  return AppConfig.getFlavor() === "BRANCH";
}

/**
 * Check if current user is regular Customer/User
 */
export function isUser(): boolean {
  return AppConfig.getFlavor() === "USER";
}

/**
 * Get role designation
 */
export function getRoleDesignation(): string {
  const role = AppConfig.getFlavor() as Role;
  return AppConfig.roles[role]?.designation || "Unknown";
}

/**
 * Role-based access control guard
 */
export function requirePermission(permission: Permission): boolean {
  if (!hasPermission(permission)) {
    console.warn(`Access denied: ${permission} permission required for ${AppConfig.getFlavor()} role`);
    return false;
  }
  return true;
}

/**
 * Role-based action guard
 */
export function requireRole(allowedRoles: Role[]): boolean {
  return allowedRoles.includes(AppConfig.getFlavor());
}

/**
 * Get flavor-specific config
 */
export function getFlavorConfig() {
  const key = AppConfig.getFlavor().toLowerCase() as FlavorKey;
  return flavors[key];
}

const flavors: Record<FlavorKey, {
  canAddMenu: boolean;
  canRemoveMenu: boolean;
  canUpdateMenu: boolean;
  canManageSeasonalMenu: boolean;
  canManageStock: boolean;
  canManagePricing: boolean;
  canViewStock: boolean;
  canViewPricing: boolean;
  isAdmin: boolean;
}> = {
  hq: {
    canAddMenu: true,
    canRemoveMenu: true,
    canUpdateMenu: true,
    canManageSeasonalMenu: true,
    canManageStock: false,
    canManagePricing: true,
    canViewStock: true,
    canViewPricing: true,
    isAdmin: true,
  },
  branch: {
    canAddMenu: false,
    canRemoveMenu: false,
    canUpdateMenu: true,
    canManageSeasonalMenu: false,
    canManageStock: true,
    canManagePricing: true,
    canViewStock: true,
    canViewPricing: true,
    isAdmin: false,
  },
  user: {
    canAddMenu: false,
    canRemoveMenu: false,
    canUpdateMenu: false,
    canManageSeasonalMenu: false,
    canManageStock: false,
    canManagePricing: false,
    canViewStock: true,
    canViewPricing: true,
    isAdmin: false,
  },
};

