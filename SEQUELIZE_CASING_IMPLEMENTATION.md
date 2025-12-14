# Sequelize Casing Configuration Implementation

## Overview

This project has been updated to implement proper Sequelize casing configuration that automatically handles the conversion between JavaScript camelCase properties and database snake_case columns.

## Key Changes Made

### 1. Global Database Configuration (`modules/backend-core/config/database.js`)

```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: false,

    // GLOBAL CONFIGURATION
    define: {
      underscored: true, // specifies that DB columns are snake_case
      timestamps: true, // enables createdAt/updatedAt
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
```

### 2. Model Field Naming Convention

All model fields have been converted to use camelCase in JavaScript while maintaining snake_case in the database:

**Before:**

```javascript
const User = sequelize.define("User", {
  first_name: {
    type: DataTypes.STRING,
    // Manual field mapping was required
    field: "first_name",
  },
  email_address: {
    type: DataTypes.STRING,
  },
});
```

**After:**

```javascript
const User = sequelize.define("User", {
  // DB column: 'first_name' <--> JS property: 'firstName'
  firstName: {
    type: DataTypes.STRING,
    // No manual field mapping needed anymore
  },

  // DB column: 'email_address' <--> JS property: 'emailAddress'
  emailAddress: {
    type: DataTypes.STRING,
  },
});
```

## Models Updated

### Core Models

- ✅ `User` - All fields converted to camelCase
- ✅ `School` - All fields converted to camelCase
- ✅ `Token` - All fields converted to camelCase

### Admission Module

- ✅ `Student` - All fields converted to camelCase
- ✅ `Teacher` - All fields converted to camelCase
- ✅ `Class` - All fields converted to camelCase
- ✅ `Subject` - All fields converted to camelCase

### Task Management Module

- ✅ `Task` - All fields converted to camelCase
- ✅ `TaskComment` - All fields converted to camelCase
- ✅ `TaskAttachment` - All fields converted to camelCase
- ✅ `TaskHistory` - All fields converted to camelCase

### Other Modules

- ✅ `FeeStructure` - Already had underscored configuration
- ✅ `Payment` - Already had underscored configuration
- ✅ `Bus` - Already had underscored configuration
- ✅ `Route` - Already had underscored configuration
- ✅ `Stop` - Already had underscored configuration
- ✅ `Exam` - Already had underscored configuration
- ✅ `Result` - Already had underscored configuration

## How It Works

### Automatic Field Mapping

With `underscored: true` in the global configuration, Sequelize automatically:

1. **JavaScript to Database**: Converts camelCase properties to snake_case columns

   - `firstName` → `first_name`
   - `emailAddress` → `email_address`
   - `createdAt` → `created_at`

2. **Database to JavaScript**: Converts snake_case columns to camelCase properties
   - `first_name` → `firstName`
   - `email_address` → `emailAddress`
   - `created_at` → `createdAt`

### API Response Example

```javascript
// Query returns { firstName: 'John' } ✅
const users = await User.findAll();
res.json(users); // Express calls .toJSON() automatically
```

## Benefits

1. **Consistency**: All JavaScript code uses camelCase (standard JavaScript convention)
2. **Database Convention**: All database columns use snake_case (standard SQL convention)
3. **No Manual Mapping**: Automatic conversion eliminates need for manual field mapping
4. **Better Developer Experience**: Code is more readable and follows JavaScript conventions
5. **Backward Compatibility**: Database schema remains unchanged

## Testing

A test file `test-sequelize-casing.js` has been created to verify the configuration works correctly. Run it to see the automatic field mapping in action.

## Migration Impact

### Code Changes Required

- Update any direct database field references in queries to use camelCase
- Update API response handling to expect camelCase properties
- Update frontend code to use camelCase property names

### Database Schema

- No database schema changes required
- All existing snake_case columns remain the same
- Data migration is not needed

## Next Steps

1. **Test the Configuration**: Run the test script to verify everything works
2. **Update Queries**: Review and update any hardcoded field names in queries
3. **Update API Contracts**: Update API documentation to reflect camelCase properties
4. **Frontend Integration**: Update frontend code to use camelCase property names
5. **Complete Model Updates**: Finish updating any remaining models in transportation/examination modules if needed

## Example Usage

```javascript
// Creating a new user (JavaScript camelCase)
const newUser = await User.create({
  firstName: "John",
  lastName: "Doe",
  emailAddress: "john@example.com",
  isActive: true,
});

// Database stores as: first_name, last_name, email_address, is_active

// Querying users
const users = await User.findAll();
console.log(users[0].firstName); // 'John' (camelCase property)
console.log(users[0].emailAddress); // 'john@example.com'
```

This implementation provides a clean separation between JavaScript conventions and database conventions while maintaining full compatibility with existing database schemas.
