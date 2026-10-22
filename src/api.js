const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export class ApiError extends Error {
  // `fieldErrors` holds the backend's per-field validation messages, e.g. { name: "Group name is required" }.
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Calls the API and returns the `data` field of a successful response.
// Throws ApiError for network failures, non-2xx statuses and `success: false` bodies.
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Connection error. Make sure the server is running.", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Not JSON (e.g. an HTML error page): handled below via the status code.
  }

  if (!res.ok || !data?.success) {
    const fallback = res.ok
      ? "Unexpected response from server."
      : `Request failed (${res.status}).`;
    const fieldErrors = data?.data && typeof data.data === "object" ? data.data : {};
    throw new ApiError(data?.message || fallback, res.status, fieldErrors);
  }
  return data.data;
}
