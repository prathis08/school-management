# Teacher Response Builder

This module provides utilities to build concrete, controlled response objects for teacher data instead of sending raw database columns.

## Overview

The Teacher Response Builder transforms raw database data into well-structured, consistent API responses. This approach provides several benefits:

- **Data Security**: Only intended fields are exposed in API responses
- **Consistency**: All teacher endpoints return data in the same format
- **Flexibility**: Different response formats for different use cases (full vs summary)
- **Maintainability**: Centralized response formatting logic

## Response Formats

### Full Teacher Response (`buildTeacherResponse`)

Used for single teacher details and detailed teacher listings.

```javascript
{
  id: "TEACHER1726412345678901",
  teacherId: "TEACHER1726412345678901",
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@school.edu",
    phone: "+1234567890"
  },
  professionalInfo: {
    department: "Mathematics",
    qualification: "M.Sc Mathematics",
    experience: 5,
    dateOfJoining: "2023-01-15T00:00:00.000Z",
    salary: 50000.00
  },
  assignments: {
    subjects: [
      {
        subjectName: "Advanced Mathematics",
        subjectCode: "MATH301",
        department: "Mathematics"
      }
    ],
    managedClasses: [
      {
        className: "Grade 10 Mathematics",
        grade: "10",
        section: "A",
        room: "Room 205"
      }
    ]
  },
  status: {
    isActive: true
  },
  metadata: {
    createdAt: "2023-01-15T10:30:00.000Z",
    updatedAt: "2023-01-16T14:20:00.000Z"
  }
}
```

### Summary Teacher Response (`buildTeacherSummaryResponse`)

Used for teacher lists where minimal data is needed.

```javascript
{
  id: "TEACHER1726412345678901",
  teacherId: "TEACHER1726412345678901",
  name: "John Doe",
  email: "john.doe@school.edu",
  department: "Mathematics",
  experience: 5,
  subjectCount: 2,
  classCount: 3,
  status: {
    isActive: true
  }
}
```

## Usage

### In Controllers

```javascript
import {
  buildTeachersListResponse,
  buildTeacherResponse,
  buildTeachersSummariesResponse,
} from "../utils/teacherResponseBuilder.js";

// For single teacher
const formattedTeacher = buildTeacherResponse(rawTeacherData);

// For teacher lists (full data)
const formattedTeachers = buildTeachersListResponse(rawTeachersArray);

// For teacher lists (summary data)
const formattedSummaries = buildTeachersSummariesResponse(rawTeachersArray);
```

### Query Parameters

The `getAllTeachers` endpoint supports a `summary` query parameter:

- `GET /api/teachers?summary=true` - Returns teacher summaries
- `GET /api/teachers` - Returns full teacher data

## Functions

### `buildTeacherResponse(teacher)`

Builds a complete teacher response object with all details.

**Parameters:**

- `teacher` (Object): Raw teacher data from database

**Returns:** Object - Formatted teacher response

### `buildTeachersListResponse(teachers)`

Builds an array of complete teacher response objects.

**Parameters:**

- `teachers` (Array): Array of raw teacher data from database

**Returns:** Array - Array of formatted teacher responses

### `buildTeacherSummaryResponse(teacher)`

Builds a summary teacher response object with minimal data.

**Parameters:**

- `teacher` (Object): Raw teacher data from database

**Returns:** Object - Formatted teacher summary

### `buildTeachersSummariesResponse(teachers)`

Builds an array of summary teacher response objects.

**Parameters:**

- `teachers` (Array): Array of raw teacher data from database

**Returns:** Array - Array of formatted teacher summaries

## Security Considerations

- Sensitive fields like internal IDs, user table references, and password-related data are excluded
- Only necessary fields are included in responses
- Custom teacher IDs are used as primary identifiers instead of internal UUIDs
- Salary information is included but can be easily excluded by modifying the builder

## Performance Optimizations

- Database queries now use explicit attribute selection to reduce data transfer
- Response builders handle missing or null data gracefully
- Summary responses reduce payload size for list operations
