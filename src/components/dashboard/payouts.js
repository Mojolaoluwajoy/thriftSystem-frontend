// The backend's PayoutResponse calls its status `payoutStatus`, while contributions and
// groups use `status`. Copy it to `status` when payouts arrive so badges, colours and
// totals work the same for every list.
export const normalizePayout = (payout) => ({
  ...payout,
  status: payout.payoutStatus ?? payout.status,
});

export const normalizePayouts = (payouts) => (payouts || []).map(normalizePayout);
