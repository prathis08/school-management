/**
 * Middleware to populate X-School-ID and X-User-ID headers from authenticated user's token
 * This middleware should be used after the auth middleware
 */
const populateUserHeaders = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Extract user_id and schoolId from the authenticated user
    const userId = req.user.userId || req.user.id;
    const schoolId = req.user.schoolId;

    // Set the X-User-ID header for the request
    if (userId) {
      req.headers["x-user-id"] = userId;
      res.set("X-User-ID", userId);
      req.userId = userId;
    }

    // Set the X-School-ID header for the request
    if (schoolId) {
      req.headers["x-school-id"] = schoolId;
      res.set("X-School-ID", schoolId);
      req.schoolId = schoolId;
    } else {
      // School ID might be optional for some users (like super admin)
      console.warn(`User ${userId} does not have an associated school ID`);
    }

    next();
  } catch (error) {
    console.error("User headers middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing user headers",
      error: error.message,
    });
  }
};

export default populateUserHeaders;
