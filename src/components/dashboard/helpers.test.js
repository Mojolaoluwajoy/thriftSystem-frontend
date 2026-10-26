// Unit tests for the dashboard's pure helpers: groups, schedule, banks, payments, payouts.
import { describe, expect, it } from "vitest";
import { OTHER_BANK, toBankAccountRequest, validateBankAccount } from "./banks";
import { frequencyLabel, toCreateGroupRequest, validateGroup } from "./groups";
import { canPay } from "./payments";
import { normalizePayout } from "./payouts";
import { addPeriods, buildSchedule } from "./schedule";

const localDate = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

describe("validateGroup", () => {
  const valid = {
    name: "Office",
    description: "",
    contributionAmount: "10000",
    currency: "NGN",
    frequency: "MONTHLY",
    startDate: "2026-11-01",
    totalMembers: "10",
  };

  it("accepts a valid group", () => {
    expect(validateGroup(valid)).toEqual({});
  });

  it("requires a non-blank name", () => {
    expect(validateGroup({ ...valid, name: "   " })).toEqual({ name: "Group name is required" });
  });

  it.each(["0", "-5", "abc"])("rejects a contribution amount of %s", (contributionAmount) => {
    expect(validateGroup({ ...valid, contributionAmount }).contributionAmount).toBe(
      "Contribution amount must be positive",
    );
  });

  it.each(["0", "2.5"])("rejects %s total members", (totalMembers) => {
    expect(validateGroup({ ...valid, totalMembers }).totalMembers).toBe(
      "Total members must be a positive whole number",
    );
  });

  it("requires a start date", () => {
    expect(validateGroup({ ...valid, startDate: "" })).toEqual({
      startDate: "Start date is required",
    });
  });
});

describe("toCreateGroupRequest", () => {
  it("sends numbers and a LocalDateTime start date", () => {
    expect(
      toCreateGroupRequest({
        name: " Office ",
        contributionAmount: "10000",
        totalMembers: "10",
        startDate: "2026-11-01",
      }),
    ).toEqual({
      name: "Office",
      contributionAmount: 10000,
      totalMembers: 10,
      startDate: "2026-11-01T00:00:00",
    });
  });
});

describe("frequencyLabel", () => {
  it("shows backend enum values readably", () => {
    expect(frequencyLabel("BI_WEEKLY")).toBe("BI-WEEKLY");
    expect(frequencyLabel("MONTHLY")).toBe("MONTHLY");
  });
});

describe("addPeriods (mirrors the backend's CycleService)", () => {
  const start = "2026-11-01T00:00:00";

  it.each([
    ["DAILY", 3, [2026, 11, 4]],
    ["WEEKLY", 2, [2026, 11, 15]],
    ["BI_WEEKLY", 1, [2026, 11, 15]],
    ["MONTHLY", 1, [2026, 12, 1]],
    ["BI_MONTHLY", 1, [2027, 1, 1]],
  ])("adds %s periods", (frequency, periods, expected) => {
    expect(localDate(addPeriods(start, frequency, periods))).toEqual(expected);
  });

  it("clamps to the end of shorter months like Java's plusMonths", () => {
    expect(localDate(addPeriods("2026-01-31T00:00:00", "MONTHLY", 1))).toEqual([2026, 2, 28]);
    expect(localDate(addPeriods("2026-03-31T00:00:00", "MONTHLY", 1))).toEqual([2026, 4, 30]);
  });
});

describe("buildSchedule", () => {
  const group = {
    status: "ACTIVE",
    memberIds: ["a", "b", "c"],
    totalCycles: 3,
    startDate: "2026-11-01T00:00:00",
    frequency: "MONTHLY",
  };

  it("pays members in join order, using real payouts where they exist", () => {
    const schedule = buildSchedule(group, [
      { cycleNumber: 1, userId: "a", scheduledDate: "2026-12-02T09:00:00", status: "PENDING" },
    ]);
    expect(schedule.map((r) => [r.cycle, r.userId, r.estimated, r.status])).toEqual([
      [1, "a", false, "PENDING"],
      [2, "b", true, "UPCOMING"],
      [3, "c", true, "UPCOMING"],
    ]);
    expect(localDate(schedule[0].date)).toEqual([2026, 12, 2]);
    expect(localDate(schedule[1].date)).toEqual([2027, 1, 1]);
  });

  it("lists one cycle per current member while the group is forming", () => {
    expect(buildSchedule({ ...group, status: "FORMING", memberIds: ["a", "b"] }, [])).toHaveLength(
      2,
    );
  });
});

describe("validateBankAccount", () => {
  const valid = { accountNumber: "0123456789", bank: "058", otherCode: "", accountName: "Ada" };

  it("accepts a valid account", () => {
    expect(validateBankAccount(valid)).toEqual({});
  });

  it("requires a 10-digit account number", () => {
    expect(validateBankAccount({ ...valid, accountNumber: "12345" }).accountNumber).toBe(
      "Account number must be 10 digits",
    );
  });

  it("needs a code when 'Other' is chosen", () => {
    expect(validateBankAccount({ ...valid, bank: OTHER_BANK }).bankCode).toBe(
      "Enter your bank code",
    );
  });

  it("sends the typed code for 'Other' banks", () => {
    expect(toBankAccountRequest({ ...valid, bank: OTHER_BANK, otherCode: " 50211 " })).toEqual({
      accountNumber: "0123456789",
      bankCode: "50211",
      accountName: "Ada",
    });
  });
});

describe("canPay", () => {
  it.each([
    ["PENDING", "NGN", true],
    ["PROCESSING", "NGN", true],
    ["FAILED", "NGN", true],
    ["SUCCESSFUL", "NGN", false],
    ["REFUNDED", "NGN", false],
    ["PENDING", "USD", false],
  ])("%s %s contribution -> %s", (status, currency, expected) => {
    expect(canPay({ status, currency })).toBe(expected);
  });
});

describe("normalizePayout", () => {
  it("exposes the backend's payoutStatus as status", () => {
    expect(normalizePayout({ id: "p1", payoutStatus: "SUCCESSFUL" }).status).toBe("SUCCESSFUL");
  });
});
