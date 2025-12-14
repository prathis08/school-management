import express from "express";
import {
  getAllFeatures,
  getDashboardConfig,
  getSchoolFeatures,
  updateSchoolFeatures,
  checkFeatureEnabled,
  getConfiguredSchools,
  reloadConfig,
} from "../controllers/featureController.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";
import populateUserHeaders from "../middleware/populateUserHeaders.js";

const router = express.Router();

// Public routes (authenticated users)
router.get("/features", auth, getAllFeatures);
router.get(
  "/get-dashboard-config",
  auth,
  populateUserHeaders,
  getDashboardConfig
);
router.get("/check/:feature", auth, checkFeatureEnabled);

// School-specific routes (Admin, Coordinator)
router.get(
  "/school/:schoolId",
  auth,
  authorize(ROLES.ADMIN, ROLES.COORDINATOR),
  getSchoolFeatures
);

// Admin only routes
router.put(
  "/school/:schoolId",
  auth,
  authorize(ROLES.ADMIN),
  updateSchoolFeatures
);

router.get("/schools/all", auth, authorize(ROLES.ADMIN), getConfiguredSchools);

router.post("/reload-config", auth, authorize(ROLES.ADMIN), reloadConfig);

export default router;
