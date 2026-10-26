import { vi } from "vitest";

// Fake backend for tests. Routes are keyed by "METHOD /path" (path after /api/v1) and map to
// a response, or to a function returning one so it can change between calls.
//
//   const api = mockApi({ "GET /currencies": ok([]) });
//   api.routes["POST /group/create-group"] = fail(400, "Validation failed", { name: "..." });
//   expect(api.calls("POST /group/create-group")[0].body).toEqual({...});
export const ok = (data) => ({ status: 200, body: { success: true, data } });
export const fail = (status, message, data) => ({
  status,
  body: { success: false, message, data },
});

export function mockApi(routes = {}) {
  const log = [];
  const fetchMock = vi.fn(async (url, options = {}) => {
    const key = `${options.method || "GET"} ${url.replace(/^.*\/api\/v1/, "")}`;
    const body = options.body ? JSON.parse(options.body) : undefined;
    log.push({ key, body, headers: options.headers });
    const route = api.routes[key];
    const response = await (typeof route === "function" ? route({ key, body }) : route);
    const { status, body: json } = response ?? fail(404, `No mock route for ${key}`);
    return { ok: status >= 200 && status < 300, status, json: async () => json };
  });
  vi.stubGlobal("fetch", fetchMock);

  const api = {
    routes,
    calls: (key) => (key ? log.filter((c) => c.key === key) : log),
  };
  return api;
}

// The empty dashboard every Dashboard test starts from.
export const emptyDashboardRoutes = () => ({
  "GET /group/my-groups": ok([]),
  "GET /contributions/my-contributions": ok([]),
  "GET /payouts/my-payouts": ok([]),
  "GET /currencies": ok([]),
});

export const testUser = { id: "u1", firstName: "Ada", lastName: "Obi", email: "ada@example.com" };
