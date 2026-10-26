import { describe, expect, it } from "vitest";
import { currencySymbol, formatMoney, formatTotals } from "./format";

describe("formatMoney", () => {
  it("formats amounts in their own currency", () => {
    expect(formatMoney(10000, "NGN")).toBe("₦10,000.00");
    expect(formatMoney(50, "USD")).toBe("$50.00");
    expect(formatMoney(1500, "EUR")).toBe("€1,500.00");
  });

  it("keeps Canadian and US dollars distinct", () => {
    expect(formatMoney(5, "CAD")).toBe("CA$5.00");
  });

  it("defaults to naira", () => {
    expect(formatMoney(100)).toBe("₦100.00");
  });

  it("shows a dash for a missing amount", () => {
    expect(formatMoney(null)).toBe("—");
    expect(formatMoney(undefined)).toBe("—");
    expect(formatMoney("abc")).toBe("—");
  });

  it("falls back to the code for an unknown currency instead of throwing", () => {
    expect(formatMoney(5, "XX1")).toBe("5 XX1");
  });

  it("accepts Intl options such as more decimal places", () => {
    expect(formatMoney(0.00123, "NGN", { maximumFractionDigits: 4 })).toBe("₦0.0012");
  });
});

describe("currencySymbol", () => {
  it("uses standard symbols rather than the API's placeholders", () => {
    expect(currencySymbol("NGN")).toBe("₦");
    expect(currencySymbol("EUR")).toBe("€");
    expect(currencySymbol("CAD")).toBe("CA$");
  });

  it("returns the code for an unknown currency", () => {
    expect(currencySymbol("XX1")).toBe("XX1");
  });
});

describe("formatTotals", () => {
  it("never adds different currencies together", () => {
    expect(
      formatTotals([
        { amount: 100, currency: "NGN" },
        { amount: 50, currency: "USD" },
        { amount: 200 },
      ]),
    ).toBe("₦300.00 · $50.00");
  });

  it("shows zero naira when there is nothing to add up", () => {
    expect(formatTotals([])).toBe("₦0.00");
  });
});
