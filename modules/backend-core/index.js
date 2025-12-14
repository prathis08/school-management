// Backend Core Module - Main exports
export {
  register,
  login,
  logout,
  logoutAll,
  getProfile,
  getSessions,
  revokeSession,
} from "./controllers/authController.js";

// Feature management exports
export {
  getAllFeatures,
  getDashboardConfig,
  getSchoolFeatures,
  updateSchoolFeatures,
  checkFeatureEnabled,
  getConfiguredSchools,
  reloadConfig,
} from "./controllers/featureController.js";

// Routes
export { default as authRoutes } from "./routes/authRoutes.js";
export { default as featureRoutes } from "./routes/featureRoutes.js";
export { default as dashboardRoutes } from "./routes/dashboardRoutes.js";

// Models
export { default as User } from "./models/User.js";
export { default as Token } from "./models/Token.js";

// Middleware
export { default as auth } from "./middleware/auth.js";
export { default as authorize } from "./middleware/authorize.js";
export { default as populateUserHeaders } from "./middleware/populateUserHeaders.js";
export { default as errorHandler } from "./middleware/errorHandler.js";
export { default as notFound } from "./middleware/notFound.js";
export {
  requireFeature,
  requireAnyFeature,
  requireAllFeatures,
} from "./middleware/featureAccess.js";

// Config
export { connectDB, getSequelize } from "./config/database.js";

// Constants
export {
  ROLES,
  DASHBOARD_FEATURES,
  FEATURE_CATEGORIES,
  FEATURE_METADATA,
} from "./constants/index.js";

// Services
export { default as TokenCleanupService } from "./services/tokenCleanupService.js";
export { default as FeatureConfigService } from "./services/featureConfigService.js";
