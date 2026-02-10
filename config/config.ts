export type Flavor = "HQ" | "USER" | "BRANCH";
export type Role = "HQ" | "USER" | "BRANCH";

// Role configuration type
type RoleConfig = {
  designation: string;
  permissions: Permission[];
};

// Role configurations
const roleConfigs: Record<Role, RoleConfig> = {
  HQ: {
    designation: "Headquarters",
    permissions: [
      "menu:create",
      "menu:read",
      "menu:update",
      "menu:delete",
      "seasonal_menu:manage",
      "stock:view",
      "pricing:manage",
    ],
  },
  USER: {
    designation: "Customer",
    permissions: [
      "menu:read",
      "seasonal_menu:view",
    ],
  },
  BRANCH: {
    designation: "Branch Admin",
    permissions: [
      "menu:read",
      "menu:update",
      "stock:manage",
      "pricing:manage",
    ],
  },
};

// AppConfig - uses a function to get dynamic flavor
export const AppConfig = {
  // This will be replaced at runtime with the actual flavor from Redux
  getFlavor: (): Flavor => {
    return "BRANCH";
  },
  setFlavorGetter: (getter: () => Flavor) => {
    AppConfig.getFlavor = getter;
  },
  appName: "Restaurant Management",
  roles: roleConfigs,
};

// Helper to get current flavor (used by components)
export const getCurrentFlavor = (): Flavor => {
  return AppConfig.getFlavor();
};

// Flavor configurations
export const flavors = {
  hq: {
    appName: "Restaurant HQ",
    role: "HQ" as Role,
  },
  user: {
    appName: "Restaurant User",
    role: "USER" as Role,
  },
  branch: {
    appName: "Restaurant Branch",
    role: "BRANCH" as Role,
  },
};

// Permission types
export type Permission =
  | "menu:create"
  | "menu:read"
  | "menu:update"
  | "menu:delete"
  | "seasonal_menu:manage"
  | "seasonal_menu:view"
  | "stock:manage"
  | "stock:view"
  | "pricing:manage"
  | "pricing:view";

// User data interface
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
  role: Role;
}

// Menu item interface with stock management
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice: number; // Original pricing set by HQ
  image: string;
  category: string;
  isAvailable: boolean; // Stock status (in stock/out of stock)
  inStock: boolean; // Boolean for stock management
  seasonalMenuId?: string; // Link to seasonal menu if applicable
  createdAt: string;
  updatedAt: string;
}

// Seasonal menu interface
export interface SeasonalMenu {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

// Menu schedule for time-based switching
export interface MenuSchedule {
  id: string;
  seasonalMenuId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

// =============================================================================
// TOKEN TYPES - Re-exported from types/token.ts for convenience
// =============================================================================

// Token type enumeration
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  API = "api",
  ID = "id",
}

// Token status enumeration
export enum TokenStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  INVALID = "invalid",
}

// Authentication token interface with metadata
export interface AuthToken {
  /** The token value */
  token: string;
  /** Type of token */
  type: TokenType;
  /** Token status */
  status: TokenStatus;
  /** Token creation timestamp */
  issuedAt: number;
  /** Token expiration timestamp */
  expiresAt: number;
  /** Optional: refresh token associated with this access token */
  refreshToken?: string;
  /** Optional: token scope/permissions */
  scope?: string[];
}

// Token validation result
export interface TokenValidationResult {
  /** Whether the token is valid */
  isValid: boolean;
  /** Current status of the token */
  status: TokenStatus;
  /** Error message if invalid */
  error?: string;
  /** Time until expiration in seconds */
  expiresIn?: number;
}

// Token expiration thresholds
export const TOKEN_EXPIRATION_THRESHOLDS = {
  /** Warn when token expires within this many seconds */
  WARN_BEFORE_SECONDS: 300, // 5 minutes
  /** Refresh token if access token expires within this many seconds */
  REFRESH_BEFORE_SECONDS: 600, // 10 minutes
  /** Maximum token age before forcing refresh */
  MAX_TOKEN_AGE_SECONDS: 3600, // 1 hour
};

