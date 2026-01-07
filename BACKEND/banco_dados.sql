--
-- PostgreSQL database dump
--

\restrict Qch9fl0sLQDrsXHbgYvVJvg5iFD8mOh3izlK9C5BaQ4Eo3fjJVIdXLI4TpjLUCW

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-07 00:38:01

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
-- TOC entry 230 (class 1259 OID 16487)
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
-- TOC entry 229 (class 1259 OID 16486)
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
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 229
-- Name: configuracao_producao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracao_producao_id_seq OWNED BY public.configuracao_producao.id;


--
-- TOC entry 224 (class 1259 OID 16435)
-- Name: despesas_fixas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.despesas_fixas (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.despesas_fixas OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16434)
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
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 223
-- Name: despesas_fixas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.despesas_fixas_id_seq OWNED BY public.despesas_fixas.id;


--
-- TOC entry 222 (class 1259 OID 16425)
-- Name: faturamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faturamento (
    id integer NOT NULL,
    valor_mensal numeric(15,2) DEFAULT 0,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.faturamento OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16424)
-- Name: faturamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faturamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faturamento_id_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 221
-- Name: faturamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faturamento_id_seq OWNED BY public.faturamento.id;


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
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.funcionarios_id_seq OWNED BY public.funcionarios.id;


--
-- TOC entry 226 (class 1259 OID 16446)
-- Name: investimentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.investimentos (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.investimentos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16445)
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
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 225
-- Name: investimentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.investimentos_id_seq OWNED BY public.investimentos.id;


--
-- TOC entry 228 (class 1259 OID 16470)
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
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orcamentos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16469)
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
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 227
-- Name: orcamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orcamentos_id_seq OWNED BY public.orcamentos.id;


--
-- TOC entry 4899 (class 2604 OID 16490)
-- Name: configuracao_producao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao_producao ALTER COLUMN id SET DEFAULT nextval('public.configuracao_producao_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 16438)
-- Name: despesas_fixas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas_fixas ALTER COLUMN id SET DEFAULT nextval('public.despesas_fixas_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 16428)
-- Name: faturamento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamento ALTER COLUMN id SET DEFAULT nextval('public.faturamento_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 16410)
-- Name: funcionarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios ALTER COLUMN id SET DEFAULT nextval('public.funcionarios_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 16449)
-- Name: investimentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investimentos ALTER COLUMN id SET DEFAULT nextval('public.investimentos_id_seq'::regclass);


--
-- TOC entry 4897 (class 2604 OID 16473)
-- Name: orcamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos ALTER COLUMN id SET DEFAULT nextval('public.orcamentos_id_seq'::regclass);


--
-- TOC entry 5076 (class 0 OID 16487)
-- Dependencies: 230
-- Data for Name: configuracao_producao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracao_producao (id, dias_trabalhados_mes, horas_trabalhadas_dia, qtd_unidades, tipo_tempo, tipo_organizacao, tamanho_grupo) FROM stdin;
1	0	200	1	horas	individual	2
\.


--
-- TOC entry 5070 (class 0 OID 16435)
-- Dependencies: 224
-- Data for Name: despesas_fixas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.despesas_fixas (id, nome, valor, criado_em) FROM stdin;
1	Aluguel	5200.00	2026-01-01 23:36:07.669449
5	Cemig	900.00	2026-01-01 23:46:31.594272
6	Copasa	80.00	2026-01-01 23:46:43.09192
7	Internet	110.00	2026-01-01 23:46:56.362629
8	Combustível	2000.00	2026-01-01 23:47:06.987629
9	Telefone	85.00	2026-01-01 23:47:19.715439
10	Pró-labore	10000.00	2026-01-01 23:47:30.454392
11	Caçamba	960.00	2026-01-01 23:47:41.303633
12	IPVA	375.00	2026-01-01 23:47:50.521196
13	Manutenção Máquinas	300.00	2026-01-01 23:47:58.595548
14	Contador	500.00	2026-01-01 23:48:10.285192
15	Consultoria	265.00	2026-01-01 23:48:22.247861
16	Marketing	1500.00	2026-01-01 23:48:33.997075
17	INSS	160.00	2026-01-01 23:48:46.409477
18	Outros	5000.00	2026-01-01 23:49:00.638604
\.


--
-- TOC entry 5068 (class 0 OID 16425)
-- Dependencies: 222
-- Data for Name: faturamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faturamento (id, valor_mensal, atualizado_em) FROM stdin;
1	200000.00	2026-01-01 23:36:07.669449
\.


--
-- TOC entry 5066 (class 0 OID 16407)
-- Dependencies: 220
-- Data for Name: funcionarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em) FROM stdin;
8	Marlon	4000.00	333.33	111.11	333.33	320.00	128.00	40.00	0.00	5265.77	2026-01-01 19:30:53.621733
9	João Paulo	2600.00	216.67	72.22	216.67	208.00	83.20	40.00	0.00	3436.76	2026-01-01 19:38:25.017809
10	Guilherme	1800.00	150.00	50.00	150.00	144.00	57.60	40.00	0.00	2391.60	2026-01-02 02:42:31.009323
11	Lucas	2000.00	166.67	55.56	166.67	160.00	64.00	40.00	0.00	2652.90	2026-01-02 02:43:06.364757
12	Igor	5000.00	416.67	138.89	416.67	400.00	160.00	40.00	0.00	6572.23	2026-01-02 02:43:27.352018
13	Everaldo	2000.00	166.67	55.56	166.67	160.00	64.00	40.00	0.00	2652.90	2026-01-02 02:43:48.94085
14	Magno	2500.00	208.33	69.44	208.33	200.00	80.00	40.00	0.00	3306.10	2026-01-02 02:44:10.532766
15	Fabricio	4000.00	333.33	111.11	333.33	320.00	128.00	41.00	0.00	5266.77	2026-01-02 02:44:24.782717
17	Diego	1800.00	150.00	50.00	150.00	144.00	57.60	43.00	0.00	2394.60	2026-01-02 02:44:50.780204
16	Gerivam	4200.00	350.00	116.67	350.00	336.00	134.40	42.00	0.00	5529.07	2026-01-02 02:44:40.503226
\.


--
-- TOC entry 5072 (class 0 OID 16446)
-- Dependencies: 226
-- Data for Name: investimentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.investimentos (id, nome, valor, criado_em) FROM stdin;
1	Serra	1140.00	2026-01-01 23:36:07.669449
2	Coladeira	1000.00	2026-01-01 23:36:07.669449
4	 Serra 	2730.00	2026-01-01 23:49:36.741908
5	 Moto 	250.00	2026-01-01 23:49:47.278831
6	 BDMG 	1130.00	2026-01-01 23:49:56.853213
7	 Saveiro 	1100.00	2026-01-01 23:50:06.337032
\.


--
-- TOC entry 5074 (class 0 OID 16470)
-- Dependencies: 228
-- Data for Name: orcamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em) FROM stdin;
2	Guarda roupas 2	4000.00	5.00	30.00	5.00	13.72	394.69	1973.43	11648.10	2026-01-05 22:51:00.090763
3	Teste	5000.00	5.00	20.00	10.00	13.72	394.69	1973.43	12390.06	2026-01-05 23:02:55.800167
\.


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 229
-- Name: configuracao_producao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracao_producao_id_seq', 1, false);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 223
-- Name: despesas_fixas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.despesas_fixas_id_seq', 18, true);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 221
-- Name: faturamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faturamento_id_seq', 1, true);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.funcionarios_id_seq', 22, true);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 225
-- Name: investimentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.investimentos_id_seq', 10, true);


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 227
-- Name: orcamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orcamentos_id_seq', 4, true);


--
-- TOC entry 4917 (class 2606 OID 16499)
-- Name: configuracao_producao configuracao_producao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao_producao
    ADD CONSTRAINT configuracao_producao_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 16444)
-- Name: despesas_fixas despesas_fixas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas_fixas
    ADD CONSTRAINT despesas_fixas_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 16433)
-- Name: faturamento faturamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturamento
    ADD CONSTRAINT faturamento_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 16423)
-- Name: funcionarios funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 16455)
-- Name: investimentos investimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investimentos
    ADD CONSTRAINT investimentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 16482)
-- Name: orcamentos orcamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT orcamentos_pkey PRIMARY KEY (id);


-- Completed on 2026-01-07 00:38:01

--
-- PostgreSQL database dump complete
--

\unrestrict Qch9fl0sLQDrsXHbgYvVJvg5iFD8mOh3izlK9C5BaQ4Eo3fjJVIdXLI4TpjLUCW

