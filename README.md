# School Management System - Backend

A comprehensive MVC-based backend system for school management built with Node.js, Express.js, and PostgreSQL.

## Features

- **User Management**: Admin, Teacher, and Student roles with authentication
- **Student Management**: Complete student profile management with grades and attendance
- **Teacher Management**: Teacher profiles with subject and class assignments
- **Class Management**: Class creation with student enrollment and scheduling
- **Subject Management**: Subject creation with teacher assignments
- **Dual Identifier System**: Support for both UUID and user-defined schoolId
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling middleware
- **Database**: PostgreSQL with Sequelize ORM
- **Associations**: Proper foreign key relationships and many-to-many associations

## New: School ID Feature

🆕 **Enhanced Identifier System**: All entities now support both system-generated UUIDs and user-defined `schoolId` for more flexible record management.

- **Dual Lookup**: Find records by either UUID or schoolId
- **Human-Readable**: Use meaningful identifiers like `SCLJPEDUCATIONACADEMYSTUDENT001`
- **Backward Compatible**: Existing UUID-based operations continue to work
- **Alphanumeric Format**: SchoolId supports alphanumeric characters only (no special characters)
- **Flexible Authentication**: Login with either email or schoolId

See [School ID Implementation Guide](./docs/schoolId_IMPLEMENTATION.md) for detailed information.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Morgan
- **Development**: Nodemon

## Project Structure

```
src/
├── app.js                 # Main application file
├── config/
│   └── database.js        # Database configuration
├── utils/                 # Utility functions
│   └── identifierHelpers.js  # SchoolId and dual identifier utilities
├── models/                # Database models (M in MVC)
│   ├── User.js
│   ├── Student.js
│   ├── Teacher.js
│   ├── Class.js
│   └── Subject.js
├── controllers/           # Business logic (C in MVC)
│   ├── authController.js
│   ├── studentController.js
│   ├── teacherController.js
│   ├── classController.js
│   └── subjectController.js
├── routes/                # API routes (V in MVC)
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── classRoutes.js
│   └── subjectRoutes.js
└── middleware/            # Custom middleware
    ├── auth.js
    ├── authorize.js
    ├── validation.js
    ├── errorHandler.js
    └── notFound.js
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd school-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   - Copy `.env` file and update the values:

   ```bash
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=school_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DIALECT=postgres
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=24h
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Database setup**

   - Install and start PostgreSQL on your system
   - Create a database named `school_management`
   - Update the database credentials in `.env` file
   - Run the migration to add schoolId support:
     ```bash
     # Apply schoolId migration
     psql -d school_management -f database/add-school-id-migration.sql
     ```

5. **Run the application**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Students

- `GET /api/students` - Get all students (Admin, Teacher)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student (Admin)
- `PUT /api/students/:id` - Update student (Admin)
- `DELETE /api/students/:id` - Delete student (Admin)

### Teachers

- `GET /api/teachers` - Get all teachers (Admin)
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create new teacher (Admin)
- `PUT /api/teachers/:id` - Update teacher (Admin)
- `DELETE /api/teachers/:id` - Delete teacher (Admin)

### Classes

- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class (Admin)
- `PUT /api/classes/:id` - Update class (Admin)
- `DELETE /api/classes/:id` - Delete class (Admin)
- `POST /api/classes/:id/students` - Add student to class (Admin)

### Subjects

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create new subject (Admin)
- `PUT /api/subjects/:id` - Update subject (Admin)
- `DELETE /api/subjects/:id` - Delete subject (Admin)
- `POST /api/subjects/:id/teachers` - Assign teacher to subject (Admin)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **Admin**: Full access to all endpoints
- **Teacher**: Can view students and classes
- **Student**: Can view their own profile and class information

## Example Usage

### 1. Register an Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Admin",
    "email": "admin@school.com",
    "password": "Admin123",
    "role": "admin"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "Admin123"
  }'
```

### 3. Create a Subject

```bash
curl -X POST http://localhost:3000/api/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "subjectName": "Mathematics",
    "subjectCode": "MATH101",
    "credits": 4,
    "department": "Science"
  }'
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Success Responses

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {} // Response data
}
```

## Development

- Use `npm run dev` for development with auto-restart
- The application includes comprehensive input validation
- Error handling middleware catches and formats all errors
- Role-based access control protects sensitive endpoints

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- CORS protection
- Helmet for security headers
- Rate limiting (can be added)

## Future Enhancements

- File upload for profile pictures
- Attendance tracking system
- Grade management
- Email notifications
- API rate limiting
- Comprehensive logging
- Unit and integration tests
- API documentation with Swagger

## License

MIT License
# school-management
