import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { api } from "../lib/api";

import {
  readSession,
  saveSession,
  clearSession,
  basicAuthorization,
} from "../lib/session";

const AuthContext = createContext(null);

const VALID_ROLES = ["CUSTOMER", "LOAN_OFFICER", "ADMIN"];
const SESSION_DURATION_MS = 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      clearSession();
      setUser(null);
      setExpired(true);
    };

    window.addEventListener("nestwell:expired", handleExpired);

    return () => {
      window.removeEventListener("nestwell:expired", handleExpired);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const expireSession = () => {
      clearSession();
      setUser(null);
      setExpired(true);
    };

    if (!Number.isFinite(user.expiresAt)) {
      expireSession();
      return;
    }

    const remaining = user.expiresAt - Date.now();

    if (remaining <= 0) {
      expireSession();
      return;
    }

    const timeoutId = window.setTimeout(
      expireSession,
      Math.min(remaining, SESSION_DURATION_MS)
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user]);

  const authenticate = async (path, body) => {
    const { data } = await api.post(path, body);

    if (
      data?.authType !== "Basic" ||
      !VALID_ROLES.includes(data?.role) ||
      typeof data?.email !== "string" ||
      !data.email.trim() ||
      data?.userId == null
    ) {
      throw new Error(
        "Unexpected login response. This frontend requires the Basic Auth backend."
      );
    }

    const session = saveSession({
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      authorization: basicAuthorization(data.email, body.password),

      // Basic Auth does not return a JWT expiration.
      // This is the frontend's local session timeout.
      expiresAt: Date.now() + SESSION_DURATION_MS,
    });

    setUser(session);
    setExpired(false);

    return session;
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setExpired(false);
  };

  const updateName = (fullName) => {
    const current = readSession();

    if (!current) {
      clearSession();
      setUser(null);
      setExpired(true);
      return;
    }

    const updated = saveSession({
      ...current,
      fullName,
    });

    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        expired,
        login: (body) => authenticate("/auth/login", body),
        register: (body) => authenticate("/auth/register", body),
        logout,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}