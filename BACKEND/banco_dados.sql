--
-- PostgreSQL database dump
--

\restrict aUg3bafHJ2KbfDkBJNSs1sNtZv4T03qHLT8k4MRxEREPTrJv0AKXsRSGt4xgizc

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-07-31 20:58:03

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
-- TOC entry 228 (class 1259 OID 16487)
-- Name: configuracao_producao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracao_producao (
    id integer NOT NULL,
    dias_trabalhados_mes integer DEFAULT 22,
    horas_trabalhadas_dia integer DEFAULT 176,
    qtd_unidades integer DEFAULT 1,
    tipo_tempo character varying(10) DEFAULT 'horas'::character varying,
    tipo_organizacao character varying(20) DEFAULT 'individual'::character varying,
    tamanho_grupo integer DEFAULT 1
);


ALTER TABLE public.configuracao_producao OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16486)
-- Name: configuracao_producao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracao_producao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracao_producao_id_seq OWNER TO postgres;

--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracao_producao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracao_producao_id_seq OWNED BY public.configuracao_producao.id;


--
-- TOC entry 222 (class 1259 OID 16435)
-- Name: despesas_fixas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.despesas_fixas (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    valor numeric(15,2) NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ativo boolean DEFAULT true,
    pago boolean DEFAULT false,
    beneficiario character varying(255),
    data_vencimento date,
    data_pagamento date
);


ALTER TABLE public.despesas_fixas OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16434)
-- Name: despesas_fixas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.despesas_fixas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.despesas_fixas_id_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 221
-- Name: despesas_fixas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.despesas_fixas_id_seq OWNED BY public.despesas_fixas.id;


--
-- TOC entry 230 (class 1259 OID 16525)
-- Name: faturamentos_mensais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faturamentos_mensais (
    id integer CONSTRAINT faturamentos_id_not_null NOT NULL,
    mes integer CONSTRAINT faturamentos_mes_not_null NOT NULL,
    ano integer CONSTRAINT faturamentos_ano_not_null NOT NULL,
    valor numeric(10,2) CONSTRAINT faturamentos_valor_not_null NOT NULL
);


ALTER TABLE public.faturamentos_mensais OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16524)
-- Name: faturamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faturamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faturamentos_id_seq OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 229
-- Name: faturamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faturamentos_id_seq OWNED BY public.faturamentos_mensais.id;


--
-- TOC entry 220 (class 1259 OID 16407)
-- Name: funcionarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funcionarios (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    salario_base numeric(10,2) NOT NULL,
    decimo_terceiro numeric(10,2) DEFAULT 0,
    um_terco_ferias numeric(10,2) DEFAULT 0,
    ferias numeric(10,2) DEFAULT 0,
    inss numeric(10,2) DEFAULT 0,
    multa_fgts numeric(10,2) DEFAULT 0,
    epi numeric(10,2) DEFAULT 0,
    outros_gastos numeric(10,2) DEFAULT 0,
    custo_total_mensal numeric(10,2),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ativo boolean DEFAULT true,
    setor character varying(50) DEFAULT 'producao'::character varying,
    data_admissao date DEFAULT CURRENT_DATE,
    data_inativacao date,
    motivo_inativacao character varying(255),
    funcao_id integer NOT NULL
);


ALTER TABLE public.funcionarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16406)
-- Name: funcionarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.funcionarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.funcionarios_id_seq OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.funcionarios_id_seq OWNED BY public.funcionarios.id;


--
-- TOC entry 238 (class 1259 OID 16609)
-- Name: funcoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funcoes (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    base_horas_mensais numeric(5,2) DEFAULT 176.00,
    custo_hora_mercado numeric(10,2) DEFAULT 0.00
);


ALTER TABLE public.funcoes OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16608)
-- Name: funcoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.funcoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.funcoes_id_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 237
-- Name: funcoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.funcoes_id_seq OWNED BY public.funcoes.id;


--
-- TOC entry 234 (class 1259 OID 16578)
-- Name: historico_custo_obra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico_custo_obra (
    id integer NOT NULL,
    data_alteracao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    custo_total_folha numeric(10,2),
    configuracao_usada jsonb,
    valor_unitario_final numeric(10,2),
    titulo character varying(255)
);


ALTER TABLE public.historico_custo_obra OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16577)
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historico_custo_obra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historico_custo_obra_id_seq OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 233
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historico_custo_obra_id_seq OWNED BY public.historico_custo_obra.id;


--
-- TOC entry 224 (class 1259 OID 16446)
-- Name: investimentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.investimentos (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    valor numeric(15,2) NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ativo boolean DEFAULT true,
    pago boolean DEFAULT false,
    beneficiario character varying(255),
    data_vencimento date
);


ALTER TABLE public.investimentos OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16445)
-- Name: investimentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.investimentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.investimentos_id_seq OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 223
-- Name: investimentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.investimentos_id_seq OWNED BY public.investimentos.id;


--
-- TOC entry 242 (class 1259 OID 16971)
-- Name: obra_recursos_humanos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.obra_recursos_humanos (
    id integer NOT NULL,
    obra_id integer NOT NULL,
    funcao_id integer NOT NULL,
    horas_estimadas numeric(10,2) NOT NULL,
    custo_hora_aplicado numeric(10,2) NOT NULL,
    qtd_profissionais integer DEFAULT 1
);


ALTER TABLE public.obra_recursos_humanos OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16970)
-- Name: obra_recursos_humanos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.obra_recursos_humanos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.obra_recursos_humanos_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 241
-- Name: obra_recursos_humanos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.obra_recursos_humanos_id_seq OWNED BY public.obra_recursos_humanos.id;


--
-- TOC entry 240 (class 1259 OID 16956)
-- Name: obras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.obras (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    cliente character varying(255) NOT NULL,
    data_inicio date,
    data_entrega date,
    status character varying(50) DEFAULT 'orcamento'::character varying,
    custo_total_estimado numeric(15,2) DEFAULT 0.00,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_tempo character varying(10) DEFAULT 'horas'::character varying
);


ALTER TABLE public.obras OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16955)
-- Name: obras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.obras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.obras_id_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 239
-- Name: obras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.obras_id_seq OWNED BY public.obras.id;


--
-- TOC entry 226 (class 1259 OID 16470)
-- Name: orcamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orcamentos (
    id integer NOT NULL,
    nome_produto character varying(255) NOT NULL,
    custo_mercadoria numeric(10,2) NOT NULL,
    tempo_gasto numeric(10,2) NOT NULL,
    lucro_desejado_pct numeric(5,2) NOT NULL,
    imposto_pct numeric(5,2) NOT NULL,
    custo_fixo_pct_snapshot numeric(5,2),
    custo_mao_obra_unitario numeric(10,2),
    custo_mao_obra_total numeric(10,2),
    preco_venda numeric(15,2),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cliente character varying(255),
    id_cenario_mo integer
);


ALTER TABLE public.orcamentos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16469)
-- Name: orcamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orcamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orcamentos_id_seq OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 225
-- Name: orcamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orcamentos_id_seq OWNED BY public.orcamentos.id;


--
-- TOC entry 236 (class 1259 OID 16591)
-- Name: ordens_servico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordens_servico (
    id integer NOT NULL,
    orcamento_id integer NOT NULL,
    status_producao character varying(50) DEFAULT 'fila'::character varying,
    status_financeiro character varying(50) DEFAULT 'pendente'::character varying,
    data_entrega date,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ordens_servico OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16590)
-- Name: ordens_servico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordens_servico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordens_servico_id_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 235
-- Name: ordens_servico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordens_servico_id_seq OWNED BY public.ordens_servico.id;


--
-- TOC entry 232 (class 1259 OID 16567)
-- Name: snapshots_financeiros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshots_financeiros (
    id integer NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    descricao character varying(255),
    faturamento numeric(15,2),
    total_despesas numeric(15,2),
    total_investimentos numeric(15,2),
    taxa_custo_fixo numeric(5,2),
    dados_backup jsonb
);


ALTER TABLE public.snapshots_financeiros OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16566)
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.snapshots_financeiros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.snapshots_financeiros_id_seq OWNER TO postgres;

--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 231
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.snapshots_financeiros_id_seq OWNED BY public.snapshots_financeiros.id;


--
-- TOC entry 4933 (class 2604 OID 16490)
-- Name: configuracao_producao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao_producao ALTER COLUMN id SET DEFAULT nextval('public.configuracao_producao_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16438)
-- Name: despesas_fixas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas_fixas ALTER COLUMN id SET DEFAULT nextval('public.despesas_fixas_id_seq'::regclass);


--
-- TOC entry 4940 (class 2604 OID 16528)
-- Name: faturamentos_mensais id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais ALTER COLUMN id SET DEFAULT nextval('public.faturamentos_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 16410)
-- Name: funcionarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios ALTER COLUMN id SET DEFAULT nextval('public.funcionarios_id_seq'::regclass);


--
-- TOC entry 4950 (class 2604 OID 16612)
-- Name: funcoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcoes ALTER COLUMN id SET DEFAULT nextval('public.funcoes_id_seq'::regclass);


--
-- TOC entry 4943 (class 2604 OID 16581)
-- Name: historico_custo_obra id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_custo_obra ALTER COLUMN id SET DEFAULT nextval('public.historico_custo_obra_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 16449)
-- Name: investimentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investimentos ALTER COLUMN id SET DEFAULT nextval('public.investimentos_id_seq'::regclass);


--
-- TOC entry 4958 (class 2604 OID 16974)
-- Name: obra_recursos_humanos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obra_recursos_humanos ALTER COLUMN id SET DEFAULT nextval('public.obra_recursos_humanos_id_seq'::regclass);


--
-- TOC entry 4953 (class 2604 OID 16959)
-- Name: obras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras ALTER COLUMN id SET DEFAULT nextval('public.obras_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 16473)
-- Name: orcamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos ALTER COLUMN id SET DEFAULT nextval('public.orcamentos_id_seq'::regclass);


--
-- TOC entry 4945 (class 2604 OID 16594)
-- Name: ordens_servico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico ALTER COLUMN id SET DEFAULT nextval('public.ordens_servico_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 16570)
-- Name: snapshots_financeiros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots_financeiros ALTER COLUMN id SET DEFAULT nextval('public.snapshots_financeiros_id_seq'::regclass);


--
-- TOC entry 5149 (class 0 OID 16487)
-- Dependencies: 228
-- Data for Name: configuracao_producao; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.configuracao_producao VALUES (1, 20, 0, 5, 'dias', 'grupo', 2);


--
-- TOC entry 5143 (class 0 OID 16435)
-- Dependencies: 222
-- Data for Name: despesas_fixas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.despesas_fixas VALUES (72, 'Cemig', 900.00, '2026-07-26 02:38:23.51563', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (73, 'Copasa', 80.00, '2026-07-26 02:38:42.376788', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (74, 'Internet', 110.00, '2026-07-26 02:39:00.877813', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (71, 'Aluguel', 5200.00, '2026-07-26 02:38:08.266705', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (76, 'Combustível', 2000.00, '2026-07-26 02:40:06.208994', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (77, 'Telefone', 85.00, '2026-07-26 02:40:21.572261', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (78, 'Pró-labore', 10000.00, '2026-07-26 02:41:38.399067', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (80, 'IPVA', 375.00, '2026-07-26 02:42:52.198207', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (81, 'Manutenção Máquinas', 300.00, '2026-07-26 02:43:05.407371', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (82, 'Contador', 500.00, '2026-07-26 02:43:18.527394', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (83, 'Consultoria', 265.00, '2026-07-26 02:43:32.231891', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (84, 'Marketing', 1500.00, '2026-07-26 02:43:59.51408', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (85, 'INSS', 160.00, '2026-07-26 02:44:12.659045', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (86, 'Outros', 5000.00, '2026-07-26 02:44:46.00266', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (87, 'Caçamba', 960.00, '2026-07-26 04:18:08.076148', true, false, NULL, '2026-07-26', NULL);
INSERT INTO public.despesas_fixas VALUES (92, 'Aluguel', 5200.00, '2026-07-30 22:06:38.535723', true, false, NULL, '2026-07-30', NULL);


--
-- TOC entry 5151 (class 0 OID 16525)
-- Dependencies: 230
-- Data for Name: faturamentos_mensais; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.faturamentos_mensais VALUES (1, 2, 2026, 10000.00);
INSERT INTO public.faturamentos_mensais VALUES (4, 1, 2026, 200000.00);
INSERT INTO public.faturamentos_mensais VALUES (2, 3, 2026, 200000.00);
INSERT INTO public.faturamentos_mensais VALUES (8, 5, 2026, 200000.00);
INSERT INTO public.faturamentos_mensais VALUES (13, 8, 2026, 10.00);
INSERT INTO public.faturamentos_mensais VALUES (14, 7, 2026, 200000.00);


--
-- TOC entry 5141 (class 0 OID 16407)
-- Dependencies: 220
-- Data for Name: funcionarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.funcionarios VALUES (53, 'Gabriel Diniz Prates', 2316.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3025.73, '2026-05-03 16:12:52.311056', false, 'administrativo', '2026-05-03', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (63, 'Ana Clara', 2700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3527.40, '2026-07-16 03:53:12.101186', true, 'administrativo', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (65, 'Fernanda Lima', 1900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2482.24, '2026-07-16 03:54:59.418459', true, 'administrativo', '2026-07-16', NULL, NULL, 40);
INSERT INTO public.funcionarios VALUES (67, 'Juliana Costa', 4100.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5356.42, '2026-07-16 03:56:21.595022', true, 'administrativo', '2026-07-16', NULL, NULL, 39);
INSERT INTO public.funcionarios VALUES (69, 'Camila Ribeiro', 4300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5617.71, '2026-07-16 03:57:38.269992', true, 'administrativo', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (73, 'Isabela Nunes', 2800.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3658.04, '2026-07-16 04:00:00.817954', true, 'administrativo', '2026-07-16', NULL, NULL, 39);
INSERT INTO public.funcionarios VALUES (79, 'Matheus Nunes', 2900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3788.69, '2026-07-16 04:03:25.286232', true, 'administrativo', '2026-07-16', NULL, NULL, 42);
INSERT INTO public.funcionarios VALUES (81, 'Aline Batista', 4400.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5748.36, '2026-07-16 11:17:18.653284', true, 'administrativo', '2026-07-16', NULL, NULL, 45);
INSERT INTO public.funcionarios VALUES (83, 'Vanessa Duarte', 2900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3788.69, '2026-07-16 11:18:00.897291', true, 'administrativo', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (85, 'Priscila Andrade', 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3919.33, '2026-07-16 11:19:46.342943', true, 'administrativo', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (87, 'Natália Faria', 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6532.22, '2026-07-16 11:20:18.477742', true, 'administrativo', '2026-07-16', NULL, NULL, 43);
INSERT INTO public.funcionarios VALUES (91, 'Carla Menezes', 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5225.78, '2026-07-16 11:21:57.132219', true, 'administrativo', '2026-07-16', NULL, NULL, 44);
INSERT INTO public.funcionarios VALUES (59, 'João Henrique', 2100.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2743.53, '2026-07-16 03:49:59.761849', false, 'producao', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (75, 'Larissa Mendes', 6200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 8099.96, '2026-07-16 04:01:11.618279', false, 'producao', '2026-07-16', NULL, NULL, 43);
INSERT INTO public.funcionarios VALUES (49, 'Marlom', 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 40.00, 0.00, 5265.78, '2026-05-03 06:19:33.6436', false, 'producao', '2026-05-03', NULL, NULL, 21);
INSERT INTO public.funcionarios VALUES (71, 'Patrícia Fernandes', 5200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6793.51, '2026-07-16 03:58:40.171543', false, 'producao', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (61, 'Pedro Almeida', 3800.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4964.49, '2026-07-16 03:51:17.776828', false, 'producao', '2026-07-16', NULL, NULL, 21);
INSERT INTO public.funcionarios VALUES (89, 'Renata Silveira', 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3266.11, '2026-07-16 11:21:08.419808', false, 'producao', '2026-07-16', NULL, NULL, 40);
INSERT INTO public.funcionarios VALUES (77, 'Vinícius Barbosa', 1850.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2416.92, '2026-07-16 04:02:16.362485', false, 'producao', '2026-07-16', NULL, NULL, 31);
INSERT INTO public.funcionarios VALUES (93, 'João Paulo', 2600.00, 216.67, 72.22, 216.67, 208.00, 83.20, 40.00, 0.00, 3436.76, '2026-07-16 13:58:21.437243', true, 'producao', '2026-07-16', NULL, NULL, 21);
INSERT INTO public.funcionarios VALUES (95, 'Igor', 5000.00, 416.67, 138.89, 416.67, 400.00, 160.00, 40.00, 0.00, 6572.23, '2026-07-16 13:59:15.671907', true, 'producao', '2026-07-16', NULL, NULL, 22);
INSERT INTO public.funcionarios VALUES (97, 'Magno', 2500.00, 208.33, 69.44, 208.33, 200.00, 80.00, 40.00, 0.00, 3306.10, '2026-07-16 14:00:33.8445', true, 'producao', '2026-07-16', NULL, NULL, 22);
INSERT INTO public.funcionarios VALUES (99, 'Lucas', 2000.00, 166.67, 55.56, 166.67, 160.00, 64.00, 40.00, 0.00, 2652.90, '2026-07-16 14:01:25.474051', true, 'producao', '2026-07-16', NULL, NULL, 23);
INSERT INTO public.funcionarios VALUES (101, 'Diego', 1800.00, 150.00, 50.00, 150.00, 144.00, 57.60, 40.00, 0.00, 2391.60, '2026-07-16 14:02:13.340376', true, 'producao', '2026-07-16', NULL, NULL, 23);
INSERT INTO public.funcionarios VALUES (92, 'Marlon', 4000.00, 333.33, 111.11, 333.33, 320.00, 128.00, 40.00, 0.00, 5265.77, '2026-07-16 13:57:23.01808', true, 'producao', '2026-07-16', NULL, NULL, 21);
INSERT INTO public.funcionarios VALUES (94, 'Fabrício', 4000.00, 333.33, 111.11, 333.33, 320.00, 128.00, 41.00, 0.00, 5266.77, '2026-07-16 13:58:48.62396', true, 'producao', '2026-07-16', NULL, NULL, 21);
INSERT INTO public.funcionarios VALUES (96, 'Gerivam', 4200.00, 350.00, 116.67, 350.00, 336.00, 134.40, 42.00, 0.00, 5529.07, '2026-07-16 14:00:09.000228', true, 'producao', '2026-07-16', NULL, NULL, 22);
INSERT INTO public.funcionarios VALUES (98, 'Guilherme', 1800.00, 150.00, 50.00, 150.00, 144.00, 57.60, 43.00, 0.00, 2394.60, '2026-07-16 14:01:00.591394', true, 'producao', '2026-07-16', NULL, NULL, 23);
INSERT INTO public.funcionarios VALUES (100, 'Everaldo', 2000.00, 166.67, 55.56, 166.67, 160.00, 64.00, 40.00, 0.00, 2652.90, '2026-07-16 14:01:52.912223', true, 'producao', '2026-07-16', NULL, NULL, 23);
INSERT INTO public.funcionarios VALUES (82, 'Daniel Pereira', 3300.00, 275.00, 91.67, 275.00, 264.00, 105.60, 0.00, 0.00, 4311.27, '2026-07-16 11:17:41.253356', false, 'producao', '2026-07-16', '2026-07-21', 'Falecimento', 22);
INSERT INTO public.funcionarios VALUES (60, 'Mariana Souza', 4500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5879.00, '2026-07-16 03:50:53.849538', true, 'administrativo', '2026-07-16', NULL, NULL, 39);
INSERT INTO public.funcionarios VALUES (70, 'Felipe Santos', 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3266.11, '2026-07-16 03:58:09.866428', true, 'administrativo', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (80, 'Ricardo Menezes', 7200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 9406.40, '2026-07-16 11:16:47.985797', true, 'administrativo', '2026-07-16', NULL, NULL, 44);
INSERT INTO public.funcionarios VALUES (88, 'André Luiz', 1600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2090.31, '2026-07-16 11:20:38.281599', true, 'administrativo', '2026-07-16', NULL, NULL, 40);
INSERT INTO public.funcionarios VALUES (78, 'Beatriz Moreira', 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6532.22, '2026-07-16 04:02:33.765423', true, 'administrativo', '2026-07-16', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (68, 'Bruno Oliveira', 2600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3396.76, '2026-07-16 03:57:08.295813', false, 'producao', '2026-07-16', NULL, NULL, 42);
INSERT INTO public.funcionarios VALUES (72, 'Eduardo Rocha', 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5225.78, '2026-07-16 03:59:04.138017', false, 'producao', '2026-07-16', NULL, NULL, 41);
INSERT INTO public.funcionarios VALUES (66, 'Gustavo Martins', 3700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4833.84, '2026-07-16 03:55:30.942378', false, 'producao', '2026-07-16', NULL, NULL, 41);
INSERT INTO public.funcionarios VALUES (84, 'Henrique Azevedo', 4500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5879.00, '2026-07-16 11:19:29.226645', false, 'producao', '2026-07-16', NULL, NULL, 21);
INSERT INTO public.funcionarios VALUES (90, 'Leonardo Pires', 3600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4703.20, '2026-07-16 11:21:21.869711', false, 'producao', '2026-07-16', NULL, NULL, 22);
INSERT INTO public.funcionarios VALUES (58, 'Lionel Messi', 1200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 20.00, 0.00, 1587.73, '2026-07-16 01:34:47.072669', false, 'producao', '2026-07-16', NULL, NULL, 31);
INSERT INTO public.funcionarios VALUES (62, 'Lucas Ferreira', 2900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3788.69, '2026-07-16 03:51:42.835655', false, 'producao', '2026-07-16', NULL, NULL, 31);
INSERT INTO public.funcionarios VALUES (86, 'Marcelo Teixeira', 2000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2612.89, '2026-07-16 11:20:04.801825', false, 'producao', '2026-07-16', NULL, NULL, 23);
INSERT INTO public.funcionarios VALUES (74, 'Matheus Carvalho', 2750.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3592.72, '2026-07-16 04:00:32.129516', false, 'producao', '2026-07-16', NULL, NULL, 23);
INSERT INTO public.funcionarios VALUES (64, 'Rafael Gomes', 5600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 7316.09, '2026-07-16 03:54:03.226357', false, 'producao', '2026-07-16', NULL, NULL, 23);
INSERT INTO public.funcionarios VALUES (76, 'Thiago Lopes', 5500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 7185.44, '2026-07-16 04:01:55.736675', false, 'producao', '2026-07-16', NULL, NULL, 21);
INSERT INTO public.funcionarios VALUES (45, 'Zé inacio', 2800.00, 233.33, 77.78, 233.33, 224.00, 89.60, 20.00, 0.00, 3678.04, '2026-01-21 22:30:47.740702', true, 'administrativo', '2026-01-22', NULL, NULL, 12);
INSERT INTO public.funcionarios VALUES (33, 'João Fulano', 100.00, 8.33, 2.78, 8.33, 8.00, 3.20, 100.00, 0.00, 238.64, '2026-01-11 21:05:53.095436', false, 'producao', '2020-05-20', '2026-01-11', NULL, 60);


--
-- TOC entry 5159 (class 0 OID 16609)
-- Dependencies: 238
-- Data for Name: funcoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.funcoes VALUES (12, 'Auxiliar Administrativo', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (21, 'Mecânico', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (22, 'Torneiro', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (23, 'Pintor', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (31, 'Soldador TIG', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (39, 'Analista Financeiro', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (40, 'Recepcionista', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (41, 'Eletricista Industrial', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (42, 'Operador de Máquina', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (43, 'Coordenadora de RH', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (44, 'Gerente Administrativo', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (45, 'Analista de Compras', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (60, 'Marceneiro', 176.00, 0.00);


--
-- TOC entry 5155 (class 0 OID 16578)
-- Dependencies: 234
-- Data for Name: historico_custo_obra; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.historico_custo_obra VALUES (2, '2026-07-29 19:29:43.644464', 119965.66, '{"dias": 22, "tipo": "horas", "horasDia": 8}', 150.00, 'Base Teste Injetada');
INSERT INTO public.historico_custo_obra VALUES (3, '2026-07-29 19:36:03.447011', 39468.70, '{"dias": 22, "horas_dia": 8, "tipo_tempo": "horas", "qtd_unidades": 1}', 224.25, 'Custo Padrão Produção (Inicial)');


--
-- TOC entry 5145 (class 0 OID 16446)
-- Dependencies: 224
-- Data for Name: investimentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.investimentos VALUES (16, 'Serra', 1140.00, '2026-07-26 02:45:43.692669', true, false, NULL, '2026-07-26');
INSERT INTO public.investimentos VALUES (17, 'Serra 2', 2730.00, '2026-07-26 02:46:07.482603', true, false, NULL, '2026-07-26');
INSERT INTO public.investimentos VALUES (18, 'Coladeira', 1000.00, '2026-07-26 02:46:35.349619', true, false, NULL, '2026-07-26');
INSERT INTO public.investimentos VALUES (19, 'Moto', 250.00, '2026-07-26 02:46:53.431226', true, false, NULL, '2026-07-26');
INSERT INTO public.investimentos VALUES (20, 'BDMG', 1130.00, '2026-07-26 02:47:18.535743', true, false, NULL, '2026-07-26');
INSERT INTO public.investimentos VALUES (21, 'Saveiro', 1100.00, '2026-07-26 02:47:34.618458', true, false, NULL, '2026-07-26');


--
-- TOC entry 5163 (class 0 OID 16971)
-- Dependencies: 242
-- Data for Name: obra_recursos_humanos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.obra_recursos_humanos VALUES (109, 14, 21, 30.00, 26.46, 6);
INSERT INTO public.obra_recursos_humanos VALUES (110, 14, 22, 12.00, 29.18, 3);
INSERT INTO public.obra_recursos_humanos VALUES (111, 13, 21, 20.00, 26.46, 2);
INSERT INTO public.obra_recursos_humanos VALUES (112, 13, 22, 1.00, 29.18, 1);
INSERT INTO public.obra_recursos_humanos VALUES (113, 13, 23, 10.00, 14.34, 2);
INSERT INTO public.obra_recursos_humanos VALUES (114, 15, 40, 15.00, 12.99, 3);
INSERT INTO public.obra_recursos_humanos VALUES (115, 16, 23, 4.00, 14.34, 1);
INSERT INTO public.obra_recursos_humanos VALUES (116, 16, 22, 10.00, 29.18, 1);
INSERT INTO public.obra_recursos_humanos VALUES (117, 16, 21, 36.00, 26.46, 2);
INSERT INTO public.obra_recursos_humanos VALUES (118, 17, 23, 32.00, 14.34, 2);
INSERT INTO public.obra_recursos_humanos VALUES (119, 17, 21, 24.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (120, 18, 21, 28.00, 26.46, 2);
INSERT INTO public.obra_recursos_humanos VALUES (121, 18, 22, 12.00, 29.18, 1);
INSERT INTO public.obra_recursos_humanos VALUES (122, 19, 21, 120.00, 26.46, 3);
INSERT INTO public.obra_recursos_humanos VALUES (123, 19, 23, 32.00, 14.34, 2);
INSERT INTO public.obra_recursos_humanos VALUES (126, 21, 21, 44.00, 26.46, 2);
INSERT INTO public.obra_recursos_humanos VALUES (127, 21, 22, 40.00, 29.18, 2);
INSERT INTO public.obra_recursos_humanos VALUES (128, 21, 23, 6.00, 14.34, 1);
INSERT INTO public.obra_recursos_humanos VALUES (129, 22, 21, 16.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (130, 22, 23, 32.00, 14.34, 2);
INSERT INTO public.obra_recursos_humanos VALUES (131, 23, 22, 8.00, 29.18, 1);
INSERT INTO public.obra_recursos_humanos VALUES (132, 23, 21, 45.00, 26.46, 3);
INSERT INTO public.obra_recursos_humanos VALUES (135, 25, 21, 64.00, 26.46, 2);
INSERT INTO public.obra_recursos_humanos VALUES (136, 25, 22, 24.00, 29.18, 1);
INSERT INTO public.obra_recursos_humanos VALUES (137, 25, 23, 8.00, 14.34, 1);
INSERT INTO public.obra_recursos_humanos VALUES (138, 26, 21, 5.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (139, 27, 21, 40.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (140, 20, 23, 20.00, 14.34, 2);
INSERT INTO public.obra_recursos_humanos VALUES (141, 20, 21, 16.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (142, 24, 21, 45.00, 26.46, 3);
INSERT INTO public.obra_recursos_humanos VALUES (143, 24, 22, 8.00, 29.18, 1);


--
-- TOC entry 5161 (class 0 OID 16956)
-- Dependencies: 240
-- Data for Name: obras; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.obras VALUES (25, '10-Fabricação de Cavaletes Industriais', 'Indústria Aliança Equipamentos', NULL, NULL, 'orcamento', 2508.27, '2026-07-29 00:51:47.048929', 'dias');
INSERT INTO public.obras VALUES (26, '11- Teste 11', 'teste', NULL, NULL, 'orcamento', 132.29, '2026-07-30 22:07:07.730356', 'horas');
INSERT INTO public.obras VALUES (27, '12-teste ', 'teste', NULL, NULL, 'orcamento', 1058.28, '2026-07-30 22:07:25.719723', 'dias');
INSERT INTO public.obras VALUES (20, '05-Cozinha Planejada Completa', 'Móveis Elegance Planejados', NULL, NULL, 'orcamento', 710.02, '2026-07-29 00:18:24.69783', 'horas');
INSERT INTO public.obras VALUES (24, '09-Balcão de Atendimento Planejado', 'Clínica Odonto Prime', NULL, NULL, 'orcamento', 1424.01, '2026-07-29 00:51:03.288948', 'horas');
INSERT INTO public.obras VALUES (14, 'Segundo teste', 'teste', NULL, NULL, 'orcamento', 1143.88, '2026-07-26 12:25:14.732725', 'horas');
INSERT INTO public.obras VALUES (13, 'Primeiro testeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'Fulano', NULL, NULL, 'orcamento', 701.67, '2026-07-26 02:53:16.87667', 'horas');
INSERT INTO public.obras VALUES (15, 'Terceiro teste', 'Ciclano', NULL, NULL, 'orcamento', 194.85, '2026-07-26 20:25:56.658848', 'horas');
INSERT INTO public.obras VALUES (16, '01-Fabricação de Base para Prensa Hidráulica', 'Indústria Metal Forte Ltda', NULL, NULL, 'orcamento', 1301.60, '2026-07-29 00:14:07.20738', 'horas');
INSERT INTO public.obras VALUES (17, '02-Armário Planejado em MDF para Escritório', 'Marcenaria Carvalho Design', NULL, NULL, 'orcamento', 1093.70, '2026-07-29 00:15:01.838361', 'dias');
INSERT INTO public.obras VALUES (18, '03-Recuperação de Eixo de Transmissão', 'AgroMáquinas Cerrado', NULL, NULL, 'orcamento', 1090.96, '2026-07-29 00:15:43.334601', 'horas');
INSERT INTO public.obras VALUES (19, '04-Estrutura Metálica para Mezanino', 'Construtora Horizonte', NULL, NULL, 'orcamento', 3633.57, '2026-07-29 00:17:21.897679', 'dias');
INSERT INTO public.obras VALUES (21, '06-Fabricação de Suportes Industriais', 'Siderúrgica Alfa', NULL, NULL, 'orcamento', 2417.35, '2026-07-29 00:49:09.049023', 'horas');
INSERT INTO public.obras VALUES (22, '07-Painel Ripado com Nichos e Iluminação', 'Hotel Serra Azul', NULL, NULL, 'orcamento', 882.04, '2026-07-29 00:49:44.930421', 'dias');
INSERT INTO public.obras VALUES (23, '08-Reparo em Tambor Transportador', 'Mineração Vale Verde', NULL, NULL, 'orcamento', 1424.01, '2026-07-29 00:50:37.402042', 'dias');


--
-- TOC entry 5147 (class 0 OID 16470)
-- Dependencies: 226
-- Data for Name: orcamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orcamentos VALUES (1, 'Peça mecanica', 3000.00, 1.00, 30.00, 5.00, 13.72, 905.94, 905.94, 7616.89, '2026-07-26 20:41:33.881934', 'Fulano', NULL);


--
-- TOC entry 5157 (class 0 OID 16591)
-- Dependencies: 236
-- Data for Name: ordens_servico; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5153 (class 0 OID 16567)
-- Dependencies: 232
-- Data for Name: snapshots_financeiros; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.snapshots_financeiros VALUES (2, '2026-01-26 21:45:55.151422', 'Teste', 200000.00, 27435.00, 12350.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (3, '2026-01-26 22:05:57.844724', 'Teste2', 10000.00, 7200.00, 0.00, 72.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (5, '2026-03-08 00:10:19.090715', 'Custo fixo de Março', 200000.00, 27435.00, 0.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 24, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 23, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 28, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 27, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 26, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 25, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (6, '2026-04-26 19:12:59.543368', 'Teste 26 de abril', 0.00, 49.98, 0.00, 0.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5210, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 24, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 23, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 28, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 27, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 26, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 25, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 38, "nome": "Teste", "pago": false, "ativo": true, "valor": 49.98, "beneficiario": "teste", "dataVencimento": "2026-04-26T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (7, '2026-07-23 23:24:12.415821', 'Teste', 100.00, 14.00, 15.00, 14.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5210, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 53, "nome": "Copasa Maio", "pago": false, "ativo": true, "valor": 80, "beneficiario": "Copasa ", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 52, "nome": "Telefone Maio", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 51, "nome": "Pró-labore Maio", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 50, "nome": "Outros Maio", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 49, "nome": "Marketing Maio", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 48, "nome": "Manutenção Máquinas Maio", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 47, "nome": "IPVA Maio", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 46, "nome": "Internet Maio", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 45, "nome": "INSS Maio", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 44, "nome": "Contador Maio", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 43, "nome": "Consultoria Maio", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 42, "nome": "Combustível Maio", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 41, "nome": "Cemig Maio", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 40, "nome": "Caçamba Maio", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 39, "nome": "Aluguel Maio", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 61, "nome": "8", "pago": false, "ativo": true, "valor": 2, "beneficiario": "8", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 60, "nome": "7", "pago": false, "ativo": true, "valor": 2, "beneficiario": "7", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 59, "nome": "6", "pago": false, "ativo": true, "valor": 2, "beneficiario": "6", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 58, "nome": "5", "pago": false, "ativo": true, "valor": 2, "beneficiario": "5", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 57, "nome": "4", "pago": false, "ativo": true, "valor": 2, "beneficiario": "4", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 55, "nome": "Teste 2", "pago": false, "ativo": true, "valor": 2, "beneficiario": "", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 54, "nome": "Teste", "pago": false, "ativo": true, "valor": 2, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 13, "nome": "Teste", "pago": false, "ativo": true, "valor": 15, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (8, '2026-07-23 23:42:38.96694', 'Teste 1', 0.00, 0.00, 0.00, 0.00, '{"despesas": [], "investimentos": []}');
INSERT INTO public.snapshots_financeiros VALUES (9, '2026-07-23 23:44:23.728804', 'teste 2', 0.00, 0.00, 0.00, 0.00, '{"despesas": [], "investimentos": []}');
INSERT INTO public.snapshots_financeiros VALUES (11, '2026-07-23 23:57:20.056496', 'teste 3', 100.00, NULL, NULL, NULL, NULL);
INSERT INTO public.snapshots_financeiros VALUES (12, '2026-07-24 00:02:12.226487', 'teste 4', 100.00, NULL, NULL, NULL, NULL);
INSERT INTO public.snapshots_financeiros VALUES (13, '2026-07-24 00:14:22.071167', '6', 100.00, 14.00, 15.00, 14.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5210, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 53, "nome": "Copasa Maio", "pago": false, "ativo": true, "valor": 80, "beneficiario": "Copasa ", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 52, "nome": "Telefone Maio", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 51, "nome": "Pró-labore Maio", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 50, "nome": "Outros Maio", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 49, "nome": "Marketing Maio", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 48, "nome": "Manutenção Máquinas Maio", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 47, "nome": "IPVA Maio", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 46, "nome": "Internet Maio", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 45, "nome": "INSS Maio", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 44, "nome": "Contador Maio", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 43, "nome": "Consultoria Maio", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 42, "nome": "Combustível Maio", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 41, "nome": "Cemig Maio", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 40, "nome": "Caçamba Maio", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 39, "nome": "Aluguel Maio", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 61, "nome": "8", "pago": false, "ativo": true, "valor": 2, "beneficiario": "8", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 60, "nome": "7", "pago": false, "ativo": true, "valor": 2, "beneficiario": "7", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 59, "nome": "6", "pago": false, "ativo": true, "valor": 2, "beneficiario": "6", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 58, "nome": "5", "pago": false, "ativo": true, "valor": 2, "beneficiario": "5", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 57, "nome": "4", "pago": false, "ativo": true, "valor": 2, "beneficiario": "4", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 55, "nome": "Teste 2", "pago": false, "ativo": true, "valor": 2, "beneficiario": "", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 54, "nome": "Teste", "pago": false, "ativo": true, "valor": 2, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 13, "nome": "Teste", "pago": false, "ativo": true, "valor": 15, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (14, '2026-07-26 12:34:56.920171', 'Correção de Arredondamento', 10000.00, 1372.00, 0.00, 13.72, '{}');


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracao_producao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracao_producao_id_seq', 1, false);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 221
-- Name: despesas_fixas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.despesas_fixas_id_seq', 92, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 229
-- Name: faturamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faturamentos_id_seq', 15, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.funcionarios_id_seq', 101, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 237
-- Name: funcoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.funcoes_id_seq', 61, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 233
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historico_custo_obra_id_seq', 3, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 223
-- Name: investimentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.investimentos_id_seq', 21, true);


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 241
-- Name: obra_recursos_humanos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obra_recursos_humanos_id_seq', 143, true);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 239
-- Name: obras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obras_id_seq', 27, true);


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 225
-- Name: orcamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orcamentos_id_seq', 1, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 235
-- Name: ordens_servico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordens_servico_id_seq', 1, false);


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 231
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.snapshots_financeiros_id_seq', 14, true);


--
-- TOC entry 4969 (class 2606 OID 16499)
-- Name: configuracao_producao configuracao_producao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao_producao
    ADD CONSTRAINT configuracao_producao_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 16444)
-- Name: despesas_fixas despesas_fixas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas_fixas
    ADD CONSTRAINT despesas_fixas_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 16534)
-- Name: faturamentos_mensais faturamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT faturamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 16423)
-- Name: funcionarios funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 16618)
-- Name: funcoes funcoes_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcoes
    ADD CONSTRAINT funcoes_nome_key UNIQUE (nome);


--
-- TOC entry 4983 (class 2606 OID 16616)
-- Name: funcoes funcoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcoes
    ADD CONSTRAINT funcoes_pkey PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 16587)
-- Name: historico_custo_obra historico_custo_obra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_custo_obra
    ADD CONSTRAINT historico_custo_obra_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 16455)
-- Name: investimentos investimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investimentos
    ADD CONSTRAINT investimentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 16981)
-- Name: obra_recursos_humanos obra_recursos_humanos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT obra_recursos_humanos_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 16969)
-- Name: obras obras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 16482)
-- Name: orcamentos orcamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT orcamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 16602)
-- Name: ordens_servico ordens_servico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 16576)
-- Name: snapshots_financeiros snapshots_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots_financeiros
    ADD CONSTRAINT snapshots_financeiros_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 16536)
-- Name: faturamentos_mensais uq_faturamento_mes_ano; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT uq_faturamento_mes_ano UNIQUE (mes, ano);


--
-- TOC entry 4991 (class 2606 OID 16987)
-- Name: obra_recursos_humanos fk_funcao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT fk_funcao FOREIGN KEY (funcao_id) REFERENCES public.funcoes(id) ON DELETE RESTRICT;


--
-- TOC entry 4988 (class 2606 OID 16619)
-- Name: funcionarios fk_funcionario_funcao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT fk_funcionario_funcao FOREIGN KEY (funcao_id) REFERENCES public.funcoes(id) ON DELETE RESTRICT;


--
-- TOC entry 4992 (class 2606 OID 16982)
-- Name: obra_recursos_humanos fk_obra; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT fk_obra FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;


--
-- TOC entry 4989 (class 2606 OID 16995)
-- Name: orcamentos fk_orcamento_cenario_mo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT fk_orcamento_cenario_mo FOREIGN KEY (id_cenario_mo) REFERENCES public.historico_custo_obra(id) ON DELETE SET NULL;


--
-- TOC entry 4990 (class 2606 OID 16603)
-- Name: ordens_servico ordens_servico_orcamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES public.orcamentos(id) ON DELETE CASCADE;


-- Completed on 2026-07-31 20:58:03

--
-- PostgreSQL database dump complete
--

\unrestrict aUg3bafHJ2KbfDkBJNSs1sNtZv4T03qHLT8k4MRxEREPTrJv0AKXsRSGt4xgizc

