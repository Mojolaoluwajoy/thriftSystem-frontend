// Client-side checks that mirror the backend LoginRequest / RegisterRequest constraints.

// Deliberately loose (something@something) so we never reject an address the backend's
// @Email accepts; the backend stays the final judge.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
// Same as the backend RegisterRequest phoneNumber @Pattern.
const PHONE_PATTERN = /^[+]?[0-9]{10,15}$/;
export const MIN_PASSWORD_LENGTH = 8;

// Drops the spaces, dashes, dots and brackets people commonly type, e.g. "0801 234-5678".
export const normalizePhone = (phone) => phone.replace(/[\s\-().]/g, "");

const checkEmail = (email, errors) => {
  if (!email.trim()) errors.email = "Email is required";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Invalid email format";
};

export const validateLogin = (form) => {
  const errors = {};
  checkEmail(form.email, errors);
  if (!form.password) errors.password = "Password is required";
  return errors;
};

export const validateRegister = (form) => {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  checkEmail(form.email, errors);
  const phone = normalizePhone(form.phoneNumber);
  if (!phone) errors.phoneNumber = "Phone number is required";
  else if (!PHONE_PATTERN.test(phone))
    errors.phoneNumber = "Enter 10–15 digits, optionally starting with +";
  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return errors;
};

// Shapes the forms into the request bodies; passwords are sent exactly as typed.
export const toLoginRequest = (form) => ({ ...form, email: form.email.trim() });

export const toRegisterRequest = (form) => ({
  ...form,
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: form.email.trim(),
  phoneNumber: normalizePhone(form.phoneNumber),
});
