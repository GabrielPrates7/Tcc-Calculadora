--
-- PostgreSQL database dump
--

\restrict ee2AXhnQEa6ucnyx5ajXafa14StvV0lQhlOsTIZjdPfo5AwaJOIlSTeCS3EEOLV

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-08 03:10:38

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
-- TOC entry 5126 (class 0 OID 0)
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
-- TOC entry 5127 (class 0 OID 0)
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
-- TOC entry 5128 (class 0 OID 0)
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
    funcao character varying(100),
    ativo boolean DEFAULT true,
    setor character varying(50) DEFAULT 'producao'::character varying,
    data_admissao date DEFAULT CURRENT_DATE,
    data_inativacao date,
    motivo_inativacao character varying(255)
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
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.funcionarios_id_seq OWNED BY public.funcionarios.id;


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
-- TOC entry 5130 (class 0 OID 0)
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
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 223
-- Name: investimentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.investimentos_id_seq OWNED BY public.investimentos.id;


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
-- TOC entry 5132 (class 0 OID 0)
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
-- TOC entry 5133 (class 0 OID 0)
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
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 231
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.snapshots_financeiros_id_seq OWNED BY public.snapshots_financeiros.id;


--
-- TOC entry 4918 (class 2604 OID 16490)
-- Name: configuracao_producao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao_producao ALTER COLUMN id SET DEFAULT nextval('public.configuracao_producao_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 16438)
-- Name: despesas_fixas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas_fixas ALTER COLUMN id SET DEFAULT nextval('public.despesas_fixas_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 16528)
-- Name: faturamentos_mensais id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais ALTER COLUMN id SET DEFAULT nextval('public.faturamentos_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16410)
-- Name: funcionarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios ALTER COLUMN id SET DEFAULT nextval('public.funcionarios_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 16581)
-- Name: historico_custo_obra id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_custo_obra ALTER COLUMN id SET DEFAULT nextval('public.historico_custo_obra_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 16449)
-- Name: investimentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investimentos ALTER COLUMN id SET DEFAULT nextval('public.investimentos_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 16473)
-- Name: orcamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos ALTER COLUMN id SET DEFAULT nextval('public.orcamentos_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 16594)
-- Name: ordens_servico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico ALTER COLUMN id SET DEFAULT nextval('public.ordens_servico_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 16570)
-- Name: snapshots_financeiros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots_financeiros ALTER COLUMN id SET DEFAULT nextval('public.snapshots_financeiros_id_seq'::regclass);


--
-- TOC entry 5112 (class 0 OID 16487)
-- Dependencies: 228
-- Data for Name: configuracao_producao; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.configuracao_producao VALUES (1, 0, 299, 1, 'horas', 'individual', 3);


--
-- TOC entry 5106 (class 0 OID 16435)
-- Dependencies: 222
-- Data for Name: despesas_fixas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.despesas_fixas VALUES (21, 'Aluguel Fevereiro', 5200.00, '2026-01-19 00:25:54.055729', true, false, '', '2026-02-05', NULL);
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
INSERT INTO public.despesas_fixas VALUES (1, 'Aluguel', 5200.00, '2026-01-01 23:36:07.669449', true, false, '', '2026-01-21', NULL);
INSERT INTO public.despesas_fixas VALUES (23, 'Aluguel', 5200.00, '2026-03-07 23:59:46.582835', true, false, '', '2026-03-07', NULL);
INSERT INTO public.despesas_fixas VALUES (24, 'Caçamba', 960.00, '2026-03-07 23:59:55.646548', true, false, '', '2026-03-07', NULL);
INSERT INTO public.despesas_fixas VALUES (25, 'Cemig', 900.00, '2026-03-08 00:00:05.53592', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (26, 'Combustível', 2000.00, '2026-03-08 00:00:29.798452', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (27, 'Consultoria', 265.00, '2026-03-08 00:00:40.236409', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (28, 'Contador', 500.00, '2026-03-08 00:00:50.627036', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (6, 'Copasa', 80.00, '2026-01-01 23:46:43.09192', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (29, 'Telefone', 85.00, '2026-03-08 00:01:47.405607', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (30, 'Pró-labore', 10000.00, '2026-03-08 00:01:58.437893', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (31, 'Outros', 5000.00, '2026-03-08 00:02:09.387119', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (32, 'Marketing', 1500.00, '2026-03-08 00:02:20.403391', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (33, 'Manutenção Máquinas', 300.00, '2026-03-08 00:02:28.97574', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (34, 'Internet', 110.00, '2026-03-08 00:05:24.49891', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (35, 'IPVA', 375.00, '2026-03-08 00:07:30.64129', true, false, '', '2026-03-08', NULL);
INSERT INTO public.despesas_fixas VALUES (36, 'INSS', 160.00, '2026-03-08 00:08:04.151117', true, false, '', '2026-03-08', NULL);


--
-- TOC entry 5114 (class 0 OID 16525)
-- Dependencies: 230
-- Data for Name: faturamentos_mensais; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.faturamentos_mensais VALUES (1, 2, 2026, 10000.00);
INSERT INTO public.faturamentos_mensais VALUES (4, 1, 2026, 200000.00);
INSERT INTO public.faturamentos_mensais VALUES (2, 3, 2026, 200000.00);


--
-- TOC entry 5104 (class 0 OID 16407)
-- Dependencies: 220
-- Data for Name: funcionarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.funcionarios VALUES (35, 'Flavio Silva', 800.00, 66.67, 22.22, 66.67, 64.00, 25.60, 20.00, 0.00, 1065.16, '2026-01-12 20:43:54.136938', 'Mecanico', false, 'administrativo', '2026-01-12', NULL, NULL);
INSERT INTO public.funcionarios VALUES (38, 'teste', 8888.00, 740.67, 246.89, 740.67, 711.04, 284.42, 9.00, 0.00, 11620.68, '2026-01-12 21:40:41.89995', 'teste', true, 'administrativo', '2026-01-13', NULL, NULL);
INSERT INTO public.funcionarios VALUES (39, 'Jorge', 8777.00, 731.42, 243.81, 731.42, 702.16, 280.86, 77.00, 0.00, 11543.66, '2026-01-12 21:44:06.342947', 'Mec', true, 'administrativo', '2026-01-13', NULL, NULL);
INSERT INTO public.funcionarios VALUES (40, 'Marlon 2', 4000.00, 333.33, 111.11, 333.33, 320.00, 128.00, 40.00, 0.00, 5265.78, '2026-01-12 22:00:17.161761', 'Teste2', true, 'administrativo', '2026-01-13', NULL, NULL);
INSERT INTO public.funcionarios VALUES (42, 'Testee', 23.00, 1.92, 0.64, 1.92, 1.84, 0.74, 0.00, 0.00, 30.05, '2026-01-12 22:27:04.92084', 'Casss', false, 'producao', '2026-01-13', '2026-01-13', 'Pedido de Demissão');
INSERT INTO public.funcionarios VALUES (34, 'Carlossss', 3000.00, 250.00, 83.33, 250.00, 240.00, 96.00, 80.00, 0.00, 3999.33, '2026-01-11 21:28:14.367412', 'Ajudanteee', false, 'administrativo', '2022-01-10', '2022-08-15', 'Demissão sem Justa Causa');
INSERT INTO public.funcionarios VALUES (41, 'Cleber', 1200.00, 100.00, 33.33, 100.00, 96.00, 38.40, 0.00, 0.00, 1567.73, '2026-01-12 22:20:40.175275', 'Dev', false, 'administrativo', '2023-02-01', '2023-11-30', NULL);
INSERT INTO public.funcionarios VALUES (23, 'Marlon', 4000.00, 333.33, 111.11, 333.33, 320.00, 128.00, 40.00, 0.00, 5265.78, '2026-01-09 01:23:42.563801', 'Marceneiro', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (24, 'João Paulo', 2600.00, 216.67, 72.22, 216.67, 208.00, 83.20, 40.00, 0.00, 3436.76, '2026-01-09 01:24:44.851477', 'Teste 2', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (25, 'Guilherme', 1800.00, 150.00, 50.00, 150.00, 144.00, 57.60, 40.00, 0.00, 2391.60, '2026-01-09 01:25:14.836262', 'teste3', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (26, 'Lucas', 2000.00, 166.67, 55.56, 166.67, 160.00, 64.00, 40.00, 0.00, 2652.89, '2026-01-09 01:25:58.232184', 'teste4', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (27, 'Igor', 5000.00, 416.67, 138.89, 416.67, 400.00, 160.00, 40.00, 0.00, 6572.22, '2026-01-09 01:26:25.723156', 'teste5', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (28, 'Everaldo', 2000.00, 166.67, 55.56, 166.67, 160.00, 64.00, 40.00, 0.00, 2652.89, '2026-01-09 01:26:45.430474', 'teste6', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (29, 'Magno', 2500.00, 208.33, 69.44, 208.33, 200.00, 80.00, 40.00, 0.00, 3306.11, '2026-01-09 01:27:15.152459', 'teste7', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (30, 'Fabrício', 4000.00, 333.33, 111.11, 333.33, 320.00, 128.00, 41.00, 0.00, 5266.78, '2026-01-09 01:27:37.611717', 'teste7', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (31, 'Gerivam', 4200.00, 350.00, 116.67, 350.00, 336.00, 134.40, 42.00, 0.00, 5529.07, '2026-01-09 01:28:06.916726', 'teste8', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (33, 'João Fulano', 100.00, 8.33, 2.78, 8.33, 8.00, 3.20, 100.00, 0.00, 230.64, '2026-01-11 21:05:53.095436', 'Marceneiro', false, 'producao', '2020-05-20', '2026-01-11', NULL);
INSERT INTO public.funcionarios VALUES (44, 'Klebson Lopes', 5000.00, 416.67, 138.89, 416.67, 400.00, 160.00, 60.00, 0.00, 6592.22, '2026-01-18 19:41:43.069718', 'Marceneiro 3', true, 'administrativo', '2026-01-18', NULL, NULL);
INSERT INTO public.funcionarios VALUES (37, 'Joao', 440.00, 36.67, 12.22, 36.67, 35.20, 14.08, 50.00, 0.00, 624.84, '2026-01-12 21:32:02.49164', 'Mec', false, 'producao', '2026-01-13', '2026-01-14', 'Demissão sem Justa Causa');
INSERT INTO public.funcionarios VALUES (45, 'Zé inacio', 2800.00, 233.33, 77.78, 233.33, 224.00, 89.60, 20.00, 0.00, 3678.04, '2026-01-21 22:30:47.740702', 'Auxiliar Administrativo', true, 'administrativo', '2026-01-22', NULL, NULL);
INSERT INTO public.funcionarios VALUES (32, 'Diego', 1800.00, 150.00, 50.00, 150.00, 144.00, 57.60, 43.00, 0.00, 2394.60, '2026-01-09 01:28:41.372678', 'teste9', true, 'producao', '2026-01-11', NULL, NULL);
INSERT INTO public.funcionarios VALUES (43, 'Xxxxx', 8000.00, 666.67, 222.22, 666.67, 640.00, 256.00, 99.00, 0.00, 10550.56, '2026-01-12 22:33:03.798948', 'xxxxxx', false, 'producao', '2026-01-13', '2026-01-14', 'Término de Contrato');


--
-- TOC entry 5118 (class 0 OID 16578)
-- Dependencies: 234
-- Data for Name: historico_custo_obra; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.historico_custo_obra VALUES (20, '2026-01-30 02:32:52.53559', 39468.70, '{"tipo": "horas", "tempo": 199, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 2}', 39.67, 'teste2');
INSERT INTO public.historico_custo_obra VALUES (22, '2026-02-05 23:01:04.20666', 39468.70, '{"tipo": "dias", "tempo": 40, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 2}', 197.34, 'Teste 3');
INSERT INTO public.historico_custo_obra VALUES (23, '2026-02-22 21:57:41.756548', 39468.70, '{"tipo": "dias", "tempo": 20, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 2}', 394.69, 'Principal');
INSERT INTO public.historico_custo_obra VALUES (24, '2026-03-07 23:11:12.255426', 39468.70, '{"tipo": "dias", "tempo": 25, "equipes": 5, "organizacao": "grupo", "tamanhoGrupo": 3}', 315.75, 'Teste 4');
INSERT INTO public.historico_custo_obra VALUES (25, '2026-03-07 23:11:40.847193', 39468.70, '{"tipo": "horas", "tempo": 299, "equipes": 1, "organizacao": "individual", "tamanhoGrupo": 3}', 132.00, 'Teste 5');


--
-- TOC entry 5108 (class 0 OID 16446)
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
-- TOC entry 5110 (class 0 OID 16470)
-- Dependencies: 226
-- Data for Name: orcamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orcamentos VALUES (8, 'Mesa', 4000.00, 5.00, 30.00, 5.00, 13.72, 394.69, 1973.45, 11648.13, '2026-03-08 00:48:15.777066', 'Jose');


--
-- TOC entry 5120 (class 0 OID 16591)
-- Dependencies: 236
-- Data for Name: ordens_servico; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.ordens_servico VALUES (1, 8, 'fila', 'pendente', '2026-03-13', '2026-03-08 03:00:53.233136', '2026-03-08 03:02:03.574298');


--
-- TOC entry 5116 (class 0 OID 16567)
-- Dependencies: 232
-- Data for Name: snapshots_financeiros; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.snapshots_financeiros VALUES (2, '2026-01-26 21:45:55.151422', 'Teste', 200000.00, 27435.00, 12350.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (3, '2026-01-26 22:05:57.844724', 'Teste2', 10000.00, 7200.00, 0.00, 72.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');
INSERT INTO public.snapshots_financeiros VALUES (5, '2026-03-08 00:10:19.090715', 'Custo fixo de Março', 200000.00, 27435.00, 0.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 24, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 23, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 28, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 27, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 26, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 25, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}');


--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracao_producao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracao_producao_id_seq', 1, false);


--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 221
-- Name: despesas_fixas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.despesas_fixas_id_seq', 37, true);


--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 229
-- Name: faturamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faturamentos_id_seq', 7, true);


--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.funcionarios_id_seq', 45, true);


--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 233
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historico_custo_obra_id_seq', 25, true);


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 223
-- Name: investimentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.investimentos_id_seq', 12, true);


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 225
-- Name: orcamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orcamentos_id_seq', 9, true);


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 235
-- Name: ordens_servico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordens_servico_id_seq', 1, true);


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 231
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.snapshots_financeiros_id_seq', 5, true);


--
-- TOC entry 4944 (class 2606 OID 16499)
-- Name: configuracao_producao configuracao_producao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao_producao
    ADD CONSTRAINT configuracao_producao_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 16444)
-- Name: despesas_fixas despesas_fixas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas_fixas
    ADD CONSTRAINT despesas_fixas_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 16534)
-- Name: faturamentos_mensais faturamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT faturamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 16423)
-- Name: funcionarios funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 16587)
-- Name: historico_custo_obra historico_custo_obra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_custo_obra
    ADD CONSTRAINT historico_custo_obra_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 16455)
-- Name: investimentos investimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investimentos
    ADD CONSTRAINT investimentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 16482)
-- Name: orcamentos orcamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT orcamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 16602)
-- Name: ordens_servico ordens_servico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 16576)
-- Name: snapshots_financeiros snapshots_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots_financeiros
    ADD CONSTRAINT snapshots_financeiros_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 16536)
-- Name: faturamentos_mensais uq_faturamento_mes_ano; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT uq_faturamento_mes_ano UNIQUE (mes, ano);


--
-- TOC entry 4955 (class 2606 OID 16603)
-- Name: ordens_servico ordens_servico_orcamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES public.orcamentos(id) ON DELETE CASCADE;


-- Completed on 2026-03-08 03:10:38

--
-- PostgreSQL database dump complete
--

\unrestrict ee2AXhnQEa6ucnyx5ajXafa14StvV0lQhlOsTIZjdPfo5AwaJOIlSTeCS3EEOLV

