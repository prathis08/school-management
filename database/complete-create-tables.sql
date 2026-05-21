CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id character varying(255) UNIQUE,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(255) UNIQUE,
    password character varying(255),
    role character varying(50),
    school_id character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: schools; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.schools (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id character varying(255) UNIQUE,
    school_name character varying(255),
    school_code character varying(50),
    address jsonb,
    phone character varying(20),
    email character varying(255),
    website character varying(255),
    principal_name character varying(255),
    principal_phone character varying(20),
    principal_email character varying(255),
    established_year integer,
    school_type character varying(100),
    board character varying(100),
    affiliation_number character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: class; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.class (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id character varying(255) UNIQUE,
    class_teacher_id character varying(255),
    class_name character varying(255),
    school_id character varying(50),
    grade_id character varying(255) NOT NULL,
    grade character varying(255),
    section character varying(255),
    max_students integer,
    room character varying(255),
    schedule jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: subject; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.subject (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id character varying(255) UNIQUE,
    subject_name character varying(255),
    subject_code character varying(255),
    school_id character varying(50),
    description text,
    credits integer,
    department character varying(255),
    syllabus text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: teacher; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.teacher (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id character varying(255) UNIQUE,
    school_id character varying(50),
    department character varying(255),
    qualification character varying(255),
    experience integer,
    date_of_joining date,
    salary numeric(10,2) NULL,
    phone character varying(255),
    address jsonb,
    is_active boolean DEFAULT true,
    user_id character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: student; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.student (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    class_id character varying(255),
    student_id character varying(255) UNIQUE,
    school_id character varying(50),
    name character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    phone character varying(255),
    grade_id character varying(255),
    roll_number character varying(255),
    date_of_birth date,
    gender character varying(50),
    parent_details jsonb,
    emergency_contact jsonb,
    address jsonb,
    admission_date date,
    enrollment_date date,
    status character varying(255),
    is_active boolean DEFAULT true,
    attendance jsonb,
    grades jsonb,
    father_name character varying(255),
    guardian_details jsonb DEFAULT '{}'::jsonb,
    previous_school_details jsonb DEFAULT '{}'::jsonb,
    subjects jsonb,
    admission_number character varying(100),
    staff_relation jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: class_subject; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.class_subject (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_class_subject_class_id_subject_id UNIQUE (class_id, subject_id)
);

--
-- Name: teacher_subject; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.teacher_subject (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id character varying(50),
    subject_id character varying(50),
    school_id character varying(50),
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: exams; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.exams (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id character varying(255) UNIQUE,
    school_id character varying(255),
    exam_name character varying(255),
    exam_type character varying(50),
    class_name character varying(255),
    subject_id character varying(255),
    exam_date date,
    start_time time without time zone,
    end_time time without time zone,
    total_marks integer,
    passing_marks integer,
    academic_year character varying(255),
    instructions text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: results; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id character varying(255) UNIQUE,
    school_id character varying(255),
    exam_id character varying(255),
    student_id character varying(255),
    marks_obtained numeric(5,2),
    grade character varying(255),
    percentage numeric(5,2),
    status character varying(50),
    remarks text,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: fee_structures; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.fee_structures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    fee_structure_id character varying(255) UNIQUE,
    school_id character varying(255) NOT NULL,
    class_name character varying(255),
    title character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    academic_session character varying(255) NOT NULL,
    applicable_grade character varying(255) NOT NULL,
    fee_type character varying(255) NOT NULL,
    description text,
    allow_installments boolean DEFAULT false,
    available_for_discount boolean DEFAULT false,
    due_date date NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: payments; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id character varying(255) UNIQUE,
    school_id character varying(255),
    student_id character varying(255),
    fee_structure_id character varying(255),
    amount numeric(10,2),
    payment_method character varying(50),
    payment_date date,
    receipt_number character varying(255),
    transaction_id character varying(255),
    status character varying(50),
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: tokens; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    token text,
    user_id uuid,
    type character varying(50),
    expires_at timestamp with time zone,
    is_revoked boolean DEFAULT false,
    device_info json,
    ip_address character varying(255),
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: buses; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.buses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_id character varying(255) UNIQUE,
    school_id character varying(255),
    bus_number character varying(255),
    registration_number character varying(255),
    capacity integer,
    driver_name character varying(255),
    driver_phone character varying(255),
    driver_license character varying(255),
    conductor_name character varying(255),
    conductor_phone character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: routes; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.routes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id character varying(255) UNIQUE,
    school_id character varying(255),
    route_name character varying(255),
    bus_id character varying(255),
    start_location character varying(255),
    end_location character varying(255),
    start_time time without time zone,
    end_time time without time zone,
    distance numeric(5,2),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: stops; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.stops (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    stop_id character varying(255) UNIQUE,
    school_id character varying(255),
    route_id character varying(255),
    stop_name character varying(255),
    stop_address text,
    pickup_time time without time zone,
    drop_time time without time zone,
    stop_order integer,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.grade_fees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id character varying(255) NOT NULL,
    fee_structure_id character varying(255) NOT NULL,
    grade_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_school_fee_grade UNIQUE (school_id, fee_structure_id, grade_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_school_id ON public.users(school_id);
CREATE INDEX idx_students_school_id ON public.student(school_id);
CREATE INDEX idx_students_class_id ON public.student(class_id);
CREATE INDEX idx_teachers_school_id ON public.teacher(school_id);
CREATE INDEX idx_exams_school_id ON public.exams(school_id);
CREATE INDEX idx_exams_exam_date ON public.exams(exam_date);
CREATE INDEX idx_results_student_id ON public.results(student_id);
CREATE INDEX idx_results_exam_id ON public.results(exam_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_tokens_user_id ON public.tokens(user_id);
CREATE INDEX idx_tokens_expires_at ON public.tokens(expires_at);
CREATE INDEX idx_class_grade_id ON public.class(grade_id);
CREATE INDEX idx_student_grade_id ON public.student(grade_id);
CREATE INDEX idx_grade_fees_school_id ON public.grade_fees(school_id);
CREATE INDEX idx_grade_fees_fee_structure_id ON public.grade_fees(fee_structure_id);
CREATE INDEX idx_grade_fees_grade_id ON public.grade_fees(grade_id);
CREATE INDEX idx_fee_structures_school_grade ON public.fee_structures(school_id, applicable_grade);
CREATE INDEX idx_student_staff_ward ON public.student ((staff_relation ->> 'isStaffWard'));

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.user_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    theme character varying(20) NOT NULL DEFAULT 'light',
    primary_color character varying(20) NOT NULL DEFAULT '#3B82F6',
    sidebar_style character varying(20) NOT NULL DEFAULT 'expanded',
    language character varying(10) NOT NULL DEFAULT 'en',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: mgmt-backend
-- Task Management Module
--

CREATE TABLE public.tasks (
    id bigserial PRIMARY KEY,
    task_id character varying(50) UNIQUE NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    due_date date,
    due_time time without time zone,
    priority character varying(20) NOT NULL DEFAULT 'medium',
    status character varying(20) NOT NULL DEFAULT 'pending',
    assigned_to_user_id character varying(50),
    created_by_user_id character varying(50) NOT NULL,
    completed_by_user_id character varying(50),
    school_id character varying(50) NOT NULL,
    estimated_hours integer DEFAULT 0,
    actual_hours integer DEFAULT 0,
    progress_percentage integer DEFAULT 0,
    tags jsonb DEFAULT '[]'::jsonb,
    completed_at timestamp with time zone,
    is_active boolean NOT NULL DEFAULT true,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_school_id ON public.tasks(school_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_assigned_to_user_id ON public.tasks(assigned_to_user_id);
CREATE INDEX idx_tasks_created_by_user_id ON public.tasks(created_by_user_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_is_active ON public.tasks(is_active);
CREATE INDEX idx_tasks_tags ON public.tasks USING gin (tags);

--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.task_comments (
    id bigserial PRIMARY KEY,
    comment_id character varying(50) UNIQUE NOT NULL,
    task_id bigint NOT NULL REFERENCES public.tasks(id),
    content text NOT NULL,
    created_by_user_id character varying(50) NOT NULL,
    school_id character varying(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_comments_created_by_user_id ON public.task_comments(created_by_user_id);
CREATE INDEX idx_task_comments_school_id ON public.task_comments(school_id);
CREATE INDEX idx_task_comments_is_active ON public.task_comments(is_active);

--
-- Name: task_attachments; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.task_attachments (
    id bigserial PRIMARY KEY,
    attachment_id character varying(50) UNIQUE NOT NULL,
    task_id bigint NOT NULL REFERENCES public.tasks(id),
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint NOT NULL,
    file_type character varying(100) NOT NULL,
    uploaded_by_user_id character varying(50) NOT NULL,
    school_id character varying(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    deleted_at timestamp with time zone,
    uploaded_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX idx_task_attachments_uploaded_by_user_id ON public.task_attachments(uploaded_by_user_id);
CREATE INDEX idx_task_attachments_school_id ON public.task_attachments(school_id);
CREATE INDEX idx_task_attachments_is_active ON public.task_attachments(is_active);

--
-- Name: task_history; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.task_history (
    id bigserial PRIMARY KEY,
    history_id character varying(50) UNIQUE NOT NULL,
    task_id bigint NOT NULL REFERENCES public.tasks(id),
    action character varying(50) NOT NULL,
    description text NOT NULL,
    old_value jsonb,
    new_value jsonb,
    created_by_user_id character varying(50) NOT NULL,
    school_id character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_history_task_id ON public.task_history(task_id);
CREATE INDEX idx_task_history_action ON public.task_history(action);
CREATE INDEX idx_task_history_created_by_user_id ON public.task_history(created_by_user_id);
CREATE INDEX idx_task_history_school_id ON public.task_history(school_id);

-- =====================================================================
-- Enhanced Fee Management Schema
-- (consolidated here so this file is the single source of truth;
--  enhanced-fee-schema.sql remains as a duplicate for backwards reference)
-- =====================================================================

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.academic_years (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year_id character varying(255) UNIQUE,
    name character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false,
    school_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_school_academic_year UNIQUE (school_id, name)
);

--
-- Name: fee_types; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.fee_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    fee_type_id character varying(255) UNIQUE,
    name character varying(100) NOT NULL,
    description text,
    is_mandatory boolean DEFAULT true,
    is_one_time boolean DEFAULT false,
    is_active boolean DEFAULT true,
    school_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_school_fee_type UNIQUE (school_id, name)
);

--
-- Name: class_fees; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.class_fees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    class_fee_id character varying(255) UNIQUE,
    academic_year_id character varying(255) NOT NULL,
    grade_id character varying(255) NULL,
    class_id character varying(255) NULL,
    fee_type_id character varying(255) NOT NULL,
    annual_amount decimal(10,2) NOT NULL,
    is_mandatory boolean DEFAULT true,
    school_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: installment_schedules; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.installment_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id character varying(255) UNIQUE,
    academic_year_id character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    grade_id character varying(255) NULL,
    class_id character varying(255) NULL,
    student_id character varying(255) NULL,
    schedule_type character varying(50) NOT NULL,
    total_installments integer NOT NULL,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    school_id character varying(255) NOT NULL,
    created_by character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_schedule_assignment CHECK (
        (grade_id IS NOT NULL AND class_id IS NULL AND student_id IS NULL) OR
        (class_id IS NOT NULL AND grade_id IS NULL AND student_id IS NULL) OR
        (student_id IS NOT NULL AND grade_id IS NULL AND class_id IS NULL)
    )
);

--
-- Name: installments; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.installments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    installment_id character varying(255) UNIQUE,
    schedule_id character varying(255) NOT NULL,
    installment_number integer NOT NULL,
    name character varying(100) NOT NULL,
    due_date date NOT NULL,
    is_active boolean DEFAULT true,
    school_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_installment UNIQUE (schedule_id, installment_number)
);

--
-- Name: installment_fee_mappings; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.installment_fee_mappings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mapping_id character varying(255) UNIQUE,
    installment_id character varying(255) NOT NULL,
    fee_type_id character varying(255) NOT NULL,
    percentage decimal(5,2) DEFAULT 100.00,
    fixed_amount decimal(10,2) NULL,
    school_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_installment_fee UNIQUE (installment_id, fee_type_id),
    CONSTRAINT chk_percentage_range CHECK (percentage >= 0 AND percentage <= 100)
);

--
-- Name: student_fee_assignments; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.student_fee_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id character varying(255) UNIQUE,
    student_id character varying(255) NOT NULL,
    academic_year_id character varying(255) NOT NULL,
    schedule_id character varying(255) NULL,
    custom_fees jsonb,
    total_annual_amount decimal(10,2),
    discount_percentage decimal(5,2) DEFAULT 0.00,
    discount_amount decimal(10,2) DEFAULT 0.00,
    final_annual_amount decimal(10,2),
    is_active boolean DEFAULT true,
    school_id character varying(255) NOT NULL,
    assigned_by character varying(255),
    assigned_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_assignment UNIQUE (student_id, academic_year_id)
);

--
-- Name: fee_payments; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.fee_payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id character varying(255) UNIQUE,
    student_id character varying(255) NOT NULL,
    assignment_id character varying(255) NOT NULL,
    installment_id character varying(255) NULL,
    academic_year_id character varying(255) NOT NULL,
    amount decimal(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_date date NOT NULL,
    receipt_number character varying(255) UNIQUE,
    transaction_id character varying(255),
    status character varying(50) DEFAULT 'COMPLETED',
    payment_type character varying(50) DEFAULT 'INSTALLMENT',
    late_fee_amount decimal(10,2) DEFAULT 0.00,
    discount_applied decimal(10,2) DEFAULT 0.00,
    notes text,
    school_id character varying(255) NOT NULL,
    collected_by character varying(255),
    verified_by character varying(255),
    verified_at timestamp with time zone,
    is_refunded boolean DEFAULT false,
    refund_amount decimal(10,2) DEFAULT 0.00,
    refund_date date NULL,
    refund_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: student_installment_status; Type: TABLE; Schema: public; Owner: mgmt-backend
--

CREATE TABLE public.student_installment_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    status_id character varying(255) UNIQUE,
    student_id character varying(255) NOT NULL,
    installment_id character varying(255) NOT NULL,
    assignment_id character varying(255) NOT NULL,
    due_amount decimal(10,2) NOT NULL,
    paid_amount decimal(10,2) DEFAULT 0.00,
    balance_amount decimal(10,2) NOT NULL,
    status character varying(50) DEFAULT 'PENDING',
    due_date date NOT NULL,
    paid_date date NULL,
    late_fee_applicable decimal(10,2) DEFAULT 0.00,
    days_overdue integer DEFAULT 0,
    school_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_installment UNIQUE (student_id, installment_id)
);

-- Enhanced fee indexes
CREATE INDEX idx_academic_years_school_active ON public.academic_years(school_id, is_active);
CREATE INDEX idx_fee_types_school_active ON public.fee_types(school_id, is_active);
CREATE INDEX idx_class_fees_academic_year ON public.class_fees(academic_year_id);
CREATE INDEX idx_class_fees_grade_id ON public.class_fees(grade_id);
CREATE INDEX idx_class_fees_class_id ON public.class_fees(class_id);
CREATE INDEX idx_installment_schedules_school ON public.installment_schedules(school_id, is_active);
CREATE INDEX idx_installment_schedules_grade ON public.installment_schedules(grade_id);
CREATE INDEX idx_installment_schedules_class ON public.installment_schedules(class_id);
CREATE INDEX idx_installment_schedules_student ON public.installment_schedules(student_id);
CREATE INDEX idx_installments_schedule_due_date ON public.installments(schedule_id, due_date);
CREATE INDEX idx_student_assignments_student_year ON public.student_fee_assignments(student_id, academic_year_id);
CREATE INDEX idx_fee_payments_student_year ON public.fee_payments(student_id, academic_year_id);
CREATE INDEX idx_fee_payments_payment_date ON public.fee_payments(payment_date);
CREATE INDEX idx_student_installment_status_student ON public.student_installment_status(student_id);
CREATE INDEX idx_student_installment_status_due_date ON public.student_installment_status(due_date);
CREATE INDEX idx_student_installment_status_overdue ON public.student_installment_status(status, due_date);

--
-- PostgreSQL database dump complete
--