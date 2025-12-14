export const GENDER_TYPES = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

// Validation function
export const isValidGender = (gender) => {
  return Object.values(GENDER_TYPES).includes(gender);
};

// Get all values as array for validation
export const getGenderValues = () => Object.values(GENDER_TYPES);
