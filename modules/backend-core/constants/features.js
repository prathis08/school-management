export const DASHBOARD_FEATURES = {
  DASHBOARD: "dashboard",
  STUDENTS: "students",
  TEACHERS: "teachers",
  CLASSES: "classes",
  SUBJECTS: "subjects",
  LIBRARY: "library",
  FEES: "fees",
  ATTENDANCE: "attendance",
  NOTIFICATIONS: "notifications",
};

// Additional feature categories for future expansion
export const FEATURE_CATEGORIES = {
  CORE: "core",
  ACADEMIC: "academic",
  FINANCIAL: "financial",
  COMMUNICATION: "communication",
  ADMINISTRATIVE: "administrative",
};

// Feature metadata with categories and descriptions
export const FEATURE_METADATA = {
  [DASHBOARD_FEATURES.DASHBOARD]: {
    name: "Dashboard",
    description: "Main dashboard with overview and analytics",
    category: FEATURE_CATEGORIES.CORE,
    required: true, // Cannot be disabled
  },
  [DASHBOARD_FEATURES.STUDENTS]: {
    name: "Student Management",
    description: "Student enrollment, profiles, and management",
    category: FEATURE_CATEGORIES.ACADEMIC,
    required: false,
  },
  [DASHBOARD_FEATURES.TEACHERS]: {
    name: "Teacher Management",
    description: "Teacher profiles, assignments, and management",
    category: FEATURE_CATEGORIES.ACADEMIC,
    required: false,
  },
  [DASHBOARD_FEATURES.TEACHERS]: {
    name: "Teacher Management",
    description: "Teacher profiles, assignments, and management",
    category: FEATURE_CATEGORIES.ACADEMIC,
    required: false,
  },
  [DASHBOARD_FEATURES.CLASSES]: {
    name: "Class Management",
    description: "Class creation, scheduling, and management",
    category: FEATURE_CATEGORIES.ACADEMIC,
    required: false,
  },
  [DASHBOARD_FEATURES.SUBJECTS]: {
    name: "Subject Management",
    description: "Subject creation, curriculum, and management",
    category: FEATURE_CATEGORIES.ACADEMIC,
    required: false,
  },
  [DASHBOARD_FEATURES.LIBRARY]: {
    name: "Library Management",
    description: "Book inventory, lending, and library operations",
    category: FEATURE_CATEGORIES.ADMINISTRATIVE,
    required: false,
  },
  [DASHBOARD_FEATURES.FEES]: {
    name: "Fee Management",
    description: "Fee structure, payments, and financial tracking",
    category: FEATURE_CATEGORIES.FINANCIAL,
    required: false,
  },
  [DASHBOARD_FEATURES.ATTENDANCE]: {
    name: "Attendance Tracking",
    description: "Student and staff attendance management",
    category: FEATURE_CATEGORIES.ACADEMIC,
    required: false,
  },
  [DASHBOARD_FEATURES.NOTIFICATIONS]: {
    name: "Notification System",
    description: "Announcements, alerts, and communication",
    category: FEATURE_CATEGORIES.COMMUNICATION,
    required: false,
  },
};

// Validation functions
export const isValidFeature = (feature) => {
  return Object.values(DASHBOARD_FEATURES).includes(feature);
};

export const isValidFeatureCategory = (category) => {
  return Object.values(FEATURE_CATEGORIES).includes(category);
};

// Utility functions
export const getFeatureValues = () => Object.values(DASHBOARD_FEATURES);
export const getCategoryValues = () => Object.values(FEATURE_CATEGORIES);

export const getFeaturesByCategory = (category) => {
  return Object.entries(FEATURE_METADATA)
    .filter(([, metadata]) => metadata.category === category)
    .map(([feature]) => feature);
};

export const getRequiredFeatures = () => {
  return Object.entries(FEATURE_METADATA)
    .filter(([, metadata]) => metadata.required)
    .map(([feature]) => feature);
};

export const getOptionalFeatures = () => {
  return Object.entries(FEATURE_METADATA)
    .filter(([, metadata]) => !metadata.required)
    .map(([feature]) => feature);
};
