-- Insert Demo Data for School Management System
-- Generated from JSON demo data files

-- =============================================
-- INSERT SCHOOLS
-- =============================================

INSERT INTO schools (
    id, schoolId, school_name, school_code, address, phone, email, website,
    principal_name, principal_phone, principal_email, established_year,
    school_type, board, affiliation_number, is_active, created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SCHOOL002',
    'Springfield High School',
    'SHS001',
    '{"street": "123 Education Drive", "city": "Springfield", "state": "Illinois", "zipCode": "62701", "country": "USA"}',
    '+1 217 555 0001',
    'info@springfieldhigh.edu',
    'https://www.springfieldhigh.edu',
    'Dr. Margaret Wilson',
    '+1 217 555 0002',
    'principal@springfieldhigh.edu',
    1985,
    'Higher Secondary',
    'State Board',
    'IL-SB-001-1985',
    true,
    NOW(),
    NOW()
);

-- =============================================
-- INSERT USERS (for students and teachers)
-- =============================================

-- Users for Teachers
INSERT INTO users (
    id, user_id, first_name, last_name, email, password, role, schoolId, is_active, created_at, updated_at
) VALUES 
    ('550e8400-e29b-41d4-a716-446655441001', 'USER_TEACHER_001', 'Sarah', 'Johnson', 'sarah.johnson@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441002', 'USER_TEACHER_002', 'Michael', 'Chen', 'michael.chen@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441003', 'USER_TEACHER_003', 'Emily', 'Rodriguez', 'emily.rodriguez@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441004', 'USER_TEACHER_004', 'David', 'Thompson', 'david.thompson@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441005', 'USER_TEACHER_005', 'Lisa', 'Park', 'lisa.park@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441006', 'USER_TEACHER_006', 'James', 'Wilson', 'james.wilson@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441007', 'USER_TEACHER_007', 'Rachel', 'Green', 'rachel.green@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441008', 'USER_TEACHER_008', 'Robert', 'Martinez', 'robert.martinez@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441009', 'USER_TEACHER_009', 'Amanda', 'White', 'amanda.white@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655441010', 'USER_TEACHER_010', 'Kevin', 'Brown', 'kevin.brown@school.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'TEACHER', 'SCHOOL002', true, NOW(), NOW());

-- Users for Students
INSERT INTO users (
    id, user_id, first_name, last_name, email, password, role, schoolId, is_active, created_at, updated_at
) VALUES 
    ('550e8400-e29b-41d4-a716-446655442001', 'USER_STUDENT_001', 'Alice', 'Johnson', 'alice.johnson@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442002', 'USER_STUDENT_002', 'Bob', 'Smith', 'bob.smith@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442003', 'USER_STUDENT_003', 'Carol', 'Davis', 'carol.davis@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442004', 'USER_STUDENT_004', 'Daniel', 'Wilson', 'daniel.wilson@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442005', 'USER_STUDENT_005', 'Eva', 'Martinez', 'eva.martinez@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442006', 'USER_STUDENT_006', 'Frank', 'Brown', 'frank.brown@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442007', 'USER_STUDENT_007', 'Grace', 'Lee', 'grace.lee@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442008', 'USER_STUDENT_008', 'Henry', 'Taylor', 'henry.taylor@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442009', 'USER_STUDENT_009', 'Isabella', 'Garcia', 'isabella.garcia@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655442010', 'USER_STUDENT_010', 'Jack', 'Anderson', 'jack.anderson@student.com', '$2b$10$dummy.password.hash.for.demo.purposes', 'STUDENT', 'SCHOOL002', true, NOW(), NOW());

-- =============================================
-- INSERT TEACHERS
-- =============================================

INSERT INTO teacher (
    id, user_id, teacher_id, schoolId, department, qualification, experience,
    date_of_joining, salary, phone, address, is_active, created_at, updated_at
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655443001',
        '550e8400-e29b-41d4-a716-446655441001',
        'TEACHER123645632',
        'SCHOOL002',
        'Mathematics',
        'PhD in Mathematics',
        8,
        '2018-08-15',
        75000.00,
        '+1 234 567 8901',
        '{"street": "123 Elm Street", "city": "Springfield", "state": "IL", "zipCode": "62701", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443002',
        '550e8400-e29b-41d4-a716-446655441002',
        'TEACHER234756743',
        'SCHOOL002',
        'Science',
        'MSc in Physics',
        12,
        '2015-09-01',
        82000.00,
        '+1 234 567 8902',
        '{"street": "456 Oak Avenue", "city": "Springfield", "state": "IL", "zipCode": "62702", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443003',
        '550e8400-e29b-41d4-a716-446655441003',
        'TEACHER345867854',
        'SCHOOL002',
        'English',
        'MA in English Literature',
        6,
        '2020-01-15',
        68000.00,
        '+1 234 567 8903',
        '{"street": "789 Pine Road", "city": "Springfield", "state": "IL", "zipCode": "62703", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443004',
        '550e8400-e29b-41d4-a716-446655441004',
        'TEACHER456978965',
        'SCHOOL002',
        'History',
        'MA in History',
        10,
        '2017-03-20',
        72000.00,
        '+1 234 567 8904',
        '{"street": "321 Maple Drive", "city": "Springfield", "state": "IL", "zipCode": "62704", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443005',
        '550e8400-e29b-41d4-a716-446655441005',
        'TEACHER567089076',
        'SCHOOL002',
        'Science',
        'PhD in Chemistry',
        15,
        '2012-08-30',
        88000.00,
        '+1 234 567 8905',
        '{"street": "654 Cedar Lane", "city": "Springfield", "state": "IL", "zipCode": "62705", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443006',
        '550e8400-e29b-41d4-a716-446655441006',
        'TEACHER678190187',
        'SCHOOL002',
        'Physical Education',
        'BSc in Sports Science',
        7,
        '2019-06-10',
        58000.00,
        '+1 234 567 8906',
        '{"street": "987 Birch Street", "city": "Springfield", "state": "IL", "zipCode": "62706", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443007',
        '550e8400-e29b-41d4-a716-446655441007',
        'TEACHER789301298',
        'SCHOOL002',
        'Art',
        'MFA in Fine Arts',
        5,
        '2021-09-05',
        62000.00,
        '+1 234 567 8907',
        '{"street": "147 Willow Way", "city": "Springfield", "state": "IL", "zipCode": "62707", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443008',
        '550e8400-e29b-41d4-a716-446655441008',
        'TEACHER890412309',
        'SCHOOL002',
        'Mathematics',
        'MSc in Mathematics',
        9,
        '2018-01-22',
        71000.00,
        '+1 234 567 8908',
        '{"street": "258 Spruce Court", "city": "Springfield", "state": "IL", "zipCode": "62708", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443009',
        '550e8400-e29b-41d4-a716-446655441009',
        'TEACHER901523410',
        'SCHOOL002',
        'Science',
        'PhD in Biology',
        11,
        '2016-02-14',
        79000.00,
        '+1 234 567 8909',
        '{"street": "369 Poplar Plaza", "city": "Springfield", "state": "IL", "zipCode": "62709", "country": "USA"}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655443010',
        '550e8400-e29b-41d4-a716-446655441010',
        'TEACHER012634521',
        'SCHOOL002',
        'Music',
        'Bachelor of Music',
        4,
        '2022-08-28',
        55000.00,
        '+1 234 567 8910',
        '{"street": "741 Chestnut Circle", "city": "Springfield", "state": "IL", "zipCode": "62710", "country": "USA"}',
        true,
        NOW(),
        NOW()
    );

-- =============================================
-- INSERT SUBJECTS
-- =============================================

INSERT INTO subject (
    id, subject_id, subject_name, subject_code, schoolId, description,
    credits, department, syllabus, is_active, created_at, updated_at
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655444001',
        'SUBJ_MATH_001',
        'Advanced Mathematics',
        'MATH101',
        'SCHOOL002',
        'Advanced mathematical concepts including calculus, algebra, and geometry',
        4,
        'Mathematics',
        'Covers differential calculus, integral calculus, linear algebra, and analytical geometry',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444002',
        'SUBJ_PHYS_001',
        'Physics',
        'PHYS101',
        'SCHOOL002',
        'Fundamental principles of physics including mechanics, thermodynamics, and electromagnetism',
        4,
        'Science',
        'Classical mechanics, waves, optics, electricity, magnetism, and modern physics',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444003',
        'SUBJ_ENG_001',
        'English Literature',
        'ENG101',
        'SCHOOL002',
        'Study of English literature, poetry, drama, and prose',
        3,
        'English',
        'Classical and modern literature, poetry analysis, drama studies, and creative writing',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444004',
        'SUBJ_HIST_001',
        'World History',
        'HIST101',
        'SCHOOL002',
        'Comprehensive study of world history from ancient to modern times',
        3,
        'History',
        'Ancient civilizations, medieval period, renaissance, modern world wars, and contemporary history',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444005',
        'SUBJ_CHEM_001',
        'Chemistry',
        'CHEM101',
        'SCHOOL002',
        'Fundamental concepts of chemistry including organic, inorganic, and physical chemistry',
        4,
        'Science',
        'Atomic structure, chemical bonding, organic compounds, and chemical reactions',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444006',
        'SUBJ_PE_001',
        'Physical Education',
        'PE101',
        'SCHOOL002',
        'Physical fitness, sports, and health education',
        2,
        'Physical Education',
        'Fitness training, team sports, individual sports, and health awareness',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444007',
        'SUBJ_ART_001',
        'Fine Arts',
        'ART101',
        'SCHOOL002',
        'Visual arts including drawing, painting, and sculpture',
        2,
        'Art',
        'Drawing techniques, painting methods, color theory, and art history',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444008',
        'SUBJ_ALG_001',
        'Algebra',
        'ALG101',
        'SCHOOL002',
        'Algebraic concepts and problem-solving techniques',
        3,
        'Mathematics',
        'Linear equations, quadratic equations, polynomials, and algebraic functions',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444009',
        'SUBJ_BIO_001',
        'Biology',
        'BIO101',
        'SCHOOL002',
        'Study of living organisms and biological processes',
        4,
        'Science',
        'Cell biology, genetics, ecology, evolution, and human anatomy',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655444010',
        'SUBJ_MUS_001',
        'Music Theory',
        'MUS101',
        'SCHOOL002',
        'Fundamentals of music theory and composition',
        2,
        'Music',
        'Music notation, scales, chords, rhythm, and basic composition techniques',
        true,
        NOW(),
        NOW()
    );

-- =============================================
-- INSERT CLASSES
-- =============================================

INSERT INTO class (
    id, class_id, class_teacher_id, class_name, schoolId, grade, section,
    max_students, room, schedule, is_active, created_at, updated_at
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655445001',
        'CLASS_12A_001',
        '550e8400-e29b-41d4-a716-446655443001',
        '12-A',
        'SCHOOL002',
        'Grade 12',
        'A',
        45,
        'Room 101',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445002',
        'CLASS_12B_001',
        '550e8400-e29b-41d4-a716-446655443002',
        '12-B',
        'SCHOOL002',
        'Grade 12',
        'B',
        45,
        'Room 102',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445003',
        'CLASS_11A_001',
        '550e8400-e29b-41d4-a716-446655443003',
        '11-A',
        'SCHOOL002',
        'Grade 11',
        'A',
        42,
        'Room 201',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445004',
        'CLASS_11B_001',
        '550e8400-e29b-41d4-a716-446655443004',
        '11-B',
        'SCHOOL002',
        'Grade 11',
        'B',
        42,
        'Room 202',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445005',
        'CLASS_11C_001',
        '550e8400-e29b-41d4-a716-446655443005',
        '11-C',
        'SCHOOL002',
        'Grade 11',
        'C',
        42,
        'Room 203',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445006',
        'CLASS_10A_001',
        '550e8400-e29b-41d4-a716-446655443006',
        '10-A',
        'SCHOOL002',
        'Grade 10',
        'A',
        40,
        'Room 301',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445007',
        'CLASS_10B_001',
        '550e8400-e29b-41d4-a716-446655443007',
        '10-B',
        'SCHOOL002',
        'Grade 10',
        'B',
        40,
        'Room 302',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445008',
        'CLASS_9A_001',
        '550e8400-e29b-41d4-a716-446655443008',
        '9-A',
        'SCHOOL002',
        'Grade 9',
        'A',
        38,
        'Room 401',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655445009',
        'CLASS_9C_001',
        '550e8400-e29b-41d4-a716-446655443009',
        '9-C',
        'SCHOOL002',
        'Grade 9',
        'C',
        38,
        'Room 403',
        '{"monday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "tuesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "wednesday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "thursday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"], "friday": ["09:00-10:00", "10:00-11:00", "11:30-12:30"]}',
        true,
        NOW(),
        NOW()
    );

-- =============================================
-- INSERT STUDENTS
-- =============================================

INSERT INTO student (
    id, user_id, class_id, student_id, schoolId, name, first_name, last_name,
    email, phone, grade, roll_number, date_of_birth, gender, parent_details,
    guardian_name, guardian_phone, emergency_contact, address, admission_date,
    enrollment_date, status, is_active, attendance, grades, father_name,
    created_at, updated_at
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655446001',
        '550e8400-e29b-41d4-a716-446655442001',
        '550e8400-e29b-41d4-a716-446655445001',
        'STU12345',
        'SCHOOL002',
        'Alice Johnson',
        'Alice',
        'Johnson',
        'alice.johnson@student.com',
        '+1 234 567 8901',
        'Grade 12',
        '2024001',
        '2006-05-15',
        'FEMALE',
        '{"fatherName": "Robert Johnson", "fatherPhone": "+1 234 567 8900", "fathersOccupation": "Engineer", "motherName": "Laura Johnson", "motherPhone": "+1 234 567 8901", "mothersOccupation": "Teacher"}',
        'Robert Johnson',
        '+1 234 567 8900',
        '{"name": "Robert Johnson", "phone": "+1 234 567 8900", "relation": "Father"}',
        '{"street": "123 Main St", "city": "Springfield", "state": "IL", "zipCode": "62701", "country": "USA"}',
        '2020-08-15',
        '2020-08-15',
        'Active',
        true,
        '{"percentage": 95, "totalDays": 200, "presentDays": 190}',
        '{"currentGPA": 3.8, "previousYearGPA": 3.7, "rank": 5, "totalStudentsInClass": 45}',
        'Robert Johnson',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446002',
        '550e8400-e29b-41d4-a716-446655442002',
        '550e8400-e29b-41d4-a716-446655445004',
        'STU12346',
        'SCHOOL002',
        'Bob Smith',
        'Bob',
        'Smith',
        'bob.smith@student.com',
        '+1 234 567 8902',
        'Grade 11',
        '2024002',
        '2007-03-22',
        'MALE',
        '{"fatherName": "Michael Smith", "fatherPhone": "+1 234 567 8903", "fathersOccupation": "Doctor", "motherName": "Sarah Smith", "motherPhone": "+1 234 567 8904", "mothersOccupation": "Nurse"}',
        'Michael Smith',
        '+1 234 567 8903',
        '{"name": "Michael Smith", "phone": "+1 234 567 8903", "relation": "Father"}',
        '{"street": "456 Oak Ave", "city": "Springfield", "state": "IL", "zipCode": "62702", "country": "USA"}',
        '2021-08-15',
        '2021-08-15',
        'Active',
        true,
        '{"percentage": 88, "totalDays": 200, "presentDays": 176}',
        '{"currentGPA": 3.5, "previousYearGPA": 3.4, "rank": 12, "totalStudentsInClass": 42}',
        'Michael Smith',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446003',
        '550e8400-e29b-41d4-a716-446655442003',
        '550e8400-e29b-41d4-a716-446655445006',
        'STU12347',
        'SCHOOL002',
        'Carol Davis',
        'Carol',
        'Davis',
        'carol.davis@student.com',
        '+1 234 567 8905',
        'Grade 10',
        '2024003',
        '2008-11-10',
        'FEMALE',
        '{"fatherName": "David Davis", "fatherPhone": "+1 234 567 8906", "fathersOccupation": "Lawyer", "motherName": "Emma Davis", "motherPhone": "+1 234 567 8907", "mothersOccupation": "Accountant"}',
        'David Davis',
        '+1 234 567 8906',
        '{"name": "David Davis", "phone": "+1 234 567 8906", "relation": "Father"}',
        '{"street": "789 Pine Rd", "city": "Springfield", "state": "IL", "zipCode": "62703", "country": "USA"}',
        '2022-08-15',
        '2022-08-15',
        'Active',
        true,
        '{"percentage": 92, "totalDays": 200, "presentDays": 184}',
        '{"currentGPA": 3.6, "previousYearGPA": 3.5, "rank": 8, "totalStudentsInClass": 40}',
        'David Davis',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446004',
        '550e8400-e29b-41d4-a716-446655442004',
        '550e8400-e29b-41d4-a716-446655445009',
        'STU12348',
        'SCHOOL002',
        'Daniel Wilson',
        'Daniel',
        'Wilson',
        'daniel.wilson@student.com',
        '+1 234 567 8908',
        'Grade 9',
        '2024004',
        '2009-07-18',
        'MALE',
        '{"fatherName": "James Wilson", "fatherPhone": "+1 234 567 8909", "fathersOccupation": "Mechanic", "motherName": "Lisa Wilson", "motherPhone": "+1 234 567 8910", "mothersOccupation": "Pharmacist"}',
        'James Wilson',
        '+1 234 567 8909',
        '{"name": "James Wilson", "phone": "+1 234 567 8909", "relation": "Father"}',
        '{"street": "321 Elm St", "city": "Springfield", "state": "IL", "zipCode": "62704", "country": "USA"}',
        '2023-08-15',
        '2023-08-15',
        'Active',
        true,
        '{"percentage": 85, "totalDays": 200, "presentDays": 170}',
        '{"currentGPA": 3.2, "previousYearGPA": 3.1, "rank": 15, "totalStudentsInClass": 38}',
        'James Wilson',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446005',
        '550e8400-e29b-41d4-a716-446655442005',
        '550e8400-e29b-41d4-a716-446655445002',
        'STU12349',
        'SCHOOL002',
        'Eva Martinez',
        'Eva',
        'Martinez',
        'eva.martinez@student.com',
        '+1 234 567 8911',
        'Grade 12',
        '2024005',
        '2006-01-25',
        'FEMALE',
        '{"fatherName": "Carlos Martinez", "fatherPhone": "+1 234 567 8912", "fathersOccupation": "Chef", "motherName": "Maria Martinez", "motherPhone": "+1 234 567 8913", "mothersOccupation": "Social Worker"}',
        'Carlos Martinez',
        '+1 234 567 8912',
        '{"name": "Carlos Martinez", "phone": "+1 234 567 8912", "relation": "Father"}',
        '{"street": "654 Maple Dr", "city": "Springfield", "state": "IL", "zipCode": "62705", "country": "USA"}',
        '2020-08-15',
        '2020-08-15',
        'Active',
        true,
        '{"percentage": 97, "totalDays": 200, "presentDays": 194}',
        '{"currentGPA": 3.9, "previousYearGPA": 3.8, "rank": 2, "totalStudentsInClass": 45}',
        'Carlos Martinez',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446006',
        '550e8400-e29b-41d4-a716-446655442006',
        '550e8400-e29b-41d4-a716-446655445003',
        'STU12350',
        'SCHOOL002',
        'Frank Brown',
        'Frank',
        'Brown',
        'frank.brown@student.com',
        '+1 234 567 8914',
        'Grade 11',
        '2024006',
        '2007-09-14',
        'MALE',
        '{"fatherName": "Thomas Brown", "fatherPhone": "+1 234 567 8915", "fathersOccupation": "Architect", "motherName": "Jennifer Brown", "motherPhone": "+1 234 567 8916", "mothersOccupation": "Librarian"}',
        'Thomas Brown',
        '+1 234 567 8915',
        '{"name": "Thomas Brown", "phone": "+1 234 567 8915", "relation": "Father"}',
        '{"street": "987 Cedar Ln", "city": "Springfield", "state": "IL", "zipCode": "62706", "country": "USA"}',
        '2021-08-15',
        '2021-08-15',
        'Active',
        true,
        '{"percentage": 90, "totalDays": 200, "presentDays": 180}',
        '{"currentGPA": 3.4, "previousYearGPA": 3.3, "rank": 10, "totalStudentsInClass": 42}',
        'Thomas Brown',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446007',
        '550e8400-e29b-41d4-a716-446655442007',
        '550e8400-e29b-41d4-a716-446655445007',
        'STU12351',
        'SCHOOL002',
        'Grace Lee',
        'Grace',
        'Lee',
        'grace.lee@student.com',
        '+1 234 567 8917',
        'Grade 10',
        '2024007',
        '2008-12-03',
        'FEMALE',
        '{"fatherName": "Kevin Lee", "fatherPhone": "+1 234 567 8918", "fathersOccupation": "Software Developer", "motherName": "Helen Lee", "motherPhone": "+1 234 567 8919", "mothersOccupation": "Marketing Manager"}',
        'Kevin Lee',
        '+1 234 567 8918',
        '{"name": "Kevin Lee", "phone": "+1 234 567 8918", "relation": "Father"}',
        '{"street": "147 Birch Way", "city": "Springfield", "state": "IL", "zipCode": "62707", "country": "USA"}',
        '2022-08-15',
        '2022-08-15',
        'Active',
        true,
        '{"percentage": 94, "totalDays": 200, "presentDays": 188}',
        '{"currentGPA": 3.7, "previousYearGPA": 3.6, "rank": 6, "totalStudentsInClass": 40}',
        'Kevin Lee',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446008',
        '550e8400-e29b-41d4-a716-446655442008',
        '550e8400-e29b-41d4-a716-446655445008',
        'STU12352',
        'SCHOOL002',
        'Henry Taylor',
        'Henry',
        'Taylor',
        'henry.taylor@student.com',
        '+1 234 567 8920',
        'Grade 9',
        '2024008',
        '2009-04-08',
        'MALE',
        '{"fatherName": "William Taylor", "fatherPhone": "+1 234 567 8921", "fathersOccupation": "Police Officer", "motherName": "Nancy Taylor", "motherPhone": "+1 234 567 8922", "mothersOccupation": "Veterinarian"}',
        'William Taylor',
        '+1 234 567 8921',
        '{"name": "William Taylor", "phone": "+1 234 567 8921", "relation": "Father"}',
        '{"street": "258 Willow St", "city": "Springfield", "state": "IL", "zipCode": "62708", "country": "USA"}',
        '2023-08-15',
        '2023-08-15',
        'Active',
        true,
        '{"percentage": 89, "totalDays": 200, "presentDays": 178}',
        '{"currentGPA": 3.3, "previousYearGPA": 3.2, "rank": 12, "totalStudentsInClass": 38}',
        'William Taylor',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446009',
        '550e8400-e29b-41d4-a716-446655442009',
        '550e8400-e29b-41d4-a716-446655445001',
        'STU12353',
        'SCHOOL002',
        'Isabella Garcia',
        'Isabella',
        'Garcia',
        'isabella.garcia@student.com',
        '+1 234 567 8923',
        'Grade 12',
        '2024009',
        '2006-08-30',
        'FEMALE',
        '{"fatherName": "Antonio Garcia", "fatherPhone": "+1 234 567 8924", "fathersOccupation": "Construction Manager", "motherName": "Rosa Garcia", "motherPhone": "+1 234 567 8925", "mothersOccupation": "Elementary Teacher"}',
        'Antonio Garcia',
        '+1 234 567 8924',
        '{"name": "Antonio Garcia", "phone": "+1 234 567 8924", "relation": "Father"}',
        '{"street": "369 Spruce Ave", "city": "Springfield", "state": "IL", "zipCode": "62709", "country": "USA"}',
        '2020-08-15',
        '2020-08-15',
        'Active',
        true,
        '{"percentage": 96, "totalDays": 200, "presentDays": 192}',
        '{"currentGPA": 3.8, "previousYearGPA": 3.7, "rank": 4, "totalStudentsInClass": 45}',
        'Antonio Garcia',
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655446010',
        '550e8400-e29b-41d4-a716-446655442010',
        '550e8400-e29b-41d4-a716-446655445005',
        'STU12354',
        'SCHOOL002',
        'Jack Anderson',
        'Jack',
        'Anderson',
        'jack.anderson@student.com',
        '+1 234 567 8926',
        'Grade 11',
        '2024010',
        '2007-06-12',
        'MALE',
        '{"fatherName": "Peter Anderson", "fatherPhone": "+1 234 567 8927", "fathersOccupation": "Electrician", "motherName": "Linda Anderson", "motherPhone": "+1 234 567 8928", "mothersOccupation": "Real Estate Agent"}',
        'Peter Anderson',
        '+1 234 567 8927',
        '{"name": "Peter Anderson", "phone": "+1 234 567 8927", "relation": "Father"}',
        '{"street": "741 Poplar Rd", "city": "Springfield", "state": "IL", "zipCode": "62710", "country": "USA"}',
        '2021-08-15',
        '2021-08-15',
        'Active',
        true,
        '{"percentage": 91, "totalDays": 200, "presentDays": 182}',
        '{"currentGPA": 3.5, "previousYearGPA": 3.4, "rank": 9, "totalStudentsInClass": 42}',
        'Peter Anderson',
        NOW(),
        NOW()
    );

-- =============================================
-- INSERT TEACHER_SUBJECT RELATIONSHIPS
-- =============================================

INSERT INTO teacher_subject (
    id, teacher_id, subject_id, schoolId, is_primary, is_active, created_at, updated_at
) VALUES 
    -- Sarah Johnson (Math Teacher) -> Advanced Mathematics & Algebra
    (
        '550e8400-e29b-41d4-a716-446655447001',
        'TEACHER123645632',
        'SUBJ_MATH_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655447002',
        'TEACHER123645632',
        'SUBJ_ALG_001',
        'SCHOOL002',
        false,
        true,
        NOW(),
        NOW()
    ),
    -- Michael Chen (Physics Teacher) -> Physics
    (
        '550e8400-e29b-41d4-a716-446655447003',
        'TEACHER234756743',
        'SUBJ_PHYS_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    -- Emily Rodriguez (English Teacher) -> English Literature
    (
        '550e8400-e29b-41d4-a716-446655447004',
        'TEACHER345867854',
        'SUBJ_ENG_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    -- David Thompson (History Teacher) -> World History
    (
        '550e8400-e29b-41d4-a716-446655447005',
        'TEACHER456978965',
        'SUBJ_HIST_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    -- Lisa Park (Chemistry Teacher) -> Chemistry
    (
        '550e8400-e29b-41d4-a716-446655447006',
        'TEACHER567089076',
        'SUBJ_CHEM_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    -- James Wilson (PE Teacher) -> Physical Education
    (
        '550e8400-e29b-41d4-a716-446655447007',
        'TEACHER678190187',
        'SUBJ_PE_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    -- Rachel Green (Art Teacher) -> Fine Arts
    (
        '550e8400-e29b-41d4-a716-446655447008',
        'TEACHER789301298',
        'SUBJ_ART_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    -- Robert Martinez (Math Teacher) -> Algebra & Advanced Mathematics
    (
        '550e8400-e29b-41d4-a716-446655447009',
        'TEACHER890412309',
        'SUBJ_ALG_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655447010',
        'TEACHER890412309',
        'SUBJ_MATH_001',
        'SCHOOL002',
        false,
        true,
        NOW(),
        NOW()
    ),
    -- Amanda White (Biology Teacher) -> Biology
    (
        '550e8400-e29b-41d4-a716-446655447011',
        'TEACHER901523410',
        'SUBJ_BIO_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    ),
    -- Kevin Brown (Music Teacher) -> Music Theory
    (
        '550e8400-e29b-41d4-a716-446655447012',
        'TEACHER012634521',
        'SUBJ_MUS_001',
        'SCHOOL002',
        true,
        true,
        NOW(),
        NOW()
    );

-- =============================================
-- VERIFY DATA INSERTION
-- =============================================

-- You can run these queries to verify the data was inserted correctly:
-- SELECT COUNT(*) FROM schools;
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM teacher;
-- SELECT COUNT(*) FROM subject;
-- SELECT COUNT(*) FROM class;
-- SELECT COUNT(*) FROM student;
-- SELECT COUNT(*) FROM teacher_subject;