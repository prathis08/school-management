import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";
import {
  DASHBOARD_FEATURES,
  FEATURE_METADATA,
  isValidFeature,
  getRequiredFeatures,
} from "../constants/features.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FeatureConfigService {
  constructor() {
    this.configPath = path.join(
      __dirname,
      "../../../config/school-features.yml"
    );
    this.config = null;
    this.loadConfig();
  }

  // Load configuration from YAML file
  loadConfig() {
    try {
      const fileContents = fs.readFileSync(this.configPath, "utf8");
      this.config = yaml.load(fileContents);
    } catch (error) {
      console.error("Error loading feature configuration:", error);
      this.config = this.getDefaultConfig();
    }
  }

  // Get default configuration if file is not available
  getDefaultConfig() {
    return {
      default: {
        enabled_features: Object.values(DASHBOARD_FEATURES),
      },
      schools: {},
    };
  }

  // Get enabled features for a specific school
  getEnabledFeatures(schoolId) {
    if (!schoolId) {
      return this.config.default.enabled_features || [];
    }

    const schoolConfig = this.config.schools[schoolId];
    if (schoolConfig && schoolConfig.enabled_features) {
      return schoolConfig.enabled_features;
    }

    // Return default features if school not configured
    return this.config.default.enabled_features || [];
  }

  // Check if a feature is enabled for a school
  isFeatureEnabled(schoolId, feature) {
    if (!isValidFeature(feature)) {
      throw new Error(`Invalid feature: ${feature}`);
    }

    // Required features are always enabled
    const requiredFeatures = getRequiredFeatures();
    if (requiredFeatures.includes(feature)) {
      return true;
    }

    const enabledFeatures = this.getEnabledFeatures(schoolId);
    return enabledFeatures.includes(feature);
  }

  // Get available features with metadata for a school
  getSchoolFeatures(schoolId) {
    const enabledFeatures = this.getEnabledFeatures(schoolId);

    return Object.values(DASHBOARD_FEATURES).map((feature) => ({
      id: feature,
      ...FEATURE_METADATA[feature],
      enabled: enabledFeatures.includes(feature),
    }));
  }

  // Get dashboard configuration for a school
  getDashboardConfig(schoolId) {
    const features = this.getSchoolFeatures(schoolId);

    return {
      schoolId,
      features: features.filter((f) => f.enabled),
      totalFeatures: features.length,
      enabledCount: features.filter((f) => f.enabled).length,
    };
  }

  // Update school configuration (for admin use)
  updateSchoolFeatures(schoolId, enabledFeatures) {
    if (!this.config.schools) {
      this.config.schools = {};
    }

    // Validate features
    const invalidEnabled = enabledFeatures.filter((f) => !isValidFeature(f));

    if (invalidEnabled.length > 0) {
      throw new Error(`Invalid enabled features: ${invalidEnabled.join(", ")}`);
    }

    // Ensure required features are always enabled
    const requiredFeatures = getRequiredFeatures();
    const finalEnabledFeatures = [
      ...new Set([...enabledFeatures, ...requiredFeatures]),
    ];

    this.config.schools[schoolId] = {
      enabled_features: finalEnabledFeatures,
    };

    this.saveConfig();
  }

  // Save configuration back to YAML file
  saveConfig() {
    try {
      const yamlStr = yaml.dump(this.config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      });
      fs.writeFileSync(this.configPath, yamlStr, "utf8");
    } catch (error) {
      console.error("Error saving feature configuration:", error);
      throw error;
    }
  }

  // Reload configuration from file
  reloadConfig() {
    this.loadConfig();
  }

  // Get all configured schools
  getConfiguredSchools() {
    return Object.keys(this.config.schools || {});
  }
}

// Create singleton instance
const featureConfigService = new FeatureConfigService();

export default featureConfigService;
