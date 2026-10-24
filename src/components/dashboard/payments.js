import { apiRequest } from "../../api";

// Statuses the backend lets a member pay for. PROCESSING covers an abandoned checkout;
// if that checkout was actually paid, the backend detects it and replies "already been paid".
const PAYABLE_STATUSES = ["PENDING", "PROCESSING", "FAILED"];

// The backend always starts Paystack checkouts in NGN, so only NGN contributions can be paid.
export const PAYABLE_CURRENCY = "NGN";

export const canPay = (contribution) =>
  PAYABLE_STATUSES.includes(contribution.status) &&
  (contribution.currency || PAYABLE_CURRENCY) === PAYABLE_CURRENCY;

// Starts a Paystack checkout for one contribution and returns the checkout page URL.
export async function startCheckout(contributionId, token) {
  const response = await apiRequest(`/payments/initialize/${contributionId}`, {
    method: "POST",
    token,
  });
  // The backend passes Paystack's reply through: { status, message, data: { authorization_url } }
  const url = response?.data?.authorization_url;
  if (!url) throw new Error("Couldn't start the payment. Please try again.");
  return url;
}

export const goToCheckout = (url) => window.location.assign(url);
