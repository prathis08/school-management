import { DataTypes } from "sequelize";
import { getSequelize } from "../config/database.js";
import { TOKEN_TYPES, isValidTokenType } from "../constants/roles.js";

const sequelize = getSequelize();

const Token = sequelize.define(
  "tokens",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "access",
      validate: {
        isValidType(value) {
          if (!isValidTokenType(value)) {
            throw new Error(
              `Invalid token type. Must be one of: ${Object.values(
                TOKEN_TYPES
              ).join(", ")}`
            );
          }
        },
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Store device/browser information for security",
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "tokens",
    timestamps: true,
    underscored: true, // This makes Sequelize use snake_case for timestamps
    indexes: [
      {
        fields: ["token"],
        unique: true,
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["expiresAt"],
      },
      {
        fields: ["isRevoked"],
      },
      {
        fields: ["type"],
      },
    ],
  }
);

// Instance methods
Token.prototype.isExpired = function () {
  return new Date() > this.expiresAt;
};

Token.prototype.isValid = function () {
  return !this.isRevoked && !this.isExpired();
};

// Static methods
Token.cleanupExpiredTokens = async function () {
  try {
    const result = await this.destroy({
      where: {
        expiresAt: {
          [sequelize.Sequelize.Op.lt]: new Date(),
        },
      },
    });
    console.log(`Cleaned up ${result} expired tokens`);
    return result;
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    throw error;
  }
};

Token.revokeUserTokens = async function (userId, excludeTokenId = null) {
  try {
    const whereClause = {
      userId: userId,
      isRevoked: false,
    };

    if (excludeTokenId) {
      whereClause.id = {
        [sequelize.Sequelize.Op.ne]: excludeTokenId,
      };
    }

    const result = await this.update(
      { isRevoked: true },
      {
        where: whereClause,
      }
    );
    console.log(`Revoked ${result[0]} tokens for user ${userId}`);
    return result[0];
  } catch (error) {
    console.error("Error revoking user tokens:", error);
    throw error;
  }
};

Token.findValidToken = async function (tokenString) {
  try {
    return await this.findOne({
      where: {
        token: tokenString,
        isRevoked: false,
        expiresAt: {
          [sequelize.Sequelize.Op.gt]: new Date(),
        },
      },
      include: [
        {
          model: sequelize.models.users,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });
  } catch (error) {
    console.error("Error finding valid token:", error);
    throw error;
  }
};

export default Token;
