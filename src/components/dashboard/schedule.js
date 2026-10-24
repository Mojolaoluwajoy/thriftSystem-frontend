// Payout schedule helpers. The backend (CycleService) pays members in the order they
// joined: cycle N goes to the Nth member, and each cycle is due N periods after the start.

const addMonths = (date, months) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  // Clamp to the end of shorter months (Jan 31 + 1 month = Feb 28), like Java's plusMonths.
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Mirrors CycleService.addPeriods on the backend.
export function addPeriods(start, frequency, periods) {
  switch (frequency) {
    case "DAILY":
      return addDays(start, periods);
    case "WEEKLY":
      return addDays(start, 7 * periods);
    case "BI_WEEKLY":
      return addDays(start, 14 * periods);
    case "MONTHLY":
      return addMonths(start, periods);
    case "BI_MONTHLY":
      return addMonths(start, 2 * periods);
    default:
      return null;
  }
}

// One row per cycle: who collects, when, and the payout's status once it exists.
// Cycles that haven't opened yet have no payout record, so their date is an estimate
// (the backend can still move it, e.g. off weekends and public holidays).
export function buildSchedule(group, payouts) {
  const memberIds = group.memberIds || [];
  const byCycle = new Map(payouts.map((p) => [p.cycleNumber, p]));
  const cycleCount = group.status === "FORMING" ? memberIds.length : group.totalCycles || 0;

  return Array.from({ length: cycleCount }, (_, i) => {
    const cycle = i + 1;
    const payout = byCycle.get(cycle);
    return {
      cycle,
      userId: payout?.userId ?? memberIds[i],
      payout,
      date: payout?.scheduledDate
        ? new Date(payout.scheduledDate)
        : group.startDate
          ? addPeriods(group.startDate, group.frequency, cycle)
          : null,
      estimated: !payout,
      status: payout?.status ?? "UPCOMING",
    };
  });
}
