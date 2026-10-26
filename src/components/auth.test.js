import { describe, expect, it } from "vitest";
import { normalizePhone, toRegisterRequest, validateLogin, validateRegister } from "./auth";

const validRegistration = {
  firstName: "Ada",
  lastName: "Obi",
  email: "ada@example.com",
  phoneNumber: "08012345678",
  password: "secret123",
};

describe("validateLogin", () => {
  it("requires email and password", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Email is required",
      password: "Password is required",
    });
  });

  it("rejects a malformed email", () => {
    expect(validateLogin({ email: "ada.example.com", password: "x" })).toEqual({
      email: "Invalid email format",
    });
  });

  it("accepts any something@something address, like the backend", () => {
    expect(validateLogin({ email: " a@b ", password: "x" })).toEqual({});
  });
});

describe("validateRegister", () => {
  it("accepts a valid registration", () => {
    expect(validateRegister(validRegistration)).toEqual({});
  });

  it("requires every field", () => {
    const errors = validateRegister({
      firstName: " ",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    });
    expect(Object.keys(errors)).toEqual([
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "password",
    ]);
  });

  it.each([
    ["0801 234-5678", true],
    ["+234 801 234 5678", true],
    ["080123", false],
    ["0801abc5678", false],
    ["1234567890123456", false],
  ])("checks phone %s against the backend pattern", (phoneNumber, valid) => {
    const errors = validateRegister({ ...validRegistration, phoneNumber });
    expect(errors.phoneNumber === undefined).toBe(valid);
  });

  it("requires at least 8 password characters", () => {
    expect(validateRegister({ ...validRegistration, password: "1234567" }).password).toBe(
      "Password must be at least 8 characters",
    );
    expect(validateRegister({ ...validRegistration, password: "12345678" })).toEqual({});
  });
});

describe("toRegisterRequest", () => {
  it("trims names and email, cleans the phone number and keeps the password as typed", () => {
    expect(
      toRegisterRequest({
        firstName: " Ada ",
        lastName: "Obi",
        email: " ada@example.com ",
        phoneNumber: "0801 234-5678",
        password: " pass word ",
      }),
    ).toEqual({
      firstName: "Ada",
      lastName: "Obi",
      email: "ada@example.com",
      phoneNumber: "08012345678",
      password: " pass word ",
    });
  });
});

describe("normalizePhone", () => {
  it("strips spaces, dashes, dots and brackets", () => {
    expect(normalizePhone("(0801) 234.56-78")).toBe("08012345678");
  });
});
