import axios from "axios";
import { readSession, clearSession } from "./session";

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "/api").replace(
    /\/+$/,
    ""
  ),
  timeout: 20000,
});

let connection = "checking";
const listeners = new Set();

function setConnection(value) {
  if (connection === value) return;

  connection = value;
  listeners.forEach((listener) => listener());
}

export const connectionStore = {
  subscribe(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot() {
    return connection;
  },
};

function isAuthRequest(url = "") {
  return (
    url.startsWith("/auth/") ||
    url.startsWith("/api/auth/")
  );
}

api.interceptors.request.use((config) => {
  const session = readSession();

  if (session && !isAuthRequest(config.url)) {
    config.headers = config.headers || {};
    config.headers.Authorization = session.authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    setConnection("online");
    return response;
  },

  (error) => {
    // Aborted requests are expected when a page unmounts.
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    setConnection(
      error.response && ![502, 503, 504].includes(status)
        ? "online"
        : "offline"
    );

    if (status === 401 && !isAuthRequest(error.config?.url)) {
      const current = readSession();
      const headers = error.config?.headers;

      const sentAuthorization =
        typeof headers?.get === "function"
          ? headers.get("Authorization")
          : headers?.Authorization || headers?.authorization;

      // Only clear the session whose credentials failed.
      if (
        current &&
        sentAuthorization === current.authorization
      ) {
        clearSession();
        window.dispatchEvent(new Event("nestwell:expired"));
      }
    }

    return Promise.reject(error);
  }
);

export function errorMessage(error) {
  if (typeof error === "string") {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (error?.request && !error?.response) {
    return (
      "We could not reach the loan service. " +
      "Make sure the backend is running, then try again."
    );
  }

  return error?.message || "Something went wrong. Please try again.";
}

export async function downloadDocument(document) {
  let response;

  try {
    response = await api.get(
      `/documents/${document.id}/download`,
      {
        responseType: "blob",
        timeout: 60000,
      }
    );
  } catch (error) {
    // Error responses also arrive as Blob when responseType is blob.
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        error.response.data = JSON.parse(text);
      } catch {
        // Preserve the original Axios error if parsing fails.
      }
    }

    throw error;
  }

  const objectUrl = URL.createObjectURL(response.data);
  const link = window.document.createElement("a");

  try {
    link.href = objectUrl;
    link.download = document.originalFilename || "document";
    window.document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }
}

export async function allOfficers() {
  const result = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const { data } = await api.get("/admin/loan-officers", {
      params: {
        page,
        size: 100,
      },
    });

    result.push(...data.content);
    totalPages = data.totalPages;
    page += 1;
  }

  return result;
}