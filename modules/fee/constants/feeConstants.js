export const FEE_TYPES = {
  TUITION: "TUITION",
  ADMISSION: "ADMISSION",
  EXAM: "EXAM",
  SPORTS: "SPORTS",
  LIBRARY: "LIBRARY",
  LABORATORY: "LABORATORY",
  TRANSPORT: "TRANSPORT",
  HOSTEL: "HOSTEL",
  EXTRA_CURRICULAR: "EXTRA_CURRICULAR",
  CULTURAL: "CULTURAL",
  FINE: "FINE",
  MISCELLANEOUS: "MISCELLANEOUS",
  DEVELOPMENT: "DEVELOPMENT",
  COMPUTER: "COMPUTER",
  ACTIVITY: "ACTIVITY",
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
  PARTIAL: "PARTIAL",
  COMPLETED: "COMPLETED",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
};

export const SCHEDULE_TYPES = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY",
  CUSTOM: "CUSTOM",
};

export const PAYMENT_TYPES = {
  INSTALLMENT: "INSTALLMENT",
  ADVANCE: "ADVANCE",
  PARTIAL: "PARTIAL",
  FINE: "FINE",
  REFUND: "REFUND",
};

export const INSTALLMENT_STATUS = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
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

export const isValidScheduleType = (type) => {
  return Object.values(SCHEDULE_TYPES).includes(type);
};

export const isValidPaymentType = (type) => {
  return Object.values(PAYMENT_TYPES).includes(type);
};

export const isValidInstallmentStatus = (status) => {
  return Object.values(INSTALLMENT_STATUS).includes(status);
};

// Get all values as arrays for validation
export const getFeeTypeValues = () => Object.values(FEE_TYPES);
export const getPaymentMethodValues = () => Object.values(PAYMENT_METHODS);
export const getPaymentStatusValues = () => Object.values(PAYMENT_STATUS);
export const getScheduleTypeValues = () => Object.values(SCHEDULE_TYPES);
export const getPaymentTypeValues = () => Object.values(PAYMENT_TYPES);
export const getInstallmentStatusValues = () =>
  Object.values(INSTALLMENT_STATUS);

// One-time fee types (should only be collected once)
export const ONE_TIME_FEE_TYPES = [FEE_TYPES.ADMISSION];

// Mandatory fee types (must be included in fee structure)
export const MANDATORY_FEE_TYPES = [
  FEE_TYPES.TUITION,
  FEE_TYPES.ADMISSION,
  FEE_TYPES.EXAM,
  FEE_TYPES.LIBRARY,
  FEE_TYPES.DEVELOPMENT,
];
