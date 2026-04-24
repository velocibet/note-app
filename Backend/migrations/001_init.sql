--
-- PostgreSQL database dump
--

-- \restrict 1EVv3WFI7143bpJkQ4guIMvUBh2PeVEo2wFl7pkVKEHQdgS1ING7zMP5LxjtPtH

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modified_column() OWNER TO postgres;

--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: email_hash; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_hash (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    email text NOT NULL
);


ALTER TABLE public.email_hash OWNER TO postgres;

--
-- Name: email_hash_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_hash_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_hash_id_seq OWNER TO postgres;

--
-- Name: email_hash_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_hash_id_seq OWNED BY public.email_hash.id;


--
-- Name: user_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notes (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    title text NOT NULL,
    content text CONSTRAINT user_notes_encrypted_content_not_null NOT NULL,
    iv character varying(32) NOT NULL,
    tags text,
    is_pinned boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_notes OWNER TO postgres;

--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    user_id character varying(26) NOT NULL,
    theme character varying(20) DEFAULT 'light'::character varying,
    language character varying(10) DEFAULT 'ko'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(26) NOT NULL,
    username character varying(50) NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vault_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vault_keys (
    id character varying(26) NOT NULL,
    vault_key_salt text NOT NULL,
    encrypted_vault_key text NOT NULL,
    vault_key_iv text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vault_keys OWNER TO postgres;

--
-- Name: email_hash id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_hash ALTER COLUMN id SET DEFAULT nextval('public.email_hash_id_seq'::regclass);


--
-- Name: email_hash email_hash_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_hash
    ADD CONSTRAINT email_hash_pkey PRIMARY KEY (id);


--
-- Name: user_notes user_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id);


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
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vault_keys vault_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vault_keys
    ADD CONSTRAINT vault_keys_pkey PRIMARY KEY (id);


--
-- Name: idx_notes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_user_id ON public.user_notes USING btree (user_id);


--
-- Name: vault_keys update_vault_keys_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_vault_keys_updated_at BEFORE UPDATE ON public.vault_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_notes fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_settings fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

-- \unrestrict 1EVv3WFI7143bpJkQ4guIMvUBh2PeVEo2wFl7pkVKEHQdgS1ING7zMP5LxjtPtH

