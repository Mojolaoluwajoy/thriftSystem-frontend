import { describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest } from "./api";

const respond = (status, body) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: body === undefined ? async () => Promise.reject(new SyntaxError()) : async () => body,
    })),
  );

const errorFrom = async (promise) => {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  throw new Error("expected the request to fail");
};

describe("apiRequest", () => {
  it("returns the data of a successful response", async () => {
    respond(200, { success: true, data: [1, 2] });
    await expect(apiRequest("/currencies")).resolves.toEqual([1, 2]);
  });

  it("sends JSON with the bearer token", async () => {
    respond(200, { success: true, data: null });
    await apiRequest("/group/create-group", { method: "POST", token: "abc", body: { name: "x" } });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("http://api.test/api/v1/group/create-group");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer abc");
    expect(JSON.parse(options.body)).toEqual({ name: "x" });
  });

  it("leaves out the Authorization header when logged out", async () => {
    respond(200, { success: true, data: null });
    await apiRequest("/auth/login", { method: "POST", body: {} });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("uses the backend's message when it reports a failure", async () => {
    respond(200, { success: false, message: "Bad credentials" });
    const err = await errorFrom(apiRequest("/auth/login"));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Bad credentials");
  });

  it("keeps the HTTP status and per-field validation errors", async () => {
    respond(400, { success: false, message: "Validation failed", data: { name: "Required" } });
    const err = await errorFrom(apiRequest("/group/create-group"));
    expect(err.status).toBe(400);
    expect(err.fieldErrors).toEqual({ name: "Required" });
  });

  it("explains a non-JSON error page by its status code", async () => {
    respond(500, undefined);
    const err = await errorFrom(apiRequest("/currencies"));
    expect(err.message).toBe("Request failed (500).");
  });

  it("flags a successful status with an unreadable body", async () => {
    respond(200, undefined);
    const err = await errorFrom(apiRequest("/currencies"));
    expect(err.message).toBe("Unexpected response from server.");
  });

  it("reports a connection error when the server can't be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const err = await errorFrom(apiRequest("/currencies"));
    expect(err.status).toBe(0);
    expect(err.message).toMatch(/connection error/i);
  });
});
