import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { emptyDashboardRoutes, fail, mockApi, ok, testUser } from "./test/mockApi";

const SESSION_KEY = "thrift.session";
const jwt = (payload) => `header.${btoa(JSON.stringify(payload))}.signature`;
const hoursFromNow = (h) => Math.floor(Date.now() / 1000) + h * 3600;
const saveSession = (token) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user: testUser, token }));

describe("App session", () => {
  it("shows the login screen when there is no saved session", () => {
    mockApi();
    render(<App />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("restores a saved session after a page reload", async () => {
    mockApi(emptyDashboardRoutes());
    saveSession(jwt({ exp: hoursFromNow(1) }));
    render(<App />);
    expect(await screen.findByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("discards a saved session whose token has expired", () => {
    mockApi();
    saveSession(jwt({ exp: hoursFromNow(-1) }));
    render(<App />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("saves the session on login and clears it on sign out", async () => {
    const user = userEvent.setup();
    mockApi({
      ...emptyDashboardRoutes(),
      "POST /auth/login": ok({ ...testUser, token: jwt({ exp: hoursFromNow(1) }) }),
    });
    render(<App />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await user.click(await screen.findByRole("button", { name: "Sign out" }));
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("logs out when the API rejects the token with 401", async () => {
    mockApi({ ...emptyDashboardRoutes(), "GET /group/my-groups": fail(401, "Unauthorized") });
    saveSession(jwt({ exp: hoursFromNow(1) }));
    render(<App />);
    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
