import featureConfigService from "../services/featureConfigService.js";
import { isValidFeature } from "../constants/features.js";

/**
 * Middleware to check if a feature is enabled for the user's school
 * @param {string} feature - The feature to check
 * @returns {Function} Express middleware function
 */
export const requireFeature = (feature) => {
  return (req, res, next) => {
    try {
      // Validate feature name
      if (!isValidFeature(feature)) {
        return res.status(400).json({
          success: false,
          message: `Invalid feature: ${feature}`,
        });
      }

      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Get school ID from userc

      const schoolId = req.schoolId;
      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: "School ID is required",
        });
      }

      // Check if feature is enabled for the school
      const isEnabled = featureConfigService.isFeatureEnabled(
        schoolId,
        feature
      );

      if (!isEnabled) {
        return res.status(403).json({
          success: false,
          message: `Feature '${feature}' is not enabled for your school`,
          featureRequired: feature,
        });
      }

      // Add feature info to request for potential use in controllers
      req.feature = {
        name: feature,
        enabled: true,
        schoolId,
      };

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking feature access",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware to check multiple features (at least one must be enabled)
 * @param {string[]} features - Array of features to check
 * @returns {Function} Express middleware function
 */
export const requireAnyFeature = (features) => {
  return (req, res, next) => {
    try {
      // Validate feature names
      const invalidFeatures = features.filter((f) => !isValidFeature(f));
      if (invalidFeatures.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid features: ${invalidFeatures.join(", ")}`,
        });
      }

      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { schoolId } = req.schoolId;

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: "School ID is required",
        });
      }

      // Check if any feature is enabled
      const enabledFeatures = features.filter((feature) =>
        featureConfigService.isFeatureEnabled(schoolId, feature)
      );

      if (enabledFeatures.length === 0) {
        return res.status(403).json({
          success: false,
          message: `None of the required features are enabled for your school`,
          featuresRequired: features,
          enabledFeatures: [],
        });
      }

      // Add enabled features info to request
      req.features = {
        required: features,
        enabled: enabledFeatures,
        schoolId,
      };

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking feature access",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware to check all features (all must be enabled)
 * @param {string[]} features - Array of features to check
 * @returns {Function} Express middleware function
 */
export const requireAllFeatures = (features) => {
  return (req, res, next) => {
    try {
      // Validate feature names
      const invalidFeatures = features.filter((f) => !isValidFeature(f));
      if (invalidFeatures.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid features: ${invalidFeatures.join(", ")}`,
        });
      }

      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { schoolId } = req.schoolId;

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: "School ID is required",
        });
      }

      // Check if all features are enabled
      const disabledFeatures = features.filter(
        (feature) => !featureConfigService.isFeatureEnabled(schoolId, feature)
      );

      if (disabledFeatures.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Required features are not enabled for your school`,
          featuresRequired: features,
          disabledFeatures,
        });
      }

      // Add features info to request
      req.features = {
        required: features,
        enabled: features,
        schoolId,
      };

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking feature access",
        error: error.message,
      });
    }
  };
};

export default {
  requireFeature,
  requireAnyFeature,
  requireAllFeatures,
};
