import { Op } from "sequelize";

/**
 * Check if a string is a valid UUID format
 * @param {string} str - String to check
 * @returns {boolean} - True if string is UUID format
 */
const isValidUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Find all records by school
 * @param {object} Model - Sequelize model
 * @param {string} schoolId - School identifier
 * @param {object} where - Additional where conditions
 * @param {object} options - Sequelize options
 * @returns {Promise<array>} - Array of records
 */
export const findAllBySchool = async (
  Model,
  schoolId,
  where = {},
  options = {}
) => {
  return await Model.findAll({
    where: {
      schoolId: schoolId,
      ...where,
    },
    ...options,
  });
};

/**
 * Find a record by ID and school
 * @param {object} Model - Sequelize model
 * @param {string} id - Record ID (UUID)
 * @param {string} schoolId - School identifier
 * @param {object} options - Sequelize options
 * @returns {Promise<object|null>} - Record or null
 */
export const findByIdAndSchool = async (Model, id, schoolId, options = {}) => {
  return await Model.findOne({
    where: {
      id,
      schoolId: schoolId,
    },
    ...options,
  });
};

/**
 * Find a record by custom ID and school
 * @param {object} Model - Sequelize model
 * @param {string} customId - Custom ID value
 * @param {string} schoolId - School identifier
 * @param {string} customIdField - Custom ID field name
 * @param {object} options - Sequelize options
 * @returns {Promise<object|null>} - Record or null
 */
export const findByCustomIdAndSchool = async (
  Model,
  customId,
  schoolId,
  customIdField,
  options = {}
) => {
  return await Model.findOne({
    where: {
      [customIdField]: customId,
      schoolId: schoolId,
    },
    ...options,
  });
};

/**
 * Find a record by identifier (UUID or custom ID) and school
 * @param {object} Model - Sequelize model
 * @param {string} identifier - UUID or custom ID
 * @param {string} schoolId - School identifier
 * @param {string} customIdField - Custom ID field name (optional)
 * @param {object} options - Sequelize options
 * @returns {Promise<object|null>} - Record or null
 */
export const findByIdentifierAndSchool = async (
  Model,
  identifier,
  schoolId,
  customIdField = null,
  options = {}
) => {
  const whereConditions = {
    schoolId: schoolId,
  };

  // If identifier is a valid UUID, only search by id field
  // If identifier is not a valid UUID and customIdField is provided, only search by custom ID field
  if (isValidUUID(identifier)) {
    whereConditions.id = identifier;
  } else if (customIdField) {
    whereConditions[customIdField] = identifier;
  } else {
    // If no customIdField provided and not a UUID, search by id field anyway (will likely fail)
    whereConditions.id = identifier;
  }

  return await Model.findOne({
    where: whereConditions,
    ...options,
  });
};

/**
 * Count records by school
 * @param {object} Model - Sequelize model
 * @param {string} schoolId - School identifier
 * @param {object} where - Additional where conditions
 * @returns {Promise<number>} - Count of records
 */
export const countBySchool = async (Model, schoolId, where = {}) => {
  return await Model.count({
    where: {
      schoolId: schoolId,
      ...where,
    },
  });
};

/**
 * Create a record with school
 * @param {object} Model - Sequelize model
 * @param {object} data - Record data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created record
 */
export const createWithSchool = async (Model, data, schoolId) => {
  return await Model.create({
    ...data,
    schoolId: schoolId,
  });
};

/**
 * Update record by ID and school
 * @param {object} Model - Sequelize model
 * @param {object} updated_ata - Data to update
 * @param {string} id - Record ID (UUID)
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateByIdAndSchool = async (Model, updated_ata, id, schoolId) => {
  return await Model.update(updated_ata, {
    where: {
      id,
      schoolId: schoolId,
    },
  });
};

/**
 * Update record by custom ID and school
 * @param {object} Model - Sequelize model
 * @param {object} updated_ata - Data to update
 * @param {string} customId - Custom ID value
 * @param {string} schoolId - School identifier
 * @param {string} customIdField - Custom ID field name
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateByCustomIdAndSchool = async (
  Model,
  updated_ata,
  customId,
  schoolId,
  customIdField
) => {
  return await Model.update(updated_ata, {
    where: {
      [customIdField]: customId,
      schoolId: schoolId,
    },
  });
};

/**
 * Delete (mark as inactive) record by ID and school
 * @param {object} Model - Sequelize model
 * @param {string} id - Record ID (UUID)
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteByIdAndSchool = async (Model, id, schoolId) => {
  return await Model.update(
    { is_active: false },
    {
      where: {
        id,
        schoolId: schoolId,
      },
    }
  );
};

/**
 * Generic function to find by identifier (UUID or custom ID)
 * @param {object} Model - Sequelize model
 * @param {string} identifier - UUID or custom ID
 * @param {object} options - Sequelize options
 * @returns {Promise<object|null>} - Record or null
 */
export const findByIdentifier = async (Model, identifier, options = {}) => {
  // If identifier is a valid UUID, search by primary key (id)
  if (isValidUUID(identifier)) {
    return await Model.findByPk(identifier, options);
  }

  // If not a valid UUID, search by custom ID field
  const modelName = Model.name.toLowerCase();
  let customIdField;

  switch (modelName) {
    case "student":
      customIdField = "student_id";
      break;
    case "teacher":
      customIdField = "teacher_id";
      break;
    case "class":
      customIdField = "class_id";
      break;
    case "subject":
      customIdField = "subject_id";
      break;
    default:
      customIdField = `${modelName}_id`;
  }

  if (customIdField) {
    return await Model.findOne({
      where: {
        [customIdField]: identifier,
      },
      ...options,
    });
  }

  return null;
};
