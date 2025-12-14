import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["DB_NAME", "DB_USER", "DB_HOST"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    "Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error("Please check your .env file");
  process.exit(1);
}

console.log("Database Configuration:");
console.log("- Host:", process.env.DB_HOST);
console.log("- Port:", process.env.DB_PORT || 5432);
console.log("- Database:", process.env.DB_NAME);
console.log("- User:", process.env.DB_USER);
console.log("- Dialect:", process.env.DB_DIALECT || "postgres");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: false, // Disable SQL logging
    define: {
      underscored: true,
      timestamps: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: process.env.DB_HOST.includes("aivencloud.com")
        ? {
            require: true,
            rejectUnauthorized: false, // For cloud providers like Aiven
          }
        : process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected successfully");

    // Skip table creation/sync - tables will be created manually as needed
    console.log(
      "Skipping automatic table creation - tables will be created as needed"
    );
    console.log(
      "If you encounter table errors, create them manually when implementing features"
    );

    return sequelize;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Also create a function that returns sequelize instance directly for models
const getSequelize = () => sequelize;

export { sequelize, connectDB, getSequelize };
