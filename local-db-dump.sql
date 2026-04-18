--
-- PostgreSQL database dump
--

\restrict 43vvhELNZTeb9geW3fP9jIB43EpWwYslJtoHVwsy5co5z0ioG92UezKFFl3aCOe

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: access_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access_logs (
    id integer NOT NULL,
    license_plate character varying(50),
    house_number character varying(50),
    action character varying(10),
    image_url text,
    gate_name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type character varying(20) DEFAULT 'RESIDENT'::character varying,
    visitor_log_id integer,
    visitor_id integer,
    site_id integer
);


ALTER TABLE public.access_logs OWNER TO postgres;

--
-- Name: access_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.access_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.access_logs_id_seq OWNER TO postgres;

--
-- Name: access_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.access_logs_id_seq OWNED BY public.access_logs.id;


--
-- Name: gate_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gate_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    code text,
    site_id integer
);


ALTER TABLE public.gate_types OWNER TO postgres;

--
-- Name: gate_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gate_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gate_types_id_seq OWNER TO postgres;

--
-- Name: gate_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gate_types_id_seq OWNED BY public.gate_types.id;


--
-- Name: gates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gates (
    id integer NOT NULL,
    zone_id integer,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type_id integer,
    site_id integer
);


ALTER TABLE public.gates OWNER TO postgres;

--
-- Name: gates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gates_id_seq OWNER TO postgres;

--
-- Name: gates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gates_id_seq OWNED BY public.gates.id;


--
-- Name: news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news (
    id integer NOT NULL,
    site_id integer,
    title character varying(255) NOT NULL,
    content text,
    image_url character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    provider_id integer
);


ALTER TABLE public.news OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_id_seq OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: news_reads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news_reads (
    id integer NOT NULL,
    news_id integer,
    resident_id integer,
    read_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.news_reads OWNER TO postgres;

--
-- Name: news_reads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_reads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_reads_id_seq OWNER TO postgres;

--
-- Name: news_reads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_reads_id_seq OWNED BY public.news_reads.id;


--
-- Name: packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    max_vehicles integer NOT NULL,
    monthly_price numeric(10,2) NOT NULL,
    yearly_price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.packages OWNER TO postgres;

--
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.packages_id_seq OWNER TO postgres;

--
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- Name: park_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.park_types (
    id integer NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    parking_fee_id integer,
    provider_id integer
);


ALTER TABLE public.park_types OWNER TO postgres;

--
-- Name: park_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.park_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.park_types_id_seq OWNER TO postgres;

--
-- Name: park_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.park_types_id_seq OWNED BY public.park_types.id;


--
-- Name: parking_discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_discounts (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    provider_id integer,
    discount_type character varying(20) DEFAULT 'AMOUNT'::character varying,
    discount_minutes integer DEFAULT 0
);


ALTER TABLE public.parking_discounts OWNER TO postgres;

--
-- Name: parking_discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_discounts_id_seq OWNER TO postgres;

--
-- Name: parking_discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_discounts_id_seq OWNED BY public.parking_discounts.id;


--
-- Name: parking_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_fees (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    fee_type character varying(50) DEFAULT 'GENERAL'::character varying,
    grace_period_minutes integer DEFAULT 0,
    free_hours_with_stamp integer DEFAULT 0,
    is_flat_rate boolean DEFAULT false,
    base_hourly_rate numeric(10,2) DEFAULT 0,
    has_tiered_rates boolean DEFAULT false,
    tiered_rates jsonb DEFAULT '[]'::jsonb,
    rounding_minutes integer DEFAULT 15,
    daily_max_rate numeric(10,2) DEFAULT NULL::numeric,
    has_overnight_penalty boolean DEFAULT false,
    overnight_penalty_rate numeric(10,2) DEFAULT NULL::numeric,
    overnight_start_time time without time zone,
    overnight_end_time time without time zone,
    is_subscription boolean DEFAULT false,
    monthly_rate numeric(10,2) DEFAULT NULL::numeric,
    provider_id integer,
    has_time_interval_rates boolean DEFAULT false,
    time_interval_rates jsonb DEFAULT '[]'::jsonb,
    applicable_days character varying(50) DEFAULT 'ALL'::character varying,
    applicable_park_type_ids jsonb DEFAULT '[]'::jsonb,
    buffer_time_minutes integer DEFAULT 15,
    revenue_type_id integer
);


ALTER TABLE public.parking_fees OWNER TO postgres;

--
-- Name: parking_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_fees_id_seq OWNER TO postgres;

--
-- Name: parking_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_fees_id_seq OWNED BY public.parking_fees.id;


--
-- Name: parking_fines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_fines (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    fine_amount numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    provider_id integer
);


ALTER TABLE public.parking_fines OWNER TO postgres;

--
-- Name: parking_fines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_fines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_fines_id_seq OWNER TO postgres;

--
-- Name: parking_fines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_fines_id_seq OWNED BY public.parking_fines.id;


--
-- Name: provider_revenues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_revenues (
    id integer NOT NULL,
    site_id integer,
    package_id integer,
    billing_cycle character varying(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'PAID'::character varying,
    period_start timestamp without time zone,
    period_end timestamp without time zone
);


ALTER TABLE public.provider_revenues OWNER TO postgres;

--
-- Name: provider_revenues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.provider_revenues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provider_revenues_id_seq OWNER TO postgres;

--
-- Name: provider_revenues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.provider_revenues_id_seq OWNED BY public.provider_revenues.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    name text NOT NULL,
    tax_id text,
    address text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    invoice_advance_days integer DEFAULT 7
);


ALTER TABLE public.providers OWNER TO postgres;

--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.providers_id_seq OWNER TO postgres;

--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: residents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.residents (
    id integer NOT NULL,
    house_number text NOT NULL,
    license_plate text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    line_user_id text,
    invite_code text,
    line_display_name text,
    line_picture_url text,
    owner_name character varying(150),
    phone_number character varying(50),
    is_owner boolean DEFAULT true,
    parent_id integer,
    site_id integer,
    privacy_mode boolean DEFAULT false
);


ALTER TABLE public.residents OWNER TO postgres;

--
-- Name: residents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.residents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.residents_id_seq OWNER TO postgres;

--
-- Name: residents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.residents_id_seq OWNED BY public.residents.id;


--
-- Name: revenue_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_groups (
    id integer NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    provider_id integer,
    site_id integer
);


ALTER TABLE public.revenue_groups OWNER TO postgres;

--
-- Name: revenue_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revenue_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revenue_groups_id_seq OWNER TO postgres;

--
-- Name: revenue_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revenue_groups_id_seq OWNED BY public.revenue_groups.id;


--
-- Name: revenue_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_methods (
    id integer NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.revenue_methods OWNER TO postgres;

--
-- Name: revenue_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revenue_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revenue_methods_id_seq OWNER TO postgres;

--
-- Name: revenue_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revenue_methods_id_seq OWNED BY public.revenue_methods.id;


--
-- Name: revenue_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_types (
    id integer NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    group_id integer
);


ALTER TABLE public.revenue_types OWNER TO postgres;

--
-- Name: revenue_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revenue_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revenue_types_id_seq OWNER TO postgres;

--
-- Name: revenue_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revenue_types_id_seq OWNED BY public.revenue_types.id;


--
-- Name: revenues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenues (
    id integer NOT NULL,
    site_id integer,
    type_id integer,
    method_id integer,
    receipt_no text NOT NULL,
    license_plate text,
    description text,
    amount numeric(10,2) DEFAULT 0 NOT NULL,
    payment_method text DEFAULT 'CASH'::text,
    payment_status text DEFAULT 'PAID'::text,
    issued_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    group_id integer,
    visitor_id integer
);


ALTER TABLE public.revenues OWNER TO postgres;

--
-- Name: revenues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revenues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revenues_id_seq OWNER TO postgres;

--
-- Name: revenues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revenues_id_seq OWNED BY public.revenues.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    permissions text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sites (
    id integer NOT NULL,
    provider_id integer,
    name text NOT NULL,
    address text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    max_vehicles integer DEFAULT 1,
    max_residents integer DEFAULT 2,
    lat numeric(10,8),
    lng numeric(11,8),
    contact_link character varying(255),
    package_id integer,
    package_cycle character varying(20) DEFAULT 'MONTHLY'::character varying,
    package_expires_at timestamp without time zone
);


ALTER TABLE public.sites OWNER TO postgres;

--
-- Name: sites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sites_id_seq OWNER TO postgres;

--
-- Name: sites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sites_id_seq OWNED BY public.sites.id;


--
-- Name: special_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_days (
    id integer NOT NULL,
    name text NOT NULL,
    date date NOT NULL,
    is_recurring boolean DEFAULT false,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    provider_id integer
);


ALTER TABLE public.special_days OWNER TO postgres;

--
-- Name: special_days_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.special_days_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.special_days_id_seq OWNER TO postgres;

--
-- Name: special_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.special_days_id_seq OWNED BY public.special_days.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    password text DEFAULT 'e5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4'::text NOT NULL,
    role text DEFAULT 'Guard'::text,
    role_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    provider_ids jsonb DEFAULT '[]'::jsonb,
    site_ids jsonb DEFAULT '[]'::jsonb,
    level text DEFAULT 'Level1'::text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicle_brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_brands (
    id integer NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer
);


ALTER TABLE public.vehicle_brands OWNER TO postgres;

--
-- Name: vehicle_brands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_brands_id_seq OWNER TO postgres;

--
-- Name: vehicle_brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_brands_id_seq OWNED BY public.vehicle_brands.id;


--
-- Name: vehicle_colors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_colors (
    id integer NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer
);


ALTER TABLE public.vehicle_colors OWNER TO postgres;

--
-- Name: vehicle_colors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_colors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_colors_id_seq OWNER TO postgres;

--
-- Name: vehicle_colors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_colors_id_seq OWNED BY public.vehicle_colors.id;


--
-- Name: vehicle_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_logs (
    id integer NOT NULL,
    license_plate text NOT NULL,
    vehicle_type text,
    house_number text,
    purpose text,
    lpr_image_url text,
    lpr_confidence text,
    entry_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    exit_time timestamp without time zone,
    status text DEFAULT 'IN'::text,
    is_resident boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vehicle_logs OWNER TO postgres;

--
-- Name: vehicle_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_logs_id_seq OWNER TO postgres;

--
-- Name: vehicle_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_logs_id_seq OWNED BY public.vehicle_logs.id;


--
-- Name: vehicle_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_types (
    id integer NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    provider_id integer
);


ALTER TABLE public.vehicle_types OWNER TO postgres;

--
-- Name: vehicle_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_types_id_seq OWNER TO postgres;

--
-- Name: vehicle_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_types_id_seq OWNED BY public.vehicle_types.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    site_id integer,
    type_id integer,
    park_type_id integer,
    license_plate text NOT NULL,
    province text,
    brand text,
    color text,
    owner_name text,
    house_number text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url character varying(255),
    resident_id integer
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: verification_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_codes (
    id integer NOT NULL,
    user_id integer,
    email character varying(255),
    code character varying(6),
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.verification_codes OWNER TO postgres;

--
-- Name: verification_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.verification_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.verification_codes_id_seq OWNER TO postgres;

--
-- Name: verification_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.verification_codes_id_seq OWNED BY public.verification_codes.id;


--
-- Name: visitors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitors (
    id integer NOT NULL,
    id_card_number text,
    full_name text NOT NULL,
    card_type text DEFAULT 'ID Card'::text,
    vehicle_plate text,
    purpose text,
    house_number text,
    check_in_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    check_out_time timestamp without time zone,
    status text DEFAULT 'IN'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_id integer,
    phone_number character varying(50),
    invite_token character varying(255),
    expected_in_time timestamp without time zone,
    image_url character varying(255),
    vehicle_province character varying(255),
    vehicle_color character varying(100),
    provider_id integer,
    e_stamp boolean DEFAULT false,
    e_stamp_date timestamp without time zone
);


ALTER TABLE public.visitors OWNER TO postgres;

--
-- Name: visitors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visitors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visitors_id_seq OWNER TO postgres;

--
-- Name: visitors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visitors_id_seq OWNED BY public.visitors.id;


--
-- Name: zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zones (
    id integer NOT NULL,
    site_id integer,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.zones OWNER TO postgres;

--
-- Name: zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.zones_id_seq OWNER TO postgres;

--
-- Name: zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.zones_id_seq OWNED BY public.zones.id;


--
-- Name: access_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs ALTER COLUMN id SET DEFAULT nextval('public.access_logs_id_seq'::regclass);


--
-- Name: gate_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_types ALTER COLUMN id SET DEFAULT nextval('public.gate_types_id_seq'::regclass);


--
-- Name: gates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gates ALTER COLUMN id SET DEFAULT nextval('public.gates_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: news_reads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_reads ALTER COLUMN id SET DEFAULT nextval('public.news_reads_id_seq'::regclass);


--
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- Name: park_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.park_types ALTER COLUMN id SET DEFAULT nextval('public.park_types_id_seq'::regclass);


--
-- Name: parking_discounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_discounts ALTER COLUMN id SET DEFAULT nextval('public.parking_discounts_id_seq'::regclass);


--
-- Name: parking_fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_fees ALTER COLUMN id SET DEFAULT nextval('public.parking_fees_id_seq'::regclass);


--
-- Name: parking_fines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_fines ALTER COLUMN id SET DEFAULT nextval('public.parking_fines_id_seq'::regclass);


--
-- Name: provider_revenues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_revenues ALTER COLUMN id SET DEFAULT nextval('public.provider_revenues_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: residents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.residents ALTER COLUMN id SET DEFAULT nextval('public.residents_id_seq'::regclass);


--
-- Name: revenue_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_groups ALTER COLUMN id SET DEFAULT nextval('public.revenue_groups_id_seq'::regclass);


--
-- Name: revenue_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_methods ALTER COLUMN id SET DEFAULT nextval('public.revenue_methods_id_seq'::regclass);


--
-- Name: revenue_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_types ALTER COLUMN id SET DEFAULT nextval('public.revenue_types_id_seq'::regclass);


--
-- Name: revenues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenues ALTER COLUMN id SET DEFAULT nextval('public.revenues_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites ALTER COLUMN id SET DEFAULT nextval('public.sites_id_seq'::regclass);


--
-- Name: special_days id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_days ALTER COLUMN id SET DEFAULT nextval('public.special_days_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicle_brands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_brands ALTER COLUMN id SET DEFAULT nextval('public.vehicle_brands_id_seq'::regclass);


--
-- Name: vehicle_colors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_colors ALTER COLUMN id SET DEFAULT nextval('public.vehicle_colors_id_seq'::regclass);


--
-- Name: vehicle_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_logs ALTER COLUMN id SET DEFAULT nextval('public.vehicle_logs_id_seq'::regclass);


--
-- Name: vehicle_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_types ALTER COLUMN id SET DEFAULT nextval('public.vehicle_types_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: verification_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_codes ALTER COLUMN id SET DEFAULT nextval('public.verification_codes_id_seq'::regclass);


--
-- Name: visitors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors ALTER COLUMN id SET DEFAULT nextval('public.visitors_id_seq'::regclass);


--
-- Name: zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zones ALTER COLUMN id SET DEFAULT nextval('public.zones_id_seq'::regclass);


--
-- Data for Name: access_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.access_logs (id, license_plate, house_number, action, image_url, gate_name, created_at, type, visitor_log_id, visitor_id, site_id) FROM stdin;
1	1กก1111	333/57	IN	\N	\N	2026-04-14 16:31:18.367987	VISITOR	\N	24	\N
2	1กก1111	333/57	OUT	\N	\N	2026-04-14 16:31:57.975369	VISITOR	\N	24	\N
3	2กก2222	333/56	IN	\N	\N	2026-04-14 16:33:02.903119	VISITOR	\N	25	\N
4	6ขท5161	333/56	IN	\N	Gate 1 (Manual Test)	2026-04-14 16:34:26.002242	RESIDENT	\N	\N	\N
5	6ขท5161	333/56	OUT	\N	Gate 1 (Manual Test)	2026-04-14 16:34:36.795383	RESIDENT	\N	\N	\N
6	2กก2222	333/56	OUT	\N	\N	2026-04-14 16:37:44.241075	VISITOR	\N	25	\N
7	ฒก8534	333/56	IN	\N	\N	2026-04-14 16:41:14.64218	VISITOR	\N	26	\N
8	3กก3333	333/56	IN	\N	\N	2026-04-14 16:45:14.644139	VISITOR	\N	27	\N
9	ฒก8534	333/56	OUT	\N	\N	2026-04-14 16:50:44.256114	VISITOR	\N	26	\N
10	3กก3333	333/56	OUT	\N	\N	2026-04-14 16:56:54.260645	VISITOR	\N	27	\N
11	4กก4444	333/56	IN	\N	\N	2026-04-14 16:57:40.376423	VISITOR	\N	28	\N
12	4กก4444	333/56	OUT	\N	\N	2026-04-14 16:59:29.421969	VISITOR	\N	28	\N
13	5กก55555	333/56	IN	\N	\N	2026-04-14 17:12:24.448352	VISITOR	\N	29	\N
14	5กก55555	333/56	OUT	\N	\N	2026-04-14 17:33:02.469535	VISITOR	\N	29	\N
15	1กก1111	333/56	IN	\N	\N	2026-04-14 23:03:38.845063	VISITOR	\N	30	\N
16	1กก1111	333/56	OUT	\N	\N	2026-04-14 23:04:16.342298	VISITOR	\N	30	\N
17	1กก1111	333/56	IN	\N	\N	2026-04-14 23:06:19.718891	VISITOR	\N	31	\N
18	1กก1111	333/56	OUT	\N	\N	2026-04-14 23:06:52.681345	VISITOR	\N	31	\N
19	ฒก8534	333/56	IN	\N	\N	2026-04-14 23:09:04.433179	VISITOR	\N	32	\N
20	ฒก8534	333/56	OUT	\N	\N	2026-04-14 23:11:36.708825	VISITOR	\N	32	\N
21	กค6769	333/56	IN	\N	\N	2026-04-14 23:12:51.95114	VISITOR	\N	33	\N
22	กค6769	333/56	OUT	\N	\N	2026-04-14 23:15:28.899114	VISITOR	\N	33	\N
23	กค6769	333/56	IN	\N	\N	2026-04-14 23:17:33.700704	VISITOR	\N	34	\N
24	กค6769	333/56	OUT	\N	\N	2026-04-14 23:19:53.738097	VISITOR	\N	34	\N
25	7ขฆ6082	333/56	IN	\N	Gate 1 (Manual Test)	2026-04-14 23:20:39.720416	RESIDENT	\N	\N	\N
26	7ขฆ6082	333/56	OUT	\N	Gate 1 (Manual Test)	2026-04-14 23:20:47.156863	RESIDENT	\N	\N	\N
27	1กภ5588	333/56	IN	\N	Gate 1 (Manual Test)	2026-04-14 23:22:57.160351	RESIDENT	\N	\N	\N
28	1กภ5588	333/56	OUT	\N	Gate 1 (Manual Test)	2026-04-14 23:23:03.86239	RESIDENT	\N	\N	\N
29	1กก1111	333/56	IN	\N	\N	2026-04-14 23:33:33.572055	VISITOR	\N	35	\N
30	1กก1111	333/56	OUT	\N	\N	2026-04-14 23:51:14.993435	VISITOR	\N	35	\N
31	1กก1111	333/56	IN	\N	\N	2026-04-15 00:01:03.955227	VISITOR	\N	36	\N
32	1กก1111	333/56	OUT	\N	\N	2026-04-15 00:33:33.61778	VISITOR	\N	36	\N
33	1กก1111	333/56	IN	\N	\N	2026-04-15 19:41:26.793919	VISITOR	\N	37	\N
34	1กก1111	333/56	IN	\N	\N	2026-04-15 19:52:03.532554	VISITOR	\N	38	\N
35	1กก1111	333/56	OUT	\N	\N	2026-04-15 20:03:04.846163	VISITOR	\N	38	\N
36	1กก1111	333/59	IN	\N	\N	2026-04-16 10:28:43.552807	VISITOR	\N	39	\N
37	1กก1111	333/59	OUT	\N	\N	2026-04-16 10:37:29.346748	VISITOR	\N	39	\N
\.


--
-- Data for Name: gate_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gate_types (id, name, description, is_active, created_at, code, site_id) FROM stdin;
1	ตู้ทางเข้า	\N	t	2026-03-31 20:34:00.94765	GT-001	\N
2	ตู้ทางออก	\N	t	2026-03-31 20:40:06.645319	GT-002	\N
\.


--
-- Data for Name: gates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gates (id, zone_id, name, description, is_active, created_at, type_id, site_id) FROM stdin;
2	1	ทางเข้า	\N	t	2026-03-31 20:18:10.698567	1	\N
1	1	ทางออก	\N	t	2026-03-31 20:15:05.88764	1	\N
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.news (id, site_id, title, content, image_url, is_active, created_at, provider_id) FROM stdin;
1	1	ทดสอบข่าวสาร	ทดสอบข่าวสาร	/uploads/news/news-1776001061793.webp	t	2026-04-12 12:49:34.104434	\N
\.


--
-- Data for Name: news_reads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.news_reads (id, news_id, resident_id, read_at) FROM stdin;
1	1	10	2026-04-12 12:49:55.691282
2	1	12	2026-04-13 12:46:19.816394
3	1	20	2026-04-16 09:14:27.523937
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.packages (id, name, max_vehicles, monthly_price, yearly_price, is_active, created_at) FROM stdin;
5	Pro	10	2000.00	20000.00	t	2026-04-12 16:30:48.610301
4	Basic	5	1000.00	10000.00	t	2026-04-12 14:59:37.993826
\.


--
-- Data for Name: park_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.park_types (id, code, name, description, is_active, created_at, site_id, parking_fee_id, provider_id) FROM stdin;
2	PT-002	ลูกบ้าน	\N	t	2026-04-12 06:53:37.278625	\N	\N	\N
1	PT-001	ผู้มาติดต่อ	\N	t	2026-04-12 06:53:24.868336	\N	1	\N
\.


--
-- Data for Name: parking_discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_discounts (id, name, description, discount_amount, is_active, created_at, site_id, provider_id, discount_type, discount_minutes) FROM stdin;
\.


--
-- Data for Name: parking_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_fees (id, name, description, is_active, created_at, site_id, fee_type, grace_period_minutes, free_hours_with_stamp, is_flat_rate, base_hourly_rate, has_tiered_rates, tiered_rates, rounding_minutes, daily_max_rate, has_overnight_penalty, overnight_penalty_rate, overnight_start_time, overnight_end_time, is_subscription, monthly_rate, provider_id, has_time_interval_rates, time_interval_rates, applicable_days, applicable_park_type_ids, buffer_time_minutes, revenue_type_id) FROM stdin;
2	ลูกบ้าน	\N	t	2026-04-14 12:07:26.261648	1	VIP	0	24	f	0.00	f	[]	15	0.00	f	0.00	00:00:00	06:00:00	f	0.00	4	f	[]	ALL	[2]	15	2
3	ผู้มาติดต่อ	\N	t	2026-04-14 12:08:17.956168	1	GENERAL	1	0	t	50.00	f	[]	60	600.00	f	0.00	00:00:00	06:00:00	f	0.00	4	f	[]	ALL	[1]	1	1
\.


--
-- Data for Name: parking_fines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_fines (id, name, description, fine_amount, is_active, created_at, site_id, provider_id) FROM stdin;
1	ปรับบัตรหาย	\N	100.00	t	2026-04-14 12:31:04.894969	1	4
2	ปรับจอดรถ	\N	300.00	t	2026-04-14 12:31:17.117821	1	4
\.


--
-- Data for Name: provider_revenues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provider_revenues (id, site_id, package_id, billing_cycle, amount, created_at, status, period_start, period_end) FROM stdin;
8	1	4	MONTHLY	633.00	2026-04-12 15:22:02.347816	PAID	2026-04-12 08:22:02.338	2026-04-30 16:59:59.999
11	1	4	MONTHLY	1000.00	2026-04-12 16:00:38.070966	PENDING	2026-05-01 00:00:00	2026-05-31 23:59:59.999
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.providers (id, name, tax_id, address, is_active, created_at, invoice_advance_days) FROM stdin;
3	NVK	\N	\N	t	2026-04-12 14:02:49.993318	7
4	Ricoh	\N	\N	t	2026-04-12 14:03:03.185539	7
1	บริษัท พีเอสเอส กรุ๊ป (ประเทศไทย) จำกัด	0115560017379	45/4 ม.5 ต.บางเมือง อ.เมือง จ.สมุทรปราการ 10270	t	2026-03-31 19:42:38.130655	20
\.


--
-- Data for Name: residents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.residents (id, house_number, license_plate, is_active, created_at, line_user_id, invite_code, line_display_name, line_picture_url, owner_name, phone_number, is_owner, parent_id, site_id, privacy_mode) FROM stdin;
23	333/59	จต32 กรุงเทพมหานคร	t	2026-04-15 19:26:21.527256	U8b9a503a9ac03f9815288579ceae09d0	PSS-96B714	Promphila.P	https://profile.line-scdn.net/0hzKZ8dw-cJWR3QToo8CVbWgcRJg5UMHx2XCJpAhAWfVFLcmJiUyM5VUBGLlNPJmcwUic-AERDLAFVDgVpGSQ5bF40JRYZKmR2CyciVDgYZz9JIWpEMm8_QRcBc1U0cj02JW5jRyQbDyoOcgNMDS8uVQYWEjxIJQd7BxZJMnJzS-cYQ1IxWiZiBERBelzJ	\N	\N	t	\N	1	f
20	333/58	ฒก8534 กรุงเทพมหานคร	t	2026-04-12 13:33:35.610958	Uff267953de9f30d648e64ce0b1daf2ae	PSS-1C52D5	PSS Camera 	https://profile.line-scdn.net/0hu7rYtMghKhhfIDWfeUtUJi9wKXJ8UXMKexFtej4lfChjE2VNIEJneWMoIXwyEWsZJ08wdmghJCt9EAxINkY9BytzHV1-bTkrMAMGAR1Qc3sqSiY4NR4MHCp7MGo4FBJGGDhhPT1LDC8kUwwNEwRhHz1_L09-RCsKLXdGTloSRJswIl1NckdteGwgdSDh	PSS Camera 	0624499900	t	\N	1	f
19	333/57	กง9066 ตราด	t	2026-04-11 20:40:25.791897	Ua73411c2f983aa89172aa92c2d8d3372	PSS-CA3951	Matt	https://profile.line-scdn.net/0hKEXYM77TFGp1IAo9VG9qVAVwFwBWUU14XE5fWBApQgpNRAE7DkMPCkJ0H1MdGFZvCRIJC0cmQl1XEy55EREJVxtoSykhGFRjIjEsZRVTHjsDSS1fJAEwWAhZTTJJZS99LE46dFwlFQJLGQtgLjA5eSl6SCBLSxBbDXd4PHASeukaImM_WEdTCkYgS1LL	Matt	0656644422	t	\N	1	f
18	333/56	วพ3572 กรุงเทพมหานคร	t	2026-04-11 19:30:08.629927	Uf2c8458131d9dcd81b7082b1d891f6f9	PSS-FAM-09715B	VooT	https://profile.line-scdn.net/0hLAE3Ub3XE25oSgIeksxtERgaEARLO0p8ES9dCQlCGQ1RflU-ECldCF4fTw4CegEwTXsJCFpPHVhkWWQIdhzvWm96Tl9UclI-RC1Uiw	ทรงวุฒิ ชุ่มเกษร	0844595030	f	10	1	t
10	333/56	1กภ5588 สมุทรสาคร	t	2026-04-11 15:28:50.497825	Ub5d2d286ff898e8e79a31a45da04e2ca	PSS-46C5DF	Toon PSS	https://profile.line-scdn.net/0hZcCoYGbEBUxuFho3Cr17ch5GBiZNZ1xeSnRNLVpEWisEI0EcQHNPfl4fWH1VJRdKFXJOfV5EWClMRBB6GjsOfg1jGTwSLxVcGywtfQNSXRkKfSoGMDcVWF4TLHtacRJPQxUIUS90XDcSZTVZRHUcVDhkCQgAURJTOUFpGmska88BFHIZQ3FCLF0WWnTQ	ติณณ์ณชัย	0988896699	t	\N	1	t
12	333/56	7ขฆ6082 กรุงเทพมหานคร	t	2026-04-11 15:42:29.173134	Uda518573d02df293e9ff08c803e01c47	PSS-FAM-F88BA0	FAM	https://profile.line-scdn.net/0hzKRaAtDNJWR_GDTPM5hbWg9IJg5caXx2VH9uUU0fK1FKLGVgAH04Ak8aLgMQeGIxBn1oV0xPclddLWMwUgdsdhYEJzIbTiNPBngWUCNEJFA1Xj5PJzlqbEpcCAIsUCJRMnkCezlLfQtARh9wFhU1YhFkJT07WBE1E09JMnoqS-cQGlIxUn9iBEwYelzB	แฟ้ม	\N	f	10	1	t
\.


--
-- Data for Name: revenue_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revenue_groups (id, code, name, description, is_active, created_at, provider_id, site_id) FROM stdin;
1	RG-001	ค่าบริการจอดรถ		t	2026-04-14 12:30:27.755241	4	1
2	RG-002	ค่าปรับ		t	2026-04-14 12:30:40.141394	4	1
\.


--
-- Data for Name: revenue_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revenue_methods (id, code, name, description, is_active, created_at) FROM stdin;
1	CASH	เงินสด		t	2026-04-14 12:26:30.428956
2	QRCODE	พร้อมเพย์		t	2026-04-14 12:27:10.982072
\.


--
-- Data for Name: revenue_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revenue_types (id, code, name, description, is_active, created_at, group_id) FROM stdin;
2	RT-002	ค่าจอดรถรายเดือน		t	2026-04-14 12:28:39.903252	1
1	RT-001	ค่าจอดรถรายครั้ง		t	2026-04-14 12:28:21.767944	1
3	RT-003	ค่าปรับ		t	2026-04-14 12:29:40.871916	2
\.


--
-- Data for Name: revenues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revenues (id, site_id, type_id, method_id, receipt_no, license_plate, description, amount, payment_method, payment_status, issued_at, created_at, group_id, visitor_id) FROM stdin;
1	1	1	2	RC-WEB-BWBADH	1กก1111	ชำระค่าจอดรถ (WebPay)	50.00	PROMPTPAY	PAID	2026-04-14 23:40:47.50953	2026-04-14 23:40:47.50953	1	35
2	1	1	2	RC-WEB-FBFIV6	1กก1111	ชำระค่าจอดรถ (WebPay)	50.00	PROMPTPAY	PAID	2026-04-14 23:50:22.806164	2026-04-14 23:50:22.806164	1	35
3	1	1	2	00001202604000001	1กก1111	ชำระค่าจอดรถ (WebPay)	50.00	PROMPTPAY	PAID	2026-04-15 00:21:51.82334	2026-04-15 00:21:51.82334	1	36
5	1	1	2	00001202604000002	1กก1111	ชำระค่าจอดรถ (WebPay)	50.00	PROMPTPAY	PAID	2026-04-15 19:55:07.669392	2026-04-15 19:55:07.669392	1	38
6	1	1	\N	00001202604000003	1กก1111	ชำระค่าจอดรถ (WebPay)	50.00	PROMPTPAY	PAID	2026-04-16 10:36:09.942545	2026-04-16 10:36:09.942545	\N	39
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, permissions, is_active, created_at, site_id) FROM stdin;
1	ผู้จัดการโครงการ		["monitor","sites","residents","vehicles","visitor","parking-fees","revenues","news","users"]	t	2026-04-15 19:12:12.357593	\N
\.


--
-- Data for Name: sites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sites (id, provider_id, name, address, is_active, created_at, max_vehicles, max_residents, lat, lng, contact_link, package_id, package_cycle, package_expires_at) FROM stdin;
3	4	บ้านริมสวน	\N	t	2026-04-12 19:11:26.692559	1	2	13.61837720	100.71587563	\N	4	YEARLY	\N
4	4	เทพนคร	\N	t	2026-04-12 19:30:31.723582	1	2	13.62030398	100.63141291	\N	\N	MONTHLY	\N
1	1	นิรติ บางนา	AAAAA AAAAA AAAAA	t	2026-03-31 19:44:05.325184	3	4	13.65353511	100.66401243	https://intercom.bruda.app:14300/?sn=ONOQE276UTLNXF090I01	4	MONTHLY	2026-04-30 16:59:59.999
\.


--
-- Data for Name: special_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.special_days (id, name, date, is_recurring, description, is_active, created_at, site_id, provider_id) FROM stdin;
1	สงกรานต์	2026-04-13	t	\N	t	2026-04-14 12:10:36.176437	1	1
3	สงกรานต์	2026-04-15	t	\N	t	2026-04-14 12:11:28.665742	1	1
2	สงกรานต์	2026-04-14	t	\N	t	2026-04-14 12:10:48.379733	1	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, password, role, role_id, is_active, created_at, site_id, provider_ids, site_ids, level) FROM stdin;
2	ทดสอบ	ชอบลอง	info@pssgroup.co.th	24dbe3c7a12c3e2b6731d336938bd2eefacf71aa	Admin	\N	t	2026-04-12 18:45:08.400224	\N	[4]	[]	Level1
1	ติณณ์ณชัย	เศรษฐจิรภัทร์	sales@pssgroup.co.th	24dbe3c7a12c3e2b6731d336938bd2eefacf71aa	Admin	\N	t	2026-04-12 18:35:24.403568	\N	[4, 3, 1]	[]	Level1
3	pss	provider	tinnachai.s@gmail.com	24dbe3c7a12c3e2b6731d336938bd2eefacf71aa	Admin	\N	t	2026-04-13 14:13:30.01219	\N	[1]	[]	Level2
4	nirati	bangna	nirati@pssgroup.co.th	24dbe3c7a12c3e2b6731d336938bd2eefacf71aa	ผู้จัดการโครงการ	\N	t	2026-04-15 19:09:49.329555	\N	[1]	[1]	Level3
\.


--
-- Data for Name: vehicle_brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_brands (id, code, name, description, is_active, created_at, site_id) FROM stdin;
1	TYT	Toyota	โตโยต้า	t	2026-04-11 16:40:17.16268	\N
2	HND	Honda	ฮอนด้า	t	2026-04-11 16:40:17.170486	\N
3	ISZ	Isuzu	อีซูซุ	t	2026-04-11 16:40:17.171206	\N
4	NSN	Nissan	นิสสัน	t	2026-04-11 16:40:17.171816	\N
5	MZD	Mazda	มาสด้า	t	2026-04-11 16:40:17.172396	\N
6	MTS	Mitsubishi	มิตซูบิชิ	t	2026-04-11 16:40:17.172966	\N
7	FRD	Ford	ฟอร์ด	t	2026-04-11 16:40:17.173477	\N
8	SZK	Suzuki	ซูซูกิ	t	2026-04-11 16:40:17.173995	\N
9	MG	MG	เอ็มจี	t	2026-04-11 16:40:17.174541	\N
10	BYD	BYD	บีวายดี	t	2026-04-11 16:40:17.175306	\N
11	BMW	BMW	บีเอ็มดับเบิลยู	t	2026-04-11 16:40:17.176215	\N
12	MBZ	Mercedes-Benz	เมอร์เซเดส-เบนซ์	t	2026-04-11 16:40:17.177037	\N
13	TSL	Tesla	เทสลา	t	2026-04-11 16:40:17.177626	\N
14	VLV	Volvo	วอลโว่	t	2026-04-11 16:40:17.178244	\N
\.


--
-- Data for Name: vehicle_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_colors (id, code, name, description, is_active, created_at, site_id) FROM stdin;
\.


--
-- Data for Name: vehicle_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_logs (id, license_plate, vehicle_type, house_number, purpose, lpr_image_url, lpr_confidence, entry_time, exit_time, status, is_resident, updated_at) FROM stdin;
\.


--
-- Data for Name: vehicle_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_types (id, code, name, description, is_active, created_at, site_id, provider_id) FROM stdin;
1	VT-001	รถยนต์	\N	t	2026-03-31 20:39:29.242969	\N	\N
2	VT-002	รถจักรยานยนต์	\N	t	2026-03-31 20:39:37.158733	\N	\N
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, site_id, type_id, park_type_id, license_plate, province, brand, color, owner_name, house_number, is_active, created_at, image_url, resident_id) FROM stdin;
20	1	1	2	จต32	กรุงเทพมหานคร	\N	เทา	\N	333/59	t	2026-04-16 10:23:42.638837	/uploads/vehicles/e572ba0c-02b1-478a-a699-2614dd6be7f8.jpg	23
13	1	1	2	6กธ4464	กรุงเทพมหานคร	\N	บรอนซ์เงิน	Matt	333/57	t	2026-04-12 16:58:57.922121	/uploads/vehicles/dac27d40-47f8-4ea3-84c0-dc5b35d88189.jpg	19
7	1	1	2	6ขท5161	กรุงเทพมหานคร	\N	ดำ	ติณณ์ณชัย	333/56	t	2026-04-11 18:15:08.444265	/uploads/vehicles/a0794ddd-ddd8-4357-89a4-d8db12f2cd58.jpg	10
6	1	1	2	7ขฆ6082	กรุงเทพมหานคร	\N	ขาว	แฟ้ม	333/56	t	2026-04-11 15:50:22.444217	/uploads/vehicles/8236f337-1228-44f2-8a35-92ba4e9d72ac.jpg	12
19	1	1	2	ฒก8534	กรุงเทพมหานคร	\N	บรอนซ์เงิน	\N	333/58	t	2026-04-16 08:38:34.542342	/uploads/vehicles/dba755e3-ab07-416f-8780-02872983b174.jpg	20
\.


--
-- Data for Name: verification_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_codes (id, user_id, email, code, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: visitors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitors (id, id_card_number, full_name, card_type, vehicle_plate, purpose, house_number, check_in_time, check_out_time, status, created_at, site_id, phone_number, invite_token, expected_in_time, image_url, vehicle_province, vehicle_color, provider_id, e_stamp, e_stamp_date) FROM stdin;
25	2222222222222	ทดสอบ	บัตรประชาชน	2กก2222	ส่งพัสดุ	333/56	2026-04-14 16:33:02.898526	2026-04-14 16:37:44.218297	OUT	2026-04-14 16:33:02.898526	\N	\N	\N	\N	\N	กรุงเทพมหานคร	ขาว	4	t	2026-04-14 16:37:18.052388
33	\N	ddddd	ลงทะเบียนล่วงหน้า	กค6769	ddddd	333/56	2026-04-14 23:12:51.946623	2026-04-14 23:15:28.872937	OUT	2026-04-14 23:12:09.271953	\N	0000000000	485accba-e1d2-416a-8b1a-5476a5659b34	2026-04-14 07:00:00	/uploads/vehicles/1b2d33d0-f0e0-4438-8c69-3ec0ca7f5fc4.jpeg	ตราด	ขาว	\N	t	2026-04-14 23:12:51.946623
26	\N	aaaaaa	ลงทะเบียนล่วงหน้า	ฒก8534	ส่งพัสดุ	333/56	2026-04-14 16:41:14.6409	2026-04-14 16:50:44.254315	OUT	2026-04-14 16:39:47.164043	\N	0999999999	64a40996-222b-4270-8862-338de8064d8c	2026-04-14 07:00:00	/uploads/vehicles/b501b87b-131c-43aa-8222-725aac2710f6.webp	กรุงเทพมหานคร	บรอนซ์เงิน	\N	t	2026-04-14 16:41:14.6409
27	33333333333333	dddddddddd	บัตรประชาชน	3กก3333	ส่งพัสดุ	333/56	2026-04-14 16:45:14.629199	2026-04-14 16:56:54.258074	OUT	2026-04-14 16:45:14.629199	1	\N	\N	\N	\N	กรุงเทพมหานคร	ดำ	4	t	2026-04-14 16:56:40.49351
38	1111111111111	nnnnnn	บัตรประชาชน	1กก1111	ส่งพัสดุ	333/56	2026-04-15 19:52:03.520856	2026-04-15 20:03:04.822504	OUT	2026-04-15 19:52:03.520856	1	\N	\N	\N	\N	กรุงเทพมหานคร	ดำ	1	t	2026-04-15 19:55:07.689504
28	4444444444444	gggggg	บัตรประชาชน	4กก4444	ส่งพัสดุ	333/56	2026-04-14 16:57:40.373603	2026-04-14 16:59:29.401771	OUT	2026-04-14 16:57:40.373603	1	\N	\N	\N	\N	กรุงเทพมหานคร	ดำ	4	t	2026-04-14 16:58:20.038306
34	\N	sssds	ลงทะเบียนล่วงหน้า	กค6769	sssss	333/56	2026-04-14 23:17:33.693716	2026-04-14 23:19:53.733917	OUT	2026-04-14 23:16:49.866258	\N	0000000000	796a5d74-d83d-4feb-a86e-c68b30d79e88	2026-04-14 07:00:00	/uploads/vehicles/78707d3a-7925-44e3-bf44-82f58317653d.jpeg	ตราด	ขาว	\N	t	2026-04-14 23:17:33.693716
29	5555555555555	้้้้hhhhhhhh	บัตรประชาชน	5กก55555	ส่งพัสดุ	333/56	2026-04-14 17:12:24.443033	2026-04-14 17:33:02.459751	OUT	2026-04-14 17:12:24.443033	1	\N	\N	\N	\N	กรุงเทพมหานคร	เทา	4	t	2026-04-14 17:30:48.333388
30	1111111111111	cccccc	บัตรประชาชน	1กก1111	ส่งพัสดุ	333/56	2026-04-14 23:03:38.832147	2026-04-14 23:04:16.320586	OUT	2026-04-14 23:03:38.832147	\N	\N	\N	\N	\N	กรุงเทพมหานคร	ขาว	4	t	2026-04-14 23:04:05.43477
24	1111111111111	tester	บัตรประชาชน	1กก1111	ส่งพัสดุ	333/57	2026-04-14 16:31:18.354535	2026-04-14 16:31:57.973426	OUT	2026-04-14 16:31:18.354535	\N	\N	\N	\N	\N	กรุงเทพมหานคร	ขาว	4	f	\N
31	1111111111111	vvvvvv	บัตรประชาชน	1กก1111	ทดสอบ	333/56	2026-04-14 23:06:19.711414	2026-04-14 23:06:52.678987	OUT	2026-04-14 23:06:19.711414	\N	\N	\N	\N	\N	กรุงเทพมหานคร	ขาว	4	t	2026-04-14 23:06:45.712358
35	1111111111111	aaaaa	บัตรประชาชน	1กก1111	aaaaa	333/56	2026-04-14 23:33:33.525845	2026-04-14 23:51:14.969833	OUT	2026-04-14 23:33:33.525845	1	\N	\N	\N	\N	กรุงเทพมหานคร	ขาว	4	t	2026-04-14 23:50:22.834331
32	\N	zzzzz	ลงทะเบียนล่วงหน้า	ฒก8534	zzzzz	333/56	2026-04-14 23:09:04.427551	2026-04-14 23:11:36.702608	OUT	2026-04-14 23:08:22.048356	\N	0000000000	67a99b46-e636-4419-b99f-c9bab7f6ba2b	2026-04-14 07:00:00	/uploads/vehicles/59c64caa-16bf-4b1d-a2df-d3546577fc67.webp	กรุงเทพมหานคร	บรอนซ์เงิน	\N	t	2026-04-14 23:09:04.427551
39	1111111111111	aaaaa	บัตรประชาชน	1กก1111	ทดสอบ	333/59	2026-04-16 10:28:43.536357	2026-04-16 10:37:29.343673	OUT	2026-04-16 10:28:43.536357	1	\N	\N	\N	\N	กรุงเทพมหานคร	ขาว	4	t	2026-04-16 10:36:09.950921
36	1111111111111	qqqqqq	บัตรประชาชน	1กก1111	ทดสอบ	333/56	2026-04-15 00:01:03.944605	2026-04-15 00:33:33.615552	OUT	2026-04-15 00:01:03.944605	1	\N	\N	\N	\N	กรุงเทพมหานคร	ดำ	4	t	2026-04-15 00:33:24.736075
\.


--
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zones (id, site_id, name, description, is_active, created_at) FROM stdin;
1	1	หมู่บ้าน	WWWWW WWWWW WWWWW	t	2026-03-31 20:10:48.284856
\.


--
-- Name: access_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.access_logs_id_seq', 37, true);


--
-- Name: gate_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gate_types_id_seq', 2, true);


--
-- Name: gates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gates_id_seq', 2, true);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_id_seq', 1, true);


--
-- Name: news_reads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_reads_id_seq', 3, true);


--
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.packages_id_seq', 5, true);


--
-- Name: park_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.park_types_id_seq', 3, true);


--
-- Name: parking_discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_discounts_id_seq', 1, false);


--
-- Name: parking_fees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_fees_id_seq', 3, true);


--
-- Name: parking_fines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_fines_id_seq', 2, true);


--
-- Name: provider_revenues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.provider_revenues_id_seq', 13, true);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.providers_id_seq', 4, true);


--
-- Name: residents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.residents_id_seq', 23, true);


--
-- Name: revenue_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.revenue_groups_id_seq', 2, true);


--
-- Name: revenue_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.revenue_methods_id_seq', 2, true);


--
-- Name: revenue_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.revenue_types_id_seq', 3, true);


--
-- Name: revenues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.revenues_id_seq', 6, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, true);


--
-- Name: sites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sites_id_seq', 4, true);


--
-- Name: special_days_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.special_days_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: vehicle_brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_brands_id_seq', 14, true);


--
-- Name: vehicle_colors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_colors_id_seq', 1, false);


--
-- Name: vehicle_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_logs_id_seq', 1, false);


--
-- Name: vehicle_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_types_id_seq', 2, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 20, true);


--
-- Name: verification_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verification_codes_id_seq', 5, true);


--
-- Name: visitors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visitors_id_seq', 39, true);


--
-- Name: zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.zones_id_seq', 1, true);


--
-- Name: access_logs access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_pkey PRIMARY KEY (id);


--
-- Name: gate_types gate_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_types
    ADD CONSTRAINT gate_types_pkey PRIMARY KEY (id);


--
-- Name: gates gates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gates
    ADD CONSTRAINT gates_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: news_reads news_reads_news_id_resident_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_reads
    ADD CONSTRAINT news_reads_news_id_resident_id_key UNIQUE (news_id, resident_id);


--
-- Name: news_reads news_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_reads
    ADD CONSTRAINT news_reads_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: park_types park_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.park_types
    ADD CONSTRAINT park_types_pkey PRIMARY KEY (id);


--
-- Name: parking_discounts parking_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_discounts
    ADD CONSTRAINT parking_discounts_pkey PRIMARY KEY (id);


--
-- Name: parking_fees parking_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_fees
    ADD CONSTRAINT parking_fees_pkey PRIMARY KEY (id);


--
-- Name: parking_fines parking_fines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_fines
    ADD CONSTRAINT parking_fines_pkey PRIMARY KEY (id);


--
-- Name: provider_revenues provider_revenues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_revenues
    ADD CONSTRAINT provider_revenues_pkey PRIMARY KEY (id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: residents residents_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.residents
    ADD CONSTRAINT residents_invite_code_key UNIQUE (invite_code);


--
-- Name: residents residents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.residents
    ADD CONSTRAINT residents_pkey PRIMARY KEY (id);


--
-- Name: revenue_groups revenue_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_groups
    ADD CONSTRAINT revenue_groups_pkey PRIMARY KEY (id);


--
-- Name: revenue_methods revenue_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_methods
    ADD CONSTRAINT revenue_methods_pkey PRIMARY KEY (id);


--
-- Name: revenue_types revenue_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_types
    ADD CONSTRAINT revenue_types_pkey PRIMARY KEY (id);


--
-- Name: revenues revenues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_pkey PRIMARY KEY (id);


--
-- Name: revenues revenues_receipt_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_receipt_no_key UNIQUE (receipt_no);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sites sites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);


--
-- Name: special_days special_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_days
    ADD CONSTRAINT special_days_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_brands vehicle_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_brands
    ADD CONSTRAINT vehicle_brands_pkey PRIMARY KEY (id);


--
-- Name: vehicle_colors vehicle_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_colors
    ADD CONSTRAINT vehicle_colors_pkey PRIMARY KEY (id);


--
-- Name: vehicle_logs vehicle_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_logs
    ADD CONSTRAINT vehicle_logs_pkey PRIMARY KEY (id);


--
-- Name: vehicle_types vehicle_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_types
    ADD CONSTRAINT vehicle_types_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: verification_codes verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_pkey PRIMARY KEY (id);


--
-- Name: visitors visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: gate_types gate_types_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_types
    ADD CONSTRAINT gate_types_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: gates gates_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gates
    ADD CONSTRAINT gates_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: gates gates_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gates
    ADD CONSTRAINT gates_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.gate_types(id) ON DELETE SET NULL;


--
-- Name: gates gates_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gates
    ADD CONSTRAINT gates_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON DELETE CASCADE;


--
-- Name: news_reads news_reads_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_reads
    ADD CONSTRAINT news_reads_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id) ON DELETE CASCADE;


--
-- Name: news_reads news_reads_resident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_reads
    ADD CONSTRAINT news_reads_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.residents(id) ON DELETE CASCADE;


--
-- Name: news news_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: park_types park_types_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.park_types
    ADD CONSTRAINT park_types_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: parking_discounts parking_discounts_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_discounts
    ADD CONSTRAINT parking_discounts_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: parking_fees parking_fees_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_fees
    ADD CONSTRAINT parking_fees_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: parking_fines parking_fines_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_fines
    ADD CONSTRAINT parking_fines_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: provider_revenues provider_revenues_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_revenues
    ADD CONSTRAINT provider_revenues_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE SET NULL;


--
-- Name: provider_revenues provider_revenues_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_revenues
    ADD CONSTRAINT provider_revenues_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: revenues revenues_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.revenue_groups(id) ON DELETE SET NULL;


--
-- Name: revenues revenues_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_method_id_fkey FOREIGN KEY (method_id) REFERENCES public.revenue_methods(id) ON DELETE SET NULL;


--
-- Name: revenues revenues_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: revenues revenues_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.revenue_types(id) ON DELETE SET NULL;


--
-- Name: roles roles_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: sites sites_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE SET NULL;


--
-- Name: sites sites_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: special_days special_days_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_days
    ADD CONSTRAINT special_days_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: users users_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: vehicle_brands vehicle_brands_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_brands
    ADD CONSTRAINT vehicle_brands_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: vehicle_colors vehicle_colors_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_colors
    ADD CONSTRAINT vehicle_colors_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: vehicle_types vehicle_types_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_types
    ADD CONSTRAINT vehicle_types_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: vehicles vehicles_park_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_park_type_id_fkey FOREIGN KEY (park_type_id) REFERENCES public.park_types(id) ON DELETE SET NULL;


--
-- Name: vehicles vehicles_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: vehicles vehicles_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.vehicle_types(id) ON DELETE SET NULL;


--
-- Name: visitors visitors_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: zones zones_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 43vvhELNZTeb9geW3fP9jIB43EpWwYslJtoHVwsy5co5z0ioG92UezKFFl3aCOe

