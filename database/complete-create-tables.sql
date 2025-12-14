--
-- PostgreSQL database dump - For mgmt-backend user (after permissions granted)
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: mgmt-backend
--

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
    salary numeric(10,2),
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
    grade character varying(255),
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
    school_id character varying(255),
    class_name character varying(255),
    fee_type character varying(50),
    amount numeric(10,2),
    due_date date,
    academic_year character varying(255),
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

--
-- PostgreSQL database dump complete
--