import featureConfigService from "../services/featureConfigService.js";
import {
  DASHBOARD_FEATURES,
  FEATURE_CATEGORIES,
  FEATURE_METADATA,
  getFeatureValues,
  getCategoryValues,
  getFeaturesByCategory,
} from "../constants/features.js";

// Get all available features and their metadata
export const getAllFeatures = async (req, res) => {
  try {
    const features = getFeatureValues().map((feature) => ({
      id: feature,
      ...FEATURE_METADATA[feature],
    }));

    const categories = getCategoryValues().map((category) => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      features: getFeaturesByCategory(category),
    }));

    res.status(200).json({
      success: true,
      data: {
        features,
        categories,
        totalFeatures: features.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching features",
      error: error.message,
    });
  }
};

// Get dashboard configuration for current school
export const getDashboardConfig = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }
    const dashboardConfig = featureConfigService.getDashboardConfig(schoolId);

    res.status(200).json({
      success: true,
      data: dashboardConfig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard configuration",
      error: error.message,
    });
  }
};

// Get features for a specific school (Admin only)
export const getSchoolFeatures = async (req, res) => {
  try {
    const { schoolId } = req.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const features = featureConfigService.getSchoolFeatures(schoolId);

    res.status(200).json({
      success: true,
      data: {
        schoolId,
        features,
        enabledFeatures: features.filter((f) => f.enabled),
        disabledFeatures: features.filter((f) => !f.enabled),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching school features",
      error: error.message,
    });
  }
};

// Update school features (Admin only)
export const updateSchoolFeatures = async (req, res) => {
  try {
    const { schoolId } = req.schoolId;
    const { enabledFeatures } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    if (!enabledFeatures || !Array.isArray(enabledFeatures)) {
      return res.status(400).json({
        success: false,
        message: "Enabled features must be provided as an array",
      });
    }

    featureConfigService.updateSchoolFeatures(schoolId, enabledFeatures);

    const updatedFeatures = featureConfigService.getSchoolFeatures(schoolId);

    res.status(200).json({
      success: true,
      message: "School features updated successfully",
      data: {
        schoolId,
        features: updatedFeatures,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating school features",
      error: error.message,
    });
  }
};

// Check if a specific feature is enabled for current school
export const checkFeatureEnabled = async (req, res) => {
  try {
    const { feature } = req.params;
    const { schoolId } = req.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    if (!feature) {
      return res.status(400).json({
        success: false,
        message: "Feature name is required",
      });
    }

    const isEnabled = featureConfigService.isFeatureEnabled(schoolId, feature);

    res.status(200).json({
      success: true,
      data: {
        schoolId,
        feature,
        enabled: isEnabled,
        metadata: FEATURE_METADATA[feature] || null,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error checking feature status",
      error: error.message,
    });
  }
};

// Get all configured schools (Super Admin only)
export const getConfiguredSchools = async (req, res) => {
  try {
    const schools = featureConfigService.getConfiguredSchools();
    const schoolsWithConfig = schools.map((schoolId) => ({
      schoolId,
      features: featureConfigService.getSchoolFeatures(schoolId),
    }));

    res.status(200).json({
      success: true,
      data: {
        schools: schoolsWithConfig,
        totalSchools: schools.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching configured schools",
      error: error.message,
    });
  }
};

// Reload configuration from file (Admin only)
export const reloadConfig = async (req, res) => {
  try {
    featureConfigService.reloadConfig();

    res.status(200).json({
      success: true,
      message: "Configuration reloaded successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reloading configuration",
      error: error.message,
    });
  }
};
