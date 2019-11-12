--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: custom_functional_message_module_settings; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--


CREATE TABLE custom_functional_message_module_settings (
    id	integer NOT NULL,
    campaign_id	integer NOT NULL,
    tag	character varying NOT NULL,
    tag_code integer NOT NULL,
    msg_type character varying NOT NULL,
    prompt_name character varying NOT NULL,
    start_date timestamp default now(),
    end_date timestamp ,
    is_enabled boolean default false,
    priority integer default 1,
    frequency character varying default 'always',
    date_added timestamp default now(),
    date_modified timestamp default now()
);

ALTER TABLE public.custom_functional_message_module_settings OWNER TO postgres;

--
-- Name: custom_functional_message_module_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE custom_functional_message_module_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.custom_functional_message_module_settings_id_seq OWNER TO postgres;

--
-- Name: custom_functional_message_module_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE custom_functional_message_module_settings_id_seq OWNED BY custom_functional_message_module_settings.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY custom_functional_message_module_settings ALTER COLUMN id SET DEFAULT nextval('custom_functional_message_module_settings_id_seq'::regclass);


--
-- Name: custom_functional_message_module_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY custom_functional_message_module_settings
    ADD CONSTRAINT custom_functional_message_module_settings_pkey PRIMARY KEY (campaign_id,tag_code);


CREATE INDEX ON custom_functional_message_module_settings (id);
CREATE INDEX ON custom_functional_message_module_settings (tag_code);
CREATE INDEX ON custom_functional_message_module_settings (campaign_id);
CREATE INDEX ON custom_functional_message_module_settings (is_enabled);

--
-- PostgreSQL database dump complete
--
