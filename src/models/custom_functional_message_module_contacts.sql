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
-- Name: custom_functional_message_module_contacts; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--


CREATE TABLE custom_functional_message_module_contacts (
    id	integer NOT NULL,
    phone1	character varying NOT NULL,
    phone2	character varying,
    phone3	character varying,
    cif_no	character varying NOT NULL,
    tag BIGINT NOT NULL,
    date_added	timestamp default now(),
    date_modified	timestamp default now()
);

ALTER TABLE public.custom_functional_message_module_contacts OWNER TO postgres;

--
-- Name: custom_functional_message_module_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE custom_functional_message_module_contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.custom_functional_message_module_contacts_id_seq OWNER TO postgres;

--
-- Name: custom_functional_message_module_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE custom_functional_message_module_contacts_id_seq OWNED BY custom_functional_message_module_contacts.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY custom_functional_message_module_contacts ALTER COLUMN id SET DEFAULT nextval('custom_functional_message_module_contacts_id_seq'::regclass);


--
-- Name: custom_functional_message_module_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY custom_functional_message_module_contacts
    ADD CONSTRAINT custom_functional_message_module_contacts_pkey PRIMARY KEY (cif_no);



CREATE INDEX ON custom_functional_message_module_contacts (id);
CREATE INDEX ON custom_functional_message_module_contacts (tag);
--
-- PostgreSQL database dump complete
--
