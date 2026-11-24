import { DataTypes } from "sequelize";
import { getSequelize } from "../../backend-core/config/database.js";
import {
  DEFAULT_PROMOTION_RULE,
  PROMOTION_OUTCOME_ON_FAIL,
  isValidPromotionOutcome,
} from "../constants/academicConstants.js";
import { generateCustomIdWithPrefix } from "../../backend-core/utils/customIdGenerator.js";

const sequelize = getSequelize();

/**
 * Per-school promotion / exam-result settings used to decide whether a student
 * moves to the next grade. One active rule per school.
 */
const PromotionRule = sequelize.define(
  "promotion_rule",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ruleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateCustomIdWithPrefix("PROMRULE"),
    },
    schoolId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    minOverallPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: DEFAULT_PROMOTION_RULE.minOverallPercentage,
    },
    mustPassAllSubjects: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: DEFAULT_PROMOTION_RULE.mustPassAllSubjects,
    },
    maxFailedSubjects: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: DEFAULT_PROMOTION_RULE.maxFailedSubjects,
    },
    minAttendancePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: DEFAULT_PROMOTION_RULE.minAttendancePercentage,
    },
    outcomeOnFail: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: PROMOTION_OUTCOME_ON_FAIL.RETAIN,
      validate: {
        isValidOutcome(value) {
          if (!isValidPromotionOutcome(value)) {
            throw new Error("Invalid outcomeOnFail (RETAIN or CONDITIONAL)");
          }
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "promotion_rules",
    timestamps: true,
    underscored: true,
  },
);

PromotionRule.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.id;
  return values;
};

export default PromotionRule;
