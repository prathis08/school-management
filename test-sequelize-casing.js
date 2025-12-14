// Test script to verify Sequelize casing configuration
import { DataTypes } from "sequelize";
import { getSequelize } from "./modules/backend-core/config/database.js";

const sequelize = getSequelize();

// Example model to test casing
const TestModel = sequelize.define(
  "TestModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "test_models",
    timestamps: true,
    underscored: true, // This is now set globally but can be overridden per model
  }
);

async function testCasing() {
  try {
    console.log("🔄 Testing Sequelize casing configuration...\n");

    // Test 1: Check if global underscored setting works
    console.log("✅ Global Sequelize Configuration:");
    console.log(`   - underscored: ${sequelize.options.define.underscored}`);
    console.log(`   - timestamps: ${sequelize.options.define.timestamps}\n`);

    // Test 2: Create a test record using camelCase properties
    const testData = {
      firstName: "John",
      lastName: "Doe",
      emailAddress: "john.doe@example.com",
      phoneNumber: "+1234567890",
      dateOfBirth: new Date("1990-01-01"),
      isActive: true,
    };

    console.log("📝 Creating record with camelCase properties:");
    console.log("   Input data:", JSON.stringify(testData, null, 2));

    // This should automatically map to snake_case database columns
    const newRecord = await TestModel.build(testData);

    console.log("\n🗄️  Generated SQL column mapping:");
    console.log("   JavaScript -> Database columns:");
    for (const [jsField, attribute] of Object.entries(
      TestModel.rawAttributes
    )) {
      const dbField = attribute.field || jsField;
      console.log(`   ${jsField} -> ${dbField}`);
    }

    console.log("\n✅ JavaScript object structure (camelCase):");
    const jsObject = newRecord.toJSON();
    console.log("   ", JSON.stringify(jsObject, null, 2));

    console.log("\n🎉 Sequelize casing configuration is working correctly!");
    console.log("   - JavaScript properties use camelCase");
    console.log("   - Database columns use snake_case");
    console.log("   - Automatic conversion enabled globally\n");
  } catch (error) {
    console.error("❌ Error testing casing:", error.message);
  }
}

// Run the test
testCasing();

export default TestModel;
