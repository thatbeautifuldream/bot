const COOKIE_NAME = "bot_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const PRINCIPAL_ID = "owner";

export interface AppSession {
  readonly expiresAt: number;
  readonly userId: string;
}

export { COOKIE_NAME, MAX_AGE_SECONDS };

/** Signs `<expiry>.<hmac>` so the cookie needs no server-side session store. */
export async function createSessionToken(
  now: number = Date.now(),
): Promise<{ token: string; maxAge: number }> {
  const expiresAt = now + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return {
    token: `${payload}.${await sign(payload)}`,
    maxAge: MAX_AGE_SECONDS,
  };
}

export async function verifySessionToken(
  cookieHeader: string | null | undefined,
  now: number = Date.now(),
): Promise<AppSession | null> {
  const token = readCookie(cookieHeader, COOKIE_NAME);
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!(await isValidSignature(payload, signature))) return null;

  const expiresAt = Number(payload);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return null;

  return { expiresAt, userId: PRINCIPAL_ID };
}

export async function isValidPassword(candidate: string): Promise<boolean> {
  const expected = requireEnv("APP_PASSWORD");
  // Compare digests so the check does not leak the password's length or prefix.
  const [a, b] = await Promise.all([digest(candidate), digest(expected)]);
  return timingSafeEqual(a, b);
}

function readCookie(header: string | null | undefined, name: string) {
  if (!header) return undefined;

  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(pair.slice(separator + 1).trim());
  }

  return undefined;
}

async function sign(payload: string): Promise<string> {
  const key = await importKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return base64Url(signature);
}

async function isValidSignature(payload: string, signature: string) {
  const key = await importKey();
  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}

async function importKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(requireEnv("AUTH_SECRET")),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign", "verify"],
  );
}

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a[index] ^ b[index];
  }
  return mismatch === 0;
}

function base64Url(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}
