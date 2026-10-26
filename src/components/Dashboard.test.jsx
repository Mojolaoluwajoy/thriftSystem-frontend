import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { emptyDashboardRoutes, fail, mockApi, ok, testUser } from "../test/mockApi";
import Dashboard from "./Dashboard";

vi.mock("./dashboard/payments", async (importOriginal) => ({
  ...(await importOriginal()),
  goToCheckout: vi.fn(),
}));
const { goToCheckout } = await import("./dashboard/payments");

const renderDashboard = (routes = {}) => {
  const api = mockApi({ ...emptyDashboardRoutes(), ...routes });
  render(<Dashboard user={testUser} token="t" onLogout={vi.fn()} />);
  return { api, user: userEvent.setup() };
};
const openTab = (user, name) => user.click(screen.getByRole("button", { name }));
const statCard = (label) => screen.getByText(label).parentElement;
// A response that waits until the test releases it.
const deferred = () => {
  let release;
  const promise = new Promise((resolve) => (release = resolve));
  return { route: () => promise, release };
};

describe("Dashboard loading states", () => {
  it("shows Loading… rather than 'No groups yet' until the groups arrive", async () => {
    const groups = deferred();
    const { user } = renderDashboard({ "GET /group/my-groups": groups.route });
    await openTab(user, /my groups/i);

    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    expect(screen.queryByText(/no groups yet/i)).not.toBeInTheDocument();

    groups.release(ok([]));
    expect(await screen.findByText(/no groups yet/i)).toBeInTheDocument();
  });

  it("shows … in stat cards while loading instead of a misleading zero", () => {
    const pending = deferred();
    renderDashboard({ "GET /payouts/my-payouts": pending.route });
    expect(within(statCard("Total Payouts")).getByText("…")).toBeInTheDocument();
  });

  it("marks a failed list as failed and recovers it with Retry", async () => {
    const { api, user } = renderDashboard({ "GET /payouts/my-payouts": fail(500, "Server error") });

    expect(await screen.findByText("Couldn't load payouts: Server error")).toBeInTheDocument();
    expect(within(statCard("Total Payouts")).getByText("—")).toBeInTheDocument();
    await openTab(user, /payouts/i);
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't load this list");

    api.routes["GET /payouts/my-payouts"] = ok([]);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No payouts yet")).toBeInTheDocument();
    expect(screen.queryByText(/couldn't load payouts/i)).not.toBeInTheDocument();
  });
});

describe("Dashboard payouts", () => {
  it("reads the backend's payoutStatus for badges and totals", async () => {
    const { user } = renderDashboard({
      "GET /payouts/my-payouts": ok([
        { id: "p1", amount: 30000, currency: "NGN", payoutStatus: "SUCCESSFUL", cycleNumber: 1 },
        { id: "p2", amount: 30000, currency: "NGN", payoutStatus: "PENDING", cycleNumber: 2 },
      ]),
    });
    expect(await within(statCard("Total Payouts")).findByText("₦30,000.00")).toBeInTheDocument();

    await openTab(user, /payouts/i);
    expect(screen.getByText("SUCCESSFUL")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });
});

describe("Create group", () => {
  const openForm = async (user) => {
    await openTab(user, /my groups/i);
    await user.click(screen.getByRole("button", { name: "+ Create Group" }));
  };

  it("validates before sending", async () => {
    const { api, user } = renderDashboard();
    await openForm(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Group name is required")).toBeInTheDocument();
    expect(screen.getByText("Start date is required")).toBeInTheDocument();
    expect(api.calls("POST /group/create-group")).toHaveLength(0);
  });

  it("sends the request the backend expects and refreshes the groups", async () => {
    const { api, user } = renderDashboard({ "POST /group/create-group": ok({ id: "g1" }) });
    await openForm(user);
    await user.type(screen.getByPlaceholderText("e.g. Office Thrift 2026"), " Office ");
    await user.type(screen.getByPlaceholderText("e.g. 10000"), "10000");
    await user.type(screen.getByPlaceholderText("e.g. 10"), "5");
    await user.type(document.querySelector('input[type="date"]'), "2026-11-01");
    await user.selectOptions(screen.getByDisplayValue("MONTHLY"), "BI_WEEKLY");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(api.calls("POST /group/create-group")[0].body).toEqual({
      name: "Office",
      description: "",
      contributionAmount: 10000,
      currency: "NGN",
      frequency: "BI_WEEKLY",
      startDate: "2026-11-01T00:00:00",
      totalMembers: 5,
    });
    expect(api.calls("GET /group/my-groups")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Create" })).not.toBeInTheDocument();
  });

  it("shows the backend's per-field errors", async () => {
    const { user } = renderDashboard({
      "POST /group/create-group": fail(400, "Validation failed", {
        name: "You already have a group with this name",
      }),
    });
    await openForm(user);
    await user.type(screen.getByPlaceholderText("e.g. Office Thrift 2026"), "Office");
    await user.type(screen.getByPlaceholderText("e.g. 10000"), "10000");
    await user.type(screen.getByPlaceholderText("e.g. 10"), "5");
    await user.type(document.querySelector('input[type="date"]'), "2026-11-01");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("You already have a group with this name")).toBeInTheDocument();
  });
});

describe("Paying contributions", () => {
  const contributions = [
    { id: "c1", amount: 10000, currency: "NGN", status: "PENDING", cycleNumber: 1 },
    { id: "c2", amount: 10000, currency: "NGN", status: "SUCCESSFUL", cycleNumber: 2 },
    { id: "c3", amount: 10000, currency: "NGN", status: "FAILED", cycleNumber: 3 },
    { id: "c4", amount: 50, currency: "USD", status: "PENDING", cycleNumber: 4 },
  ];
  // Each contribution row has a coloured left border.
  const row = (cycle) =>
    screen.getByText(new RegExp(`Cycle ${cycle} ·`)).closest('[style*="border-left: 3px"]');

  it("offers Pay only where the backend allows it", async () => {
    const { user } = renderDashboard({
      "GET /contributions/my-contributions": ok(contributions),
    });
    await openTab(user, /contributions/i);
    await screen.findByText(/Cycle 1 ·/);

    expect(within(row(1)).getByRole("button", { name: "Pay" })).toBeInTheDocument();
    expect(within(row(2)).queryByRole("button")).not.toBeInTheDocument();
    expect(within(row(3)).getByRole("button", { name: "Retry payment" })).toBeInTheDocument();
    expect(within(row(4)).queryByRole("button")).not.toBeInTheDocument();
    expect(within(row(4)).getByText(/only available in NGN/)).toBeInTheDocument();
  });

  it("opens Paystack checkout", async () => {
    const { api, user } = renderDashboard({
      "GET /contributions/my-contributions": ok(contributions),
      "POST /payments/initialize/c1": ok({
        status: true,
        data: { authorization_url: "https://checkout.paystack.com/abc" },
      }),
    });
    await openTab(user, /contributions/i);
    await user.click(await screen.findByRole("button", { name: "Pay" }));

    expect(api.calls("POST /payments/initialize/c1")).toHaveLength(1);
    expect(goToCheckout).toHaveBeenCalledWith("https://checkout.paystack.com/abc");
  });

  it("refreshes the list when the backend says it was already paid", async () => {
    const { api, user } = renderDashboard({
      "GET /contributions/my-contributions": ok(contributions),
      "POST /payments/initialize/c3": fail(400, "Contribution has already been paid"),
    });
    await openTab(user, /contributions/i);
    await user.click(await screen.findByRole("button", { name: "Retry payment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("already been paid");
    expect(api.calls("GET /contributions/my-contributions")).toHaveLength(2);
    expect(goToCheckout).not.toHaveBeenCalled();
  });
});

describe("Bank account", () => {
  it("links a payout account after validating it", async () => {
    const { api, user } = renderDashboard({
      "GET /user/me": ok({ id: "u1", bankAccountLinked: false }),
      "PUT /user/me/bank-account": ok({
        id: "u1",
        bankAccountLinked: true,
        bankAccountName: "ADA OBI",
      }),
    });
    await openTab(user, /profile/i);
    await user.click(await screen.findByRole("button", { name: "Add bank account" }));

    await user.click(screen.getByRole("button", { name: "Save bank account" }));
    expect(screen.getByText("Choose your bank", { selector: "p" })).toBeInTheDocument();
    expect(api.calls("PUT /user/me/bank-account")).toHaveLength(0);

    await user.selectOptions(screen.getByLabelText("Bank"), "058");
    await user.type(screen.getByLabelText("Account number"), "01ab23456789");
    await user.type(screen.getByLabelText("Account name"), "Ada Obi");
    await user.click(screen.getByRole("button", { name: "Save bank account" }));

    expect(api.calls("PUT /user/me/bank-account")[0].body).toEqual({
      accountNumber: "0123456789",
      bankCode: "058",
      accountName: "Ada Obi",
    });
    expect(await screen.findByText("ADA OBI")).toBeInTheDocument();
  });

  it("keeps the form open with the error when Paystack rejects the account", async () => {
    const { user } = renderDashboard({
      "GET /user/me": ok({ id: "u1", bankAccountLinked: false }),
      "PUT /user/me/bank-account": fail(400, "Could not verify bank account"),
    });
    await openTab(user, /profile/i);
    await user.click(await screen.findByRole("button", { name: "Add bank account" }));
    await user.selectOptions(screen.getByLabelText("Bank"), "other");
    await user.type(screen.getByPlaceholderText(/bank code/i), "50211");
    await user.type(screen.getByLabelText("Account number"), "0123456789");
    await user.type(screen.getByLabelText("Account name"), "Ada Obi");
    await user.click(screen.getByRole("button", { name: "Save bank account" }));

    expect(await screen.findByText("Could not verify bank account")).toBeInTheDocument();
    expect(screen.getByLabelText("Account number")).toBeInTheDocument();
  });
});
