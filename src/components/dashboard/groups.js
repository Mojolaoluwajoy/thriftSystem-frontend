// Must match the backend ContributionFrequency enum.
export const FREQUENCIES = ["DAILY", "WEEKLY", "BI_WEEKLY", "MONTHLY", "BI_MONTHLY"];
export const frequencyLabel = (f) => f?.replace("_", "-");

export const EMPTY_GROUP_FORM = {
  name: "",
  description: "",
  contributionAmount: "",
  currency: "NGN",
  frequency: "MONTHLY",
  startDate: "",
  totalMembers: "",
};

// Mirrors the backend CreateGroupRequest constraints so mistakes are caught before submitting.
export const validateGroup = (form) => {
  const errors = {};
  const amount = Number(form.contributionAmount);
  const members = Number(form.totalMembers);
  if (!form.name.trim()) errors.name = "Group name is required";
  if (form.contributionAmount === "") errors.contributionAmount = "Contribution amount is required";
  else if (!Number.isFinite(amount) || amount <= 0)
    errors.contributionAmount = "Contribution amount must be positive";
  if (form.totalMembers === "") errors.totalMembers = "Total members is required";
  else if (!Number.isInteger(members) || members <= 0)
    errors.totalMembers = "Total members must be a positive whole number";
  if (!form.startDate) errors.startDate = "Start date is required";
  if (!form.currency) errors.currency = "Currency is required";
  return errors;
};

// Shapes the form into the backend CreateGroupRequest body.
export const toCreateGroupRequest = (form) => ({
  ...form,
  name: form.name.trim(),
  contributionAmount: Number(form.contributionAmount),
  totalMembers: Number(form.totalMembers),
  // Backend expects a LocalDateTime; send local midnight with no timezone suffix.
  startDate: `${form.startDate}T00:00:00`,
});
