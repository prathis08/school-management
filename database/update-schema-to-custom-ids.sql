-- Database Schema Updates to Use Custom IDs for Foreign Key Relationships
-- This script updates the foreign key columns from UUID to VARCHAR to reference custom IDs
-- Run this script to align the database schema with the Sequelize models

-- Backup existing data first (recommended)
-- pg_dump -h localhost -p 5432 -U root -d school_management > backup_before_schema_update.sql

-- 1. Update student table - change class_id to reference class.class_id (custom string ID)
ALTER TABLE student ALTER COLUMN class_id TYPE VARCHAR(255);

-- 2. Update class table - change class_teacher_id to reference teacher.teacher_id (custom string ID)  
ALTER TABLE class ALTER COLUMN class_teacher_id TYPE VARCHAR(255);

-- 3. Update payments table - change foreign keys to use custom IDs
ALTER TABLE payments ALTER COLUMN student_id TYPE VARCHAR(255);  -- Reference student.student_id
ALTER TABLE payments ALTER COLUMN fee_structure_id TYPE VARCHAR(255);  -- Reference fee_structures.fee_structure_id

-- 4. Update exams table - change subject_id to reference subject.subject_id (custom string ID)
ALTER TABLE exams ALTER COLUMN subject_id TYPE VARCHAR(255);

-- 5. Update results table - change foreign keys to use custom IDs
ALTER TABLE results ALTER COLUMN exam_id TYPE VARCHAR(255);  -- Reference exams.exam_id
ALTER TABLE results ALTER COLUMN student_id TYPE VARCHAR(255);  -- Reference student.student_id

-- 6. Update routes table - change bus_id to reference buses.bus_id (custom string ID)
ALTER TABLE routes ALTER COLUMN bus_id TYPE VARCHAR(255);

-- 7. Update stops table - change route_id to reference routes.route_id (custom string ID)
ALTER TABLE stops ALTER COLUMN route_id TYPE VARCHAR(255);

-- Note: teacher.user_id and student.user_id should remain as they are since they reference users.user_id (custom string)
-- Note: tokens.user_id should remain as UUID since it references users.id (UUID primary key) for security