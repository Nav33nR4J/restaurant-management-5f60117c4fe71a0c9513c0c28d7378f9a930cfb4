/**
 * Token Types
 * Defines token types, interfaces, and utilities for authentication
 */

/**
 * Token type enumeration
 */
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  API = "api",
  ID = "id",
}

/**
 * Token status enumeration
 */
export enum TokenStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  INVALID = "invalid",
}

/**
 * Authentication token interface with metadata
 */
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

/**
 * JWT Token payload structure
 */
export interface TokenPayload {
  /** Subject (user ID) */
  sub: string;
  /** Issuer */
  iss: string;
  /** Audience */
  aud?: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** Not before timestamp */
  nbf?: number;
  /** JWT ID */
  jti?: string;
  /** User roles/permissions */
  roles?: string[];
  /** Token type */
  token_type?: TokenType;
}

/**
 * Token storage configuration
 */
export interface TokenStorageConfig {
  /** Storage key prefix */
  prefix: string;
  /** Access token key suffix */
  accessTokenSuffix: string;
  /** Refresh token key suffix */
  refreshTokenSuffix: string;
  /** Token metadata key suffix */
  metadataSuffix: string;
}

/**
 * Token validation result
 */
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

/**
 * Default token storage configuration
 */
export const defaultTokenStorageConfig: TokenStorageConfig = {
  prefix: "@restaurant",
  accessTokenSuffix: "access_token",
  refreshTokenSuffix: "refresh_token",
  metadataSuffix: "token_metadata",
};

/**
 * Token expiration thresholds
 */
export const TOKEN_EXPIRATION_THRESHOLDS = {
  /** Warn when token expires within this many seconds */
  WARN_BEFORE_SECONDS: 300, // 5 minutes
  /** Refresh token if access token expires within this many seconds */
  REFRESH_BEFORE_SECONDS: 600, // 10 minutes
  /** Maximum token age before forcing refresh */
  MAX_TOKEN_AGE_SECONDS: 3600, // 1 hour
};

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: AuthToken): boolean {
  return Date.now() >= token.expiresAt;
}

/**
 * Get time until token expiration in seconds
 */
export function getTimeUntilExpiration(token: AuthToken): number {
  const remaining = Math.floor((token.expiresAt - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Check if token needs refresh
 */
export function needsRefresh(token: AuthToken): boolean {
  const expiresIn = getTimeUntilExpiration(token);
  return expiresIn < TOKEN_EXPIRATION_THRESHOLDS.REFRESH_BEFORE_SECONDS;
}

/**
 * Check if token is near expiration (should warn user)
 */
export function isNearExpiration(token: AuthToken): boolean {
  const expiresIn = getTimeUntilExpiration(token);
  return expiresIn < TOKEN_EXPIRATION_THRESHOLDS.WARN_BEFORE_SECONDS && expiresIn > 0;
}

/**
 * Create a storage key for a token type
 */
export function getTokenStorageKey(
  config: TokenStorageConfig,
  type: "access" | "refresh" | "metadata"
): string {
  const suffix =
    type === "access"
      ? config.accessTokenSuffix
      : type === "refresh"
      ? config.refreshTokenSuffix
      : config.metadataSuffix;
  return `${config.prefix}_${suffix}`;
}

/**
 * Parse a JWT token payload (without verification)
 */
export function parseJWTPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Decode a JWT token header (without verification)
 */
export function decodeJWTHeader(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const header = JSON.parse(atob(parts[0]));
    return header as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Validate token structure
 */
export function validateTokenStructure(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

/**
 * Create an AuthToken from raw token data
 */
export function createAuthToken(
  rawToken: string,
  type: TokenType,
  expiresInSeconds: number,
  refreshToken?: string,
  scope?: string[]
): AuthToken {
  const now = Date.now();
  const issuedAt = now;
  const expiresAt = now + expiresInSeconds * 1000;

  return {
    token: rawToken,
    type,
    status: TokenStatus.ACTIVE,
    issuedAt,
    expiresAt,
    refreshToken,
    scope,
  };
}

// Re-export for convenience
export {
  createAuthToken, decodeJWTHeader, defaultTokenStorageConfig, getTimeUntilExpiration, getTokenStorageKey, isNearExpiration, isTokenExpired, needsRefresh, parseJWTPayload, TOKEN_EXPIRATION_THRESHOLDS, TokenStatus, TokenType, validateTokenStructure
};

