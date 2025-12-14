CREATE TABLE schools (
    id UUID,
    schoolId VARCHAR(255),
    school_name VARCHAR(255),
    school_code VARCHAR(50),
    address JSONB,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    principal_name VARCHAR(255),
    principal_phone VARCHAR(20),
    principal_email VARCHAR(255),
    established_year INTEGER,
    school_type VARCHAR(100),
    board VARCHAR(100),
    affiliation_number VARCHAR(255),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE users (
    id UUID,
    user_id VARCHAR(255),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(50),
    schoolId VARCHAR(50),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE tokens (
    id UUID,
    token TEXT,
    user_id UUID,
    type VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN,
    device_info JSON,
    ip_address VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE teacher (
    id UUID,
    user_id UUID,
    teacher_id VARCHAR(255),
    schoolId VARCHAR(50),
    department VARCHAR(255),
    qualification VARCHAR(255),
    experience INTEGER,
    date_of_joining DATE,
    salary DECIMAL(10, 2),
    phone VARCHAR(255),
    address JSONB,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE class (
    id UUID,
    class_id VARCHAR(255),
    class_teacher_id UUID,
    class_name VARCHAR(255),
    schoolId VARCHAR(50),
    grade VARCHAR(255),
    section VARCHAR(255),
    max_students INTEGER,
    room VARCHAR(255),
    schedule JSONB,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE student (
    id UUID,
    user_id UUID,
    class_id UUID,
    student_id VARCHAR(255),
    schoolId VARCHAR(50),
    name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    grade VARCHAR(255),
    roll_number VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(50),
    parent_details JSONB,
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(255),
    emergency_contact JSONB,
    address JSONB,
    admission_date DATE,
    enrollment_date DATE,
    status VARCHAR(255),
    is_active BOOLEAN,
    attendance JSONB,
    grades JSONB,
    father_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE subject (
    id UUID,
    subject_id VARCHAR(255),
    subject_name VARCHAR(255),
    subject_code VARCHAR(255),
    schoolId VARCHAR(50),
    description TEXT,
    credits INTEGER,
    department VARCHAR(255),
    syllabus TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE exams (
    id UUID,
    exam_id VARCHAR(255),
    schoolId VARCHAR(255),
    exam_name VARCHAR(255),
    exam_type VARCHAR(50),
    class_name VARCHAR(255),
    subject_id UUID,
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    total_marks INTEGER,
    passing_marks INTEGER,
    academic_year VARCHAR(255),
    instructions TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE results (
    id UUID,
    result_id VARCHAR(255),
    schoolId VARCHAR(255),
    exam_id UUID,
    student_id UUID,
    marks_obtained DECIMAL(5, 2),
    grade VARCHAR(255),
    percentage DECIMAL(5, 2),
    status VARCHAR(50),
    remarks TEXT,
    is_published BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE fee_structures (
    id UUID,
    fee_structure_id VARCHAR(255),
    schoolId VARCHAR(255),
    class_name VARCHAR(255),
    fee_type VARCHAR(50),
    amount DECIMAL(10, 2),
    due_date DATE,
    academic_year VARCHAR(255),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE payments (
    id UUID,
    payment_id VARCHAR(255),
    schoolId VARCHAR(255),
    student_id UUID,
    fee_structure_id UUID,
    amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_date DATE,
    receipt_number VARCHAR(255),
    transaction_id VARCHAR(255),
    status VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE buses (
    id UUID,
    bus_id VARCHAR(255),
    schoolId VARCHAR(255),
    bus_number VARCHAR(255),
    registration_number VARCHAR(255),
    capacity INTEGER,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(255),
    driver_license VARCHAR(255),
    conductor_name VARCHAR(255),
    conductor_phone VARCHAR(255),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE routes (
    id UUID,
    route_id VARCHAR(255),
    schoolId VARCHAR(255),
    route_name VARCHAR(255),
    bus_id UUID,
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    start_time TIME,
    end_time TIME,
    distance DECIMAL(5, 2),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE stops (
    id UUID,
    stop_id VARCHAR(255),
    schoolId VARCHAR(255),
    route_id UUID,
    stop_name VARCHAR(255),
    stop_address TEXT,
    pickup_time TIME,
    drop_time TIME,
    stop_order INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE teacher_subject (
    id UUID,
    teacher_id VARCHAR(50),
    subject_id VARCHAR(50),
    schoolId VARCHAR(50),
    is_primary BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);