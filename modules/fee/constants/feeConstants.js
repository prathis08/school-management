export const FEE_TYPES = {
  TUITION: "TUITION",
  TRANSPORT: "TRANSPORT",
  LIBRARY: "LIBRARY",
  LABORATORY: "LABORATORY",
  SPORTS: "SPORTS",
  HOSTEL: "HOSTEL",
  EXAM: "EXAM",
  DEVELOPMENT: "DEVELOPMENT",
  ACTIVITY: "ACTIVITY",
  MISCELLANEOUS: "MISCELLANEOUS",
};

export const PAYMENT_METHODS = {
  CASH: "CASH",
  CHEQUE: "CHEQUE",
  BANK_TRANSFER: "BANK_TRANSFER",
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  ONLINE: "ONLINE",
  UPI: "UPI",
  WALLET: "WALLET",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
};

// Validation functions
export const isValidFeeType = (type) => {
  return Object.values(FEE_TYPES).includes(type);
};

export const isValidPaymentMethod = (method) => {
  return Object.values(PAYMENT_METHODS).includes(method);
};

export const isValidPaymentStatus = (status) => {
  return Object.values(PAYMENT_STATUS).includes(status);
};

// Get all values as arrays for validation
export const getFeeTypeValues = () => Object.values(FEE_TYPES);
export const getPaymentMethodValues = () => Object.values(PAYMENT_METHODS);
export const getPaymentStatusValues = () => Object.values(PAYMENT_STATUS);
