import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { fail, mockApi, ok } from "../test/mockApi";
import Login from "./Login";

const setup = (routes) => {
  const api = mockApi(routes);
  const onLogin = vi.fn();
  render(<Login onLogin={onLogin} />);
  return { api, onLogin, user: userEvent.setup() };
};

describe("Login", () => {
  it("blocks an empty login and explains each missing field", async () => {
    const { api, user } = setup();
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(api.calls()).toHaveLength(0);
  });

  it("clears a field's error as soon as the user types in it", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await user.type(screen.getByPlaceholderText("you@example.com"), "a");

    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("logs in with a trimmed email", async () => {
    const account = { id: "u1", token: "t" };
    const { api, onLogin, user } = setup({ "POST /auth/login": ok(account) });
    await user.type(screen.getByPlaceholderText("you@example.com"), " ada@example.com ");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(api.calls("POST /auth/login")[0].body).toEqual({
      email: "ada@example.com",
      password: "secret123",
    });
    expect(onLogin).toHaveBeenCalledWith(account, "t");
  });

  it("shows the backend's message when login fails", async () => {
    const { user } = setup({ "POST /auth/login": fail(401, "Invalid email or password") });
    await user.type(screen.getByPlaceholderText("you@example.com"), "ada@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  describe("registration", () => {
    const openRegister = async (user) =>
      user.click(screen.getByRole("button", { name: "Register" }));
    const fill = async (user, values) => {
      for (const [placeholder, value] of Object.entries(values)) {
        const input = screen.getByPlaceholderText(placeholder);
        await user.clear(input);
        if (value) await user.type(input, value);
      }
    };
    const submit = (user) => user.click(screen.getByRole("button", { name: /create account/i }));

    it("checks phone number and password length before sending", async () => {
      const { api, user } = setup();
      await openRegister(user);
      await fill(user, {
        John: "Ada",
        Doe: "Obi",
        "you@example.com": "ada@example.com",
        "08012345678": "0801 234",
        "Min 8 characters": "short",
      });
      await submit(user);

      expect(
        screen.getByText("Enter 10–15 digits, optionally starting with +"),
      ).toBeInTheDocument();
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
      expect(api.calls()).toHaveLength(0);
    });

    it("sends a cleaned-up phone number and shows backend field errors", async () => {
      const { api, user } = setup({
        "POST /auth/register": fail(400, "Validation failed", {
          email: "Email already registered",
        }),
      });
      await openRegister(user);
      await fill(user, {
        John: "Ada",
        Doe: "Obi",
        "you@example.com": "ada@example.com",
        "08012345678": "0801 234 5678",
        "Min 8 characters": "secret123",
      });
      await submit(user);

      expect(api.calls("POST /auth/register")[0].body.phoneNumber).toBe("08012345678");
      expect(await screen.findByText("Email already registered")).toBeInTheDocument();
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });

    it("clears errors when switching between Login and Register", async () => {
      const { user } = setup();
      await user.click(screen.getByRole("button", { name: /sign in/i }));
      await openRegister(user);
      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });
  });
});
