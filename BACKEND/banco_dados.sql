--
-- PostgreSQL database dump
--

\restrict 4gOCMFF420tNfLYhAPojlMZyiZvoQcNPf8qtwTCnZtWaWbuNtZ5rVxDarWXDDLu

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-07-22 21:44:33

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
-- TOC entry 5167 (class 0 OID 0)
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
    valor numeric(10,2) NOT NULL,
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
-- TOC entry 5168 (class 0 OID 0)
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
-- TOC entry 5169 (class 0 OID 0)
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
-- TOC entry 5170 (class 0 OID 0)
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
-- TOC entry 5171 (class 0 OID 0)
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
-- TOC entry 5172 (class 0 OID 0)
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
    valor numeric(10,2) NOT NULL,
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
-- TOC entry 5173 (class 0 OID 0)
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
-- TOC entry 5174 (class 0 OID 0)
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
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 5175 (class 0 OID 0)
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
    cliente character varying(255)
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
-- TOC entry 5176 (class 0 OID 0)
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
-- TOC entry 5177 (class 0 OID 0)
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
-- TOC entry 5178 (class 0 OID 0)
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
-- TOC entry 4957 (class 2604 OID 16974)
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
-- TOC entry 5147 (class 0 OID 16487)
-- Dependencies: 228
-- Data for Name: configuracao_producao; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.configuracao_producao VALUES (1, 20, 0, 5, 'dias', 'grupo', 2);


--
-- TOC entry 5141 (class 0 OID 16435)
-- Dependencies: 222
-- Data for Name: despesas_fixas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.despesas_fixas VALUES (11, 'Caçamba', 960.00, '2026-01-01 23:47:41.303633', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (5, 'Cemig', 900.00, '2026-01-01 23:46:31.594272', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (8, 'Combustível', 2000.00, '2026-01-01 23:47:06.987629', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (14, 'Contador', 500.00, '2026-01-01 23:48:10.285192', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (15, 'Consultoria', 265.00, '2026-01-01 23:48:22.247861', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (9, 'Telefone', 85.00, '2026-01-01 23:47:19.715439', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (10, 'Pró-labore', 10000.00, '2026-01-01 23:47:30.454392', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (18, 'Outros', 5000.00, '2026-01-01 23:49:00.638604', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (16, 'Marketing', 1500.00, '2026-01-01 23:48:33.997075', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (13, 'Manutenção Máquinas', 300.00, '2026-01-01 23:47:58.595548', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (12, 'IPVA', 375.00, '2026-01-01 23:47:50.521196', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (7, 'Internet', 110.00, '2026-01-01 23:46:56.362629', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (17, 'INSS', 160.00, '2026-01-01 23:48:46.409477', true, false, '', '2026-01-05', NULL);
INSERT INTO public.despesas_fixas VALUES (22, 'Combustível', 2000.00, '2026-01-21 23:30:36.329418', true, false, '', '2026-02-06', NULL);
INSERT INTO public.despesas_fixas VALUES (29, 'Telefone', 85.00, '2026-03-08 00:01:47.405607', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (30, 'Pró-labore', 10000.00, '2026-03-08 00:01:58.437893', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (31, 'Outros', 5000.00, '2026-03-08 00:02:09.387119', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (32, 'Marketing', 1500.00, '2026-03-08 00:02:20.403391', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (33, 'Manutenção Máquinas', 300.00, '2026-03-08 00:02:28.97574', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (34, 'Internet', 110.00, '2026-03-08 00:05:24.49891', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (35, 'IPVA', 375.00, '2026-03-08 00:07:30.64129', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (36, 'INSS', 160.00, '2026-03-08 00:08:04.151117', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (21, 'Aluguel Fevereiro', 5210.00, '2026-01-19 00:25:54.055729', true, false, '', '2026-02-05', NULL);
INSERT INTO public.despesas_fixas VALUES (1, 'Aluguel', 5200.00, '2026-01-01 23:36:07.669449', true, false, '', '2026-01-21', NULL);
INSERT INTO public.despesas_fixas VALUES (39, 'Aluguel Maio', 5200.00, '2026-04-27 21:03:43.672941', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (40, 'Caçamba Maio', 960.00, '2026-04-27 21:04:15.226508', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (41, 'Cemig Maio', 900.00, '2026-04-27 21:05:00.311872', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (42, 'Combustível Maio', 2000.00, '2026-04-27 21:05:10.952861', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (43, 'Consultoria Maio', 265.00, '2026-04-27 21:05:55.815473', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (44, 'Contador Maio', 500.00, '2026-04-27 21:06:07.192909', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (45, 'INSS Maio', 160.00, '2026-04-27 21:06:24.353921', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (46, 'Internet Maio', 110.00, '2026-04-27 21:06:36.654777', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (47, 'IPVA Maio', 375.00, '2026-04-27 21:06:46.002507', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (48, 'Manutenção Máquinas Maio', 300.00, '2026-04-27 21:06:56.511207', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (50, 'Outros Maio', 5000.00, '2026-04-27 21:07:28.802947', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (51, 'Pró-labore Maio', 10000.00, '2026-04-27 21:07:39.643532', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (52, 'Telefone Maio', 85.00, '2026-04-27 21:07:48.945452', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (49, 'Marketing Maio', 1500.00, '2026-04-27 21:07:15.465063', true, false, '', '2026-05-05', NULL);
INSERT INTO public.despesas_fixas VALUES (53, 'Copasa Maio', 80.00, '2026-04-28 21:00:57.995273', true, false, 'Copasa ', '2026-05-05', NULL);


--
-- TOC entry 5149 (class 0 OID 16525)
-- Dependencies: 230
-- Data for Name: faturamentos_mensais; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.faturamentos_mensais VALUES (1, 2, 2026, 10000.00);
INSERT INTO public.faturamentos_mensais VALUES (4, 1, 2026, 200000.00);
INSERT INTO public.faturamentos_mensais VALUES (2, 3, 2026, 200000.00);
INSERT INTO public.faturamentos_mensais VALUES (8, 5, 2026, 200000.00);


--
-- TOC entry 5139 (class 0 OID 16407)
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
-- TOC entry 5157 (class 0 OID 16609)
-- Dependencies: 238
-- Data for Name: funcoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.funcoes VALUES (12, 'Auxiliar Administrativo', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (21, 'Mecânico', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (22, 'Torneiro', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (23, 'Pintor', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (29, 'teste', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (31, 'Soldador TIG', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (35, 'Teste', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (39, 'Analista Financeiro', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (40, 'Recepcionista', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (41, 'Eletricista Industrial', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (42, 'Operador de Máquina', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (43, 'Coordenadora de RH', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (44, 'Gerente Administrativo', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (45, 'Analista de Compras', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (46, 'Ajudanteee', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (47, 'Marceneiro 3', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (48, 'Teste 2', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (49, 'Teste2', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (50, 'teste7', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (51, 'teste4', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (53, 'teste6', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (54, 'teste9', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (56, 'teste3', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (57, 'teste5', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (58, 'teste8', 176.00, 0.00);
INSERT INTO public.funcoes VALUES (60, 'Marceneiro', 176.00, 0.00);


--
-- TOC entry 5153 (class 0 OID 16578)
-- Dependencies: 234
-- Data for Name: historico_custo_obra; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.historico_custo_obra VALUES (26, '2026-03-09 21:22:22.377748', 39468.70, '{"tipo": "dias", "tempo": 20, "equipes": 1, "organizacao": "grupo", "tamanhoGrupo": 4}', 1973.44, 'Cliente wander');
INSERT INTO public.historico_custo_obra VALUES (20, '2026-01-30 02:32:52.53559', 39468.70, '{"tipo": "horas", "tempo": 199, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 2}', 39.67, 'teste2');
INSERT INTO public.historico_custo_obra VALUES (22, '2026-02-05 23:01:04.20666', 39468.70, '{"tipo": "dias", "tempo": 40, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 2}', 197.34, 'Teste 3');
INSERT INTO public.historico_custo_obra VALUES (23, '2026-02-22 21:57:41.756548', 39468.70, '{"tipo": "dias", "tempo": 20, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 2}', 394.69, 'Principal');
INSERT INTO public.historico_custo_obra VALUES (24, '2026-03-07 23:11:12.255426', 39468.70, '{"tipo": "dias", "tempo": 25, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 3}', 315.75, 'Teste 4');
INSERT INTO public.historico_custo_obra VALUES (25, '2026-03-07 23:11:40.847193', 39468.70, '{"tipo": "horas", "tempo": 299, "equipes": 1, "organizacao": "individual", "tamanhoGrupo": 3}', 132.00, 'Teste 5');


--
-- TOC entry 5143 (class 0 OID 16446)
-- Dependencies: 224
-- Data for Name: investimentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.investimentos VALUES (4, ' Serra ', 2730.00, '2026-01-01 23:49:36.741908', true, false, '', '2026-01-21');
INSERT INTO public.investimentos VALUES (2, 'Coladeira', 1000.00, '2026-01-01 23:36:07.669449', true, false, '', '2026-01-21');
INSERT INTO public.investimentos VALUES (1, 'Serra', 1140.00, '2026-01-01 23:36:07.669449', true, false, '', '2026-01-21');
INSERT INTO public.investimentos VALUES (11, 'Compra de Maquinário', 5000.00, '2026-01-09 02:01:56.413547', true, false, '', '2026-01-21');
INSERT INTO public.investimentos VALUES (6, ' BDMG ', 1130.00, '2026-01-01 23:49:56.853213', true, false, '', '2026-01-21');
INSERT INTO public.investimentos VALUES (5, ' Moto ', 250.00, '2026-01-01 23:49:47.278831', true, false, '', '2026-01-21');
INSERT INTO public.investimentos VALUES (7, ' Saveiro ', 1100.00, '2026-01-01 23:50:06.337032', true, false, '', '2026-01-21');


--
-- TOC entry 5161 (class 0 OID 16971)
-- Dependencies: 242
-- Data for Name: obra_recursos_humanos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.obra_recursos_humanos VALUES (1, 1, 22, 8.00, 29.18, 1);
INSERT INTO public.obra_recursos_humanos VALUES (2, 1, 21, 20.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (3, 1, 23, 10.00, 14.34, 1);
INSERT INTO public.obra_recursos_humanos VALUES (4, 2, 21, 20.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (5, 3, 21, 1.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (6, 4, 21, 2.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (7, 5, 21, 1.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (9, 7, 21, 1.00, 26.46, 1);
INSERT INTO public.obra_recursos_humanos VALUES (11, 9, 23, 1.00, 14.34, 1);
INSERT INTO public.obra_recursos_humanos VALUES (12, 10, 23, 1.00, 14.34, 1);
INSERT INTO public.obra_recursos_humanos VALUES (16, 12, 21, 54.00, 26.46, 3);
INSERT INTO public.obra_recursos_humanos VALUES (17, 12, 22, 36.00, 29.18, 3);
INSERT INTO public.obra_recursos_humanos VALUES (18, 12, 23, 28.00, 14.34, 4);


--
-- TOC entry 5159 (class 0 OID 16956)
-- Dependencies: 240
-- Data for Name: obras; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.obras VALUES (1, 'Teste', 'Fulano', NULL, NULL, 'orcamento', 905.94, '2026-07-20 21:26:13.860776');
INSERT INTO public.obras VALUES (2, 'teste2', 'teste2', NULL, NULL, 'orcamento', 529.14, '2026-07-21 00:08:10.237234');
INSERT INTO public.obras VALUES (3, 'teste3', '3', NULL, NULL, 'orcamento', 26.46, '2026-07-21 00:21:19.04704');
INSERT INTO public.obras VALUES (4, '4', '4', NULL, NULL, 'orcamento', 52.91, '2026-07-21 00:21:32.012363');
INSERT INTO public.obras VALUES (5, '5', '5', NULL, NULL, 'orcamento', 26.46, '2026-07-21 00:21:58.854235');
INSERT INTO public.obras VALUES (7, '7', '7', NULL, NULL, 'orcamento', 26.46, '2026-07-21 00:22:22.829877');
INSERT INTO public.obras VALUES (9, '9', '9', NULL, NULL, 'orcamento', 14.34, '2026-07-21 00:22:50.609539');
INSERT INTO public.obras VALUES (10, '10', '10', NULL, NULL, 'orcamento', 14.34, '2026-07-21 00:32:36.164557');
INSERT INTO public.obras VALUES (12, 'Teste 22/07', 'Cliente', NULL, NULL, 'orcamento', 2880.57, '2026-07-22 21:32:49.550317');


--
-- TOC entry 5145 (class 0 OID 16470)
-- Dependencies: 226
-- Data for Name: orcamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orcamentos VALUES (8, 'Mesa', 4000.00, 5.00, 30.00, 5.00, 13.72, 394.69, 1973.45, 11648.13, '2026-03-08 00:48:15.777066', 'Jose');
INSERT INTO public.orcamentos VALUES (10, 'Geladeira', 3000.00, 110.00, 30.00, 5.00, 13.72, 132.00, 14520.00, 34163.70, '2026-03-08 23:56:25.437529', 'Cleber');
INSERT INTO public.orcamentos VALUES (11, 'teste', 4000.00, 5.00, 30.00, 5.00, 9.27, 394.69, 1973.45, 10718.28, '2026-04-28 21:09:33.244653', 'Teste');
INSERT INTO public.orcamentos VALUES (12, 'Guarda roupa', 4000.00, 5.00, 30.00, 5.00, 13.72, 394.69, 1973.45, 11648.13, '2026-04-30 22:19:50.644914', 'Fabiano');


--
-- TOC entry 5155 (class 0 OID 16591)
-- Dependencies: 236
-- Data for Name: ordens_servico; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.ordens_servico VALUES (1, 8, 'producao', 'pendente', '2026-03-13', '2026-03-08 03:00:53.233136', '2026-04-28 20:54:26.843625');
INSERT INTO public.ordens_servico VALUES (2, 10, 'pausado', 'pago', '2026-03-15', '2026-03-08 23:56:38.42245', '2026-04-28 20:54:28.355473');
INSERT INTO public.ordens_servico VALUES (4, 12, 'pronto', 'sinal_pago', '2026-05-09', '2026-04-30 22:20:15.475618', '2026-04-30 22:20:41.762708');
INSERT INTO public.ordens_servico VALUES (3, 11, 'fila', 'pendente', '2026-05-02', '2026-04-28 21:16:16.937928', '2026-04-30 22:27:05.341895');


--
-- TOC entry 5151 (class 0 OID 16567)
-- Dependencies: 232
-- Data for Name: snapshots_financeiros; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.snapshots_financeiros VALUES (2, '2026-01-26 21:45:55.151422', 'Teste', 200000.00, 27435.00, 12350.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (3, '2026-01-26 22:05:57.844724', 'Teste2', 10000.00, 7200.00, 0.00, 72.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (5, '2026-03-08 00:10:19.090715', 'Custo fixo de Março', 200000.00, 27435.00, 0.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 24, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 23, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 28, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 27, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 26, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 25, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (6, '2026-04-26 19:12:59.543368', 'Teste 26 de abril', 0.00, 49.98, 0.00, 0.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5210, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 24, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 23, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 28, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 27, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 26, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 25, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 38, "nome": "Teste", "pago": false, "ativo": true, "valor": 49.98, "beneficiario": "teste", "dataVencimento": "2026-04-26T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracao_producao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracao_producao_id_seq', 1, false);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 221
-- Name: despesas_fixas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.despesas_fixas_id_seq', 53, true);


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 229
-- Name: faturamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faturamentos_id_seq', 11, true);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.funcionarios_id_seq', 101, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 237
-- Name: funcoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.funcoes_id_seq', 61, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 233
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historico_custo_obra_id_seq', 26, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 223
-- Name: investimentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.investimentos_id_seq', 12, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 241
-- Name: obra_recursos_humanos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obra_recursos_humanos_id_seq', 18, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 239
-- Name: obras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obras_id_seq', 12, true);


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 225
-- Name: orcamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orcamentos_id_seq', 12, true);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 235
-- Name: ordens_servico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordens_servico_id_seq', 4, true);


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 231
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.snapshots_financeiros_id_seq', 6, true);


--
-- TOC entry 4968 (class 2606 OID 16499)
-- Name: configuracao_producao configuracao_producao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao_producao
    ADD CONSTRAINT configuracao_producao_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 16444)
-- Name: despesas_fixas despesas_fixas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas_fixas
    ADD CONSTRAINT despesas_fixas_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 16534)
-- Name: faturamentos_mensais faturamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT faturamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 16423)
-- Name: funcionarios funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 16618)
-- Name: funcoes funcoes_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcoes
    ADD CONSTRAINT funcoes_nome_key UNIQUE (nome);


--
-- TOC entry 4982 (class 2606 OID 16616)
-- Name: funcoes funcoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcoes
    ADD CONSTRAINT funcoes_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 16587)
-- Name: historico_custo_obra historico_custo_obra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_custo_obra
    ADD CONSTRAINT historico_custo_obra_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 16455)
-- Name: investimentos investimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investimentos
    ADD CONSTRAINT investimentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 16981)
-- Name: obra_recursos_humanos obra_recursos_humanos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT obra_recursos_humanos_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 16969)
-- Name: obras obras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 16482)
-- Name: orcamentos orcamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT orcamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 16602)
-- Name: ordens_servico ordens_servico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 16576)
-- Name: snapshots_financeiros snapshots_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots_financeiros
    ADD CONSTRAINT snapshots_financeiros_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 16536)
-- Name: faturamentos_mensais uq_faturamento_mes_ano; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT uq_faturamento_mes_ano UNIQUE (mes, ano);


--
-- TOC entry 4989 (class 2606 OID 16987)
-- Name: obra_recursos_humanos fk_funcao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT fk_funcao FOREIGN KEY (funcao_id) REFERENCES public.funcoes(id) ON DELETE RESTRICT;


--
-- TOC entry 4987 (class 2606 OID 16619)
-- Name: funcionarios fk_funcionario_funcao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT fk_funcionario_funcao FOREIGN KEY (funcao_id) REFERENCES public.funcoes(id) ON DELETE RESTRICT;


--
-- TOC entry 4990 (class 2606 OID 16982)
-- Name: obra_recursos_humanos fk_obra; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT fk_obra FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 16603)
-- Name: ordens_servico ordens_servico_orcamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES public.orcamentos(id) ON DELETE CASCADE;


-- Completed on 2026-07-22 21:44:34

--
-- PostgreSQL database dump complete
--

\unrestrict 4gOCMFF420tNfLYhAPojlMZyiZvoQcNPf8qtwTCnZtWaWbuNtZ5rVxDarWXDDLu

