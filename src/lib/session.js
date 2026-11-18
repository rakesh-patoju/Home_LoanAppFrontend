const SESSION_KEY = "nestwell.basic.session.v2";
const OLD_SESSION_KEY = "nestwell.session.v1";
const SESSION_DURATION_MS = 60 * 60 * 1000;

const VALID_ROLES = ["CUSTOMER", "LOAN_OFFICER", "ADMIN"];

let memorySession = null;

function isValidSession(session) {
  return (
    session !== null &&
    typeof session === "object" &&
    VALID_ROLES.includes(session.role) &&
    typeof session.authorization === "string" &&
    session.authorization.startsWith("Basic ") &&
    Number.isFinite(session.expiresAt) &&
    session.expiresAt > Date.now()
  );
}

export function basicAuthorization(email, password) {
  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Email and password are required.");
  }

  const credentials = `${email.trim().toLowerCase()}:${password}`;
  const bytes = new TextEncoder().encode(credentials);

  const encoded = btoa(
    Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
  );

  return `Basic ${encoded}`;
}

export function clearSession() {
  memorySession = null;

  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(OLD_SESSION_KEY);
  } catch {
    // The in-memory session is still cleared if storage is unavailable.
  }
}

export function readSession() {
  let session;

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    session = stored ? JSON.parse(stored) : memorySession;
  } catch {
    session = memorySession;
  }

  if (!isValidSession(session)) {
    clearSession();
    return null;
  }

  memorySession = session;
  return session;
}

export function saveSession(data) {
  if (
    !data ||
    !VALID_ROLES.includes(data.role) ||
    typeof data.authorization !== "string" ||
    !data.authorization.startsWith("Basic ")
  ) {
    throw new Error("Invalid Basic authentication session.");
  }

  const now = Date.now();

  const expiresAt = Number.isFinite(data.expiresAt)
    ? Math.min(data.expiresAt, now + SESSION_DURATION_MS)
    : now + SESSION_DURATION_MS;

  if (expiresAt <= now) {
    clearSession();
    throw new Error("Your session has expired. Please log in again.");
  }

  const session = {
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    authorization: data.authorization,
    expiresAt,
  };

  memorySession = session;

  try {
    sessionStorage.removeItem(OLD_SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Login can still work in this page if browser storage is unavailable.
  }

  return session;
}