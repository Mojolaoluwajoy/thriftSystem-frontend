import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { fail, mockApi, ok, testUser } from "../../test/mockApi";
import GroupDetails from "./GroupDetails";

const baseGroup = {
  id: "g1",
  name: "Office",
  adminId: "u1",
  status: "FORMING",
  contributionAmount: 10000,
  currency: "NGN",
  frequency: "MONTHLY",
  totalMembers: 3,
  currentCycle: 0,
  totalCycles: 3,
  startDate: "2026-11-01T00:00:00",
  memberIds: ["u1"],
};

// Serves one group; `state` can be changed between calls to simulate the backend updating.
const renderGroup = (state, overrides = {}) => {
  const api = mockApi({
    "GET /group/g1": () => ok(state.group),
    "GET /contributions/group/g1": () => ok(state.contributions ?? []),
    "GET /payouts/group/g1": () => ok(state.payouts ?? []),
    "GET /user/u2": ok({ id: "u2", firstName: "Bayo", lastName: "Ade" }),
    "GET /user/u9": ok({ id: "u9", firstName: "Chi", lastName: "Eze" }),
    ...overrides,
  });
  const onChanged = vi.fn();
  render(
    <GroupDetails
      groupId="g1"
      user={testUser}
      token="t"
      onBack={vi.fn()}
      onChanged={onChanged}
      onLogout={vi.fn()}
    />,
  );
  return { api, onChanged, user: userEvent.setup() };
};
const scheduleRows = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.textContent);

describe("GroupDetails while forming", () => {
  it("lets the admin add members by User ID", async () => {
    const state = { group: baseGroup };
    const { api, onChanged, user } = renderGroup(state);
    const input = await screen.findByLabelText("Add a member by User ID");

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("Enter the member's User ID")).toBeInTheDocument();

    await user.type(input, "u1");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("That user is already in this group")).toBeInTheDocument();

    api.routes["POST /group/g1/members/u2"] = () => {
      state.group = { ...state.group, memberIds: ["u1", "u2"] };
      return ok(state.group);
    };
    await user.clear(input);
    await user.type(input, " u2 ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(api.calls("POST /group/g1/members/u2")).toHaveLength(1);
    expect(await screen.findByText("Bayo Ade")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(onChanged).toHaveBeenCalled();
  });

  it("only allows starting with at least 2 members", async () => {
    const state = { group: baseGroup };
    const { api, user } = renderGroup(state);
    const start = await screen.findByRole("button", { name: "Start group" });
    expect(start).toBeDisabled();
    expect(screen.getByText("You need at least 2 members to start.")).toBeInTheDocument();

    state.group = { ...baseGroup, memberIds: ["u1", "u2"] };
    api.routes["POST /group/g1/members/u9"] = ok(state.group);
    await user.type(screen.getByLabelText("Add a member by User ID"), "u9");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByRole("button", { name: "Start group" })).toBeEnabled();

    api.routes["POST /group/g1/start"] = fail(400, "Group has already started");
    await user.click(screen.getByRole("button", { name: "Start group" }));
    expect(await screen.findByText("Group has already started")).toBeInTheDocument();
  });

  it("shows members a waiting note instead of admin controls", async () => {
    renderGroup({ group: { ...baseGroup, adminId: "u9", memberIds: ["u9", "u1"] } });
    expect(await screen.findByText(/hasn't started yet/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Add a member by User ID")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start group" })).not.toBeInTheDocument();
  });

  it("lists members in payout order with estimated dates", async () => {
    renderGroup({ group: { ...baseGroup, memberIds: ["u1", "u2"] } });
    await screen.findByText("Bayo Ade");
    expect(scheduleRows()).toEqual([
      expect.stringMatching(/^1Ada Obi \(you\)≈ .*UPCOMING$/),
      expect.stringMatching(/^2Bayo Ade≈ .*UPCOMING$/),
    ]);
  });
});

describe("GroupDetails while active", () => {
  const activeGroup = {
    ...baseGroup,
    status: "ACTIVE",
    currentCycle: 1,
    totalCycles: 2,
    memberIds: ["u2", "u1"],
  };
  const payout = {
    id: "p1",
    userId: "u2",
    cycleNumber: 1,
    amount: 20000,
    currency: "NGN",
    payoutStatus: "PENDING",
    scheduledDate: "2026-12-01T00:00:00",
  };
  const contributions = (u1Status, u2Status) => [
    { id: "c1", userId: "u1", cycleNumber: 1, status: u1Status, currency: "NGN" },
    { id: "c2", userId: "u2", cycleNumber: 1, status: u2Status, currency: "NGN" },
  ];
  const processButton = () => screen.queryByRole("button", { name: /payout ·/ });

  it("shows who is collecting and who has paid", async () => {
    renderGroup({
      group: activeGroup,
      contributions: contributions("PENDING", "SUCCESSFUL"),
      payouts: [payout],
    });
    expect(await screen.findByText("Cycle 1 of 2")).toBeInTheDocument();
    expect(await screen.findByText("1 of 2 members paid")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByText(/Collecting:/)).toHaveTextContent("Collecting: Bayo Ade");
    // Only the current user's own contribution gets a Pay button.
    expect(screen.getAllByRole("button", { name: "Pay" })).toHaveLength(1);
  });

  it("keeps Process payout disabled until everyone has paid", async () => {
    renderGroup({
      group: activeGroup,
      contributions: contributions("SUCCESSFUL", "PENDING"),
      payouts: [payout],
    });
    await screen.findByText("Cycle 1 of 2");
    expect(processButton()).toBeDisabled();
    expect(screen.getByText(/once every member has paid/)).toBeInTheDocument();
  });

  it("processes the payout and shows it as processing", async () => {
    const state = {
      group: activeGroup,
      contributions: contributions("SUCCESSFUL", "SUCCESSFUL"),
      payouts: [payout],
    };
    const { api, user } = renderGroup(state);
    expect(await screen.findByRole("button", { name: /process payout ·/i })).toHaveTextContent(
      "₦20,000.00 to Bayo Ade",
    );

    api.routes["POST /payouts/p1/process"] = () => {
      state.payouts = [{ ...payout, payoutStatus: "PROCESSING" }];
      return ok(state.payouts[0]);
    };
    await user.click(screen.getByRole("button", { name: /process payout ·/i }));

    expect(api.calls("POST /payouts/p1/process")).toHaveLength(1);
    expect(await screen.findByText(/is being processed/)).toBeInTheDocument();
    expect(processButton()).not.toBeInTheDocument();
  });

  it("shows the backend's refusal, e.g. Access denied", async () => {
    const { api, user } = renderGroup({
      group: activeGroup,
      contributions: contributions("SUCCESSFUL", "SUCCESSFUL"),
      payouts: [payout],
    });
    api.routes["POST /payouts/p1/process"] = fail(403, "Access denied");
    await user.click(await screen.findByRole("button", { name: /process payout ·/i }));
    expect(await screen.findByText("Access denied")).toBeInTheDocument();
    expect(processButton()).toBeEnabled();
  });

  it("offers a retry with the reason after a failed transfer", async () => {
    renderGroup({
      group: activeGroup,
      contributions: contributions("SUCCESSFUL", "SUCCESSFUL"),
      payouts: [{ ...payout, payoutStatus: "FAILED", failureReason: "Account resolution failed" }],
    });
    expect(await screen.findByRole("button", { name: /retry payout ·/i })).toBeEnabled();
    expect(screen.getByText("Last attempt failed: Account resolution failed")).toBeInTheDocument();
  });

  it("hides payout controls from members who aren't the admin", async () => {
    renderGroup({
      group: { ...activeGroup, adminId: "u9" },
      contributions: contributions("SUCCESSFUL", "SUCCESSFUL"),
      payouts: [payout],
    });
    await screen.findByText("Cycle 1 of 2");
    expect(processButton()).not.toBeInTheDocument();
  });
});

describe("GroupDetails loading", () => {
  it("shows an error with Retry when the group can't be loaded", async () => {
    const { api, user } = renderGroup(
      { group: baseGroup },
      { "GET /group/g1": fail(500, "Server error") },
    );
    expect(await screen.findByText("Couldn't load this group: Server error")).toBeInTheDocument();

    api.routes["GET /group/g1"] = ok(baseGroup);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("heading", { name: "Office" })).toBeInTheDocument();
    expect(screen.queryByText(/Couldn't load this group/)).not.toBeInTheDocument();
  });
});
