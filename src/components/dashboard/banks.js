// Nigerian commercial banks and their standard bank codes, as used by Paystack.
// The backend has no bank-list endpoint yet (Paystack's GET /bank needs the secret key),
// so this is a fixed list; "Other" lets members type any code Paystack supports.
// The backend verifies the account with Paystack, so a wrong code is rejected there.
export const BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "030", name: "Heritage Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

export const OTHER_BANK = "other";

// Mirrors the backend BankAccountRequest constraints.
export const validateBankAccount = ({ accountNumber, bank, otherCode, accountName }) => {
  const errors = {};
  if (!accountNumber.trim()) errors.accountNumber = "Account number is required";
  else if (!/^\d{10}$/.test(accountNumber.trim()))
    errors.accountNumber = "Account number must be 10 digits";
  if (!bank) errors.bankCode = "Choose your bank";
  else if (bank === OTHER_BANK && !otherCode.trim()) errors.bankCode = "Enter your bank code";
  if (!accountName.trim()) errors.accountName = "Account name is required";
  return errors;
};

export const toBankAccountRequest = ({ accountNumber, bank, otherCode, accountName }) => ({
  accountNumber: accountNumber.trim(),
  bankCode: bank === OTHER_BANK ? otherCode.trim() : bank,
  accountName: accountName.trim(),
});
