# Task Management Module

This module provides comprehensive task management functionality for the school management system.

## Features

- Create, read, update, and delete tasks
- Task assignment to users
- Priority levels and status tracking
- Due date and time management
- Tag-based categorization
- Task comments and attachments
- Task history tracking
- Pagination and filtering
- Role-based access control

## API Endpoints

- `POST /api/tasks` - Create new task
- `GET /api/tasks` - List all tasks with filtering and pagination
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Database Tables

- `tasks` - Main task table
- `task_comments` - Task comments
- `task_attachments` - Task file attachments
- `task_history` - Task change history

## Models

- `Task` - Main task model
- `TaskComment` - Task comment model
- `TaskAttachment` - Task attachment model
- `TaskHistory` - Task history model
