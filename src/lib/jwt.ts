export type AccessTokenClaims = {
  username?: string;
  role?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
};

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

export function decodeAccessToken(token: string): AccessTokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload) as AccessTokenClaims;
  } catch {
    return null;
  }
}
