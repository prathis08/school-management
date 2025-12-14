-- Complete Database Update Script
-- This script updates schema and maps existing data using custom IDs

-- PART 1: Schema Updates (Change foreign key columns from UUID to VARCHAR)
-- =====================================================================

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

-- PART 2: Data Mapping - Map existing data using custom IDs
-- =========================================================

-- Map teachers to their user accounts based on order/pattern
-- Assuming teachers were created in the same order as teacher users
UPDATE teacher 
SET user_id = (
    SELECT user_id 
    FROM users 
    WHERE role = 'TEACHER' 
    ORDER BY created_at 
    LIMIT 1 OFFSET (
        SELECT ROW_NUMBER() OVER (ORDER BY created_at) - 1 
        FROM teacher t2 
        WHERE t2.id = teacher.id
    )
)
WHERE user_id IS NULL OR user_id = '';

-- Map class teachers to use teacher custom IDs instead of UUIDs
-- First, let's create a mapping based on the existing UUID to custom ID
UPDATE class 
SET class_teacher_id = (
    SELECT teacher_id 
    FROM teacher 
    WHERE teacher.id = class.class_teacher_id::uuid
)
WHERE class_teacher_id IS NOT NULL;

-- Map students to classes based on their grade
-- Grade 12 students -> CLASS_12A_001 or CLASS_12B_001 (alternate)
UPDATE student 
SET class_id = CASE 
    WHEN grade = 'Grade 12' THEN 
        CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 2 = 1 
        THEN 'CLASS_12A_001' 
        ELSE 'CLASS_12B_001' END
    WHEN grade = 'Grade 11' THEN 
        CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 
        THEN 'CLASS_11A_001' 
        WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 
        THEN 'CLASS_11B_001' 
        ELSE 'CLASS_11C_001' END
    WHEN grade = 'Grade 10' THEN 
        CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 2 = 1 
        THEN 'CLASS_10A_001' 
        ELSE 'CLASS_10B_001' END
    WHEN grade = 'Grade 9' THEN 
        CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 2 = 1 
        THEN 'CLASS_9A_001' 
        ELSE 'CLASS_9C_001' END
    ELSE NULL
END
WHERE class_id IS NULL;

-- Create teacher-subject mappings based on department match
INSERT INTO teacher_subject (id, teacher_id, subject_id, schoolId, is_primary, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    t.teacher_id,
    s.subject_id,
    'SCHOOL002',
    true,
    true,
    NOW(),
    NOW()
FROM teacher t
JOIN subject s ON (
    (t.department = 'Mathematics' AND s.subject_id IN ('SUBJ_MATH_001', 'SUBJ_ALG_001')) OR
    (t.department = 'Science' AND s.subject_id IN ('SUBJ_PHYS_001', 'SUBJ_CHEM_001', 'SUBJ_BIO_001')) OR
    (t.department = 'English' AND s.subject_id = 'SUBJ_ENG_001') OR
    (t.department = 'History' AND s.subject_id = 'SUBJ_HIST_001') OR
    (t.department = 'Physical Education' AND s.subject_id = 'SUBJ_PE_001') OR
    (t.department = 'Art' AND s.subject_id = 'SUBJ_ART_001') OR
    (t.department = 'Music' AND s.subject_id = 'SUBJ_MUS_001')
)
WHERE NOT EXISTS (
    SELECT 1 FROM teacher_subject ts 
    WHERE ts.teacher_id = t.teacher_id AND ts.subject_id = s.subject_id
);

-- Verify the mappings
-- SELECT 'Teachers mapped to users:' as info;
-- SELECT t.teacher_id, t.user_id, u.first_name, u.last_name, t.department 
-- FROM teacher t 
-- JOIN users u ON t.user_id = u.user_id 
-- ORDER BY t.teacher_id;

-- SELECT 'Classes with teacher assignments:' as info;
-- SELECT c.class_id, c.class_name, c.class_teacher_id, t.user_id, u.first_name, u.last_name
-- FROM class c 
-- LEFT JOIN teacher t ON c.class_teacher_id = t.teacher_id
-- LEFT JOIN users u ON t.user_id = u.user_id
-- ORDER BY c.class_id;

-- SELECT 'Students assigned to classes:' as info;
-- SELECT s.student_id, s.name, s.grade, s.class_id 
-- FROM student s 
-- WHERE s.class_id IS NOT NULL
-- ORDER BY s.grade, s.class_id;