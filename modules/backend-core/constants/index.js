// Re-export roles and token types
export {
  ROLES,
  TOKEN_TYPES,
  isValidRole,
  isValidTokenType,
  getRoleValues,
  getTokenTypeValues,
} from "./roles.js";

// Re-export dashboard features
export {
  DASHBOARD_FEATURES,
  FEATURE_CATEGORIES,
  FEATURE_METADATA,
  isValidFeature,
  isValidFeatureCategory,
  getFeatureValues,
  getCategoryValues,
  getFeaturesByCategory,
  getRequiredFeatures,
  getOptionalFeatures,
} from "./features.js";

// Re-export fee constants
export {
  FEE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  isValidFeeType,
  isValidPaymentMethod,
  isValidPaymentStatus,
  getFeeTypeValues,
  getPaymentMethodValues,
  getPaymentStatusValues,
} from "../../fee/constants/feeConstants.js";

// General application constants
export const APP_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ["jpg", "jpeg", "png", "gif"],
  SUPPORTED_DOCUMENT_TYPES: ["pdf", "doc", "docx"],
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Date and time constants
export const DATE_FORMATS = {
  DEFAULT: "YYYY-MM-DD",
  DISPLAY: "DD/MM/YYYY",
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  TIME: "HH:mm:ss",
};

// Academic year constants
export const ACADEMIC_YEAR = {
  START_MONTH: 4, // April
  END_MONTH: 3, // March
};
