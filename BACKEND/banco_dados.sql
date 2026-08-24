--
-- PostgreSQL database dump
--



-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-08-23 20:17:33

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
-- Name: configuracao_producao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracao_producao (
    id integer NOT NULL,
    dias_trabalhados_mes integer DEFAULT 22,
    horas_trabalhadas_dia integer DEFAULT 176,
    qtd_unidades integer DEFAULT 1,
    tipo_tempo character varying(10) DEFAULT 'horas'::character varying,
    tipo_organizacao character varying(20) DEFAULT 'individual'::character varying,
    tamanho_grupo integer DEFAULT 1,
    empresa_id integer NOT NULL,
    margem_lucro_padrao numeric(5,2) DEFAULT 30.00,
    imposto_padrao numeric(5,2) DEFAULT 5.00
);


--
-- TOC entry 227 (class 1259 OID 16486)
-- Name: configuracao_producao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracao_producao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracao_producao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracao_producao_id_seq OWNED BY public.configuracao_producao.id;


--
-- TOC entry 222 (class 1259 OID 16435)
-- Name: despesas_fixas; Type: TABLE; Schema: public; Owner: -
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
    data_pagamento date,
    empresa_id integer NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16434)
-- Name: despesas_fixas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.despesas_fixas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 221
-- Name: despesas_fixas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.despesas_fixas_id_seq OWNED BY public.despesas_fixas.id;


--
-- TOC entry 246 (class 1259 OID 17051)
-- Name: empresas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresas (
    id integer NOT NULL,
    nome_fantasia character varying(255) NOT NULL,
    cnpj character varying(20),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 245 (class 1259 OID 17050)
-- Name: empresas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.empresas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 245
-- Name: empresas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.empresas_id_seq OWNED BY public.empresas.id;


--
-- TOC entry 230 (class 1259 OID 16525)
-- Name: faturamentos_mensais; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faturamentos_mensais (
    id integer CONSTRAINT faturamentos_id_not_null NOT NULL,
    mes integer CONSTRAINT faturamentos_mes_not_null NOT NULL,
    ano integer CONSTRAINT faturamentos_ano_not_null NOT NULL,
    valor numeric(10,2) CONSTRAINT faturamentos_valor_not_null NOT NULL,
    empresa_id integer NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 16524)
-- Name: faturamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faturamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 229
-- Name: faturamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faturamentos_id_seq OWNED BY public.faturamentos_mensais.id;


--
-- TOC entry 220 (class 1259 OID 16407)
-- Name: funcionarios; Type: TABLE; Schema: public; Owner: -
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
    funcao_id integer NOT NULL,
    empresa_id integer NOT NULL,
    custo_hora numeric(10,2) DEFAULT 0.00
);


--
-- TOC entry 219 (class 1259 OID 16406)
-- Name: funcionarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.funcionarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.funcionarios_id_seq OWNED BY public.funcionarios.id;


--
-- TOC entry 238 (class 1259 OID 16609)
-- Name: funcoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funcoes (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    base_horas_mensais numeric(5,2) DEFAULT 176.00,
    custo_hora_mercado numeric(10,2) DEFAULT 0.00,
    empresa_id integer NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 16608)
-- Name: funcoes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.funcoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 237
-- Name: funcoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.funcoes_id_seq OWNED BY public.funcoes.id;


--
-- TOC entry 234 (class 1259 OID 16578)
-- Name: historico_custo_obra; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historico_custo_obra (
    id integer NOT NULL,
    data_alteracao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    custo_total_folha numeric(10,2),
    configuracao_usada jsonb,
    valor_unitario_final numeric(10,2),
    titulo character varying(255),
    empresa_id integer NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 16577)
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historico_custo_obra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 233
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historico_custo_obra_id_seq OWNED BY public.historico_custo_obra.id;


--
-- TOC entry 224 (class 1259 OID 16446)
-- Name: investimentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investimentos (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    valor numeric(15,2) NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ativo boolean DEFAULT true,
    pago boolean DEFAULT false,
    beneficiario character varying(255),
    data_vencimento date,
    empresa_id integer NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16445)
-- Name: investimentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investimentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 223
-- Name: investimentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investimentos_id_seq OWNED BY public.investimentos.id;


--
-- TOC entry 242 (class 1259 OID 16971)
-- Name: obra_recursos_humanos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obra_recursos_humanos (
    id integer NOT NULL,
    obra_id integer NOT NULL,
    funcao_id integer NOT NULL,
    horas_estimadas numeric(10,2) NOT NULL,
    custo_hora_aplicado numeric(10,2) NOT NULL,
    qtd_profissionais integer DEFAULT 1,
    unidade_tempo character varying(10) DEFAULT 'horas'::character varying,
    empresa_id integer NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 16970)
-- Name: obra_recursos_humanos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.obra_recursos_humanos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 241
-- Name: obra_recursos_humanos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.obra_recursos_humanos_id_seq OWNED BY public.obra_recursos_humanos.id;


--
-- TOC entry 240 (class 1259 OID 16956)
-- Name: obras; Type: TABLE; Schema: public; Owner: -
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
    tipo_tempo character varying(10) DEFAULT 'horas'::character varying,
    empresa_id integer NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 16955)
-- Name: obras_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.obras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 239
-- Name: obras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.obras_id_seq OWNED BY public.obras.id;


--
-- TOC entry 226 (class 1259 OID 16470)
-- Name: orcamentos; Type: TABLE; Schema: public; Owner: -
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
    id_cenario_mo integer,
    empresa_id integer NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 16469)
-- Name: orcamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orcamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 225
-- Name: orcamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orcamentos_id_seq OWNED BY public.orcamentos.id;


--
-- TOC entry 236 (class 1259 OID 16591)
-- Name: ordens_servico; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ordens_servico (
    id integer NOT NULL,
    orcamento_id integer NOT NULL,
    status_producao character varying(50) DEFAULT 'fila'::character varying,
    status_financeiro character varying(50) DEFAULT 'pendente'::character varying,
    data_entrega date,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    responsaveis_execucao character varying(255),
    observacoes text,
    laudo_tecnico text,
    custo_extra_materiais numeric(10,2) DEFAULT 0.00,
    descricao_materiais_extras text,
    data_finalizacao date,
    data_entregue date,
    observacoes_cliente text,
    empresa_id integer NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 16590)
-- Name: ordens_servico_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ordens_servico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 235
-- Name: ordens_servico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ordens_servico_id_seq OWNED BY public.ordens_servico.id;


--
-- TOC entry 244 (class 1259 OID 17031)
-- Name: pagamentos_os; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagamentos_os (
    id integer NOT NULL,
    os_id integer,
    valor numeric(10,2) NOT NULL,
    forma_pagamento character varying(50) NOT NULL,
    data_pagamento date DEFAULT CURRENT_DATE NOT NULL,
    registrado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    empresa_id integer NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 17030)
-- Name: pagamentos_os_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagamentos_os_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 243
-- Name: pagamentos_os_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagamentos_os_id_seq OWNED BY public.pagamentos_os.id;


--
-- TOC entry 232 (class 1259 OID 16567)
-- Name: snapshots_financeiros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.snapshots_financeiros (
    id integer NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    descricao character varying(255),
    faturamento numeric(15,2),
    total_despesas numeric(15,2),
    total_investimentos numeric(15,2),
    taxa_custo_fixo numeric(5,2),
    dados_backup jsonb,
    empresa_id integer NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 16566)
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.snapshots_financeiros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 231
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.snapshots_financeiros_id_seq OWNED BY public.snapshots_financeiros.id;


--
-- TOC entry 250 (class 1259 OID 17172)
-- Name: solicitacoes_alteracao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitacoes_alteracao (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    empresa_id integer NOT NULL,
    tipo_alteracao character varying(50) NOT NULL,
    dados_antigos jsonb NOT NULL,
    dados_novos jsonb NOT NULL,
    status character varying(20) DEFAULT 'PENDENTE'::character varying,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    analisado_em timestamp without time zone
);


--
-- TOC entry 249 (class 1259 OID 17171)
-- Name: solicitacoes_alteracao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitacoes_alteracao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 249
-- Name: solicitacoes_alteracao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitacoes_alteracao_id_seq OWNED BY public.solicitacoes_alteracao.id;


--
-- TOC entry 248 (class 1259 OID 17063)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    empresa_id integer NOT NULL,
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    token_recuperacao character varying(255),
    expiracao_token timestamp without time zone,
    ativo boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    super_admin boolean DEFAULT false NOT NULL
);


--
-- TOC entry 247 (class 1259 OID 17062)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 247
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4954 (class 2604 OID 16490)
-- Name: configuracao_producao id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracao_producao ALTER COLUMN id SET DEFAULT nextval('public.configuracao_producao_id_seq'::regclass);


--
-- TOC entry 4944 (class 2604 OID 16438)
-- Name: despesas_fixas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despesas_fixas ALTER COLUMN id SET DEFAULT nextval('public.despesas_fixas_id_seq'::regclass);


--
-- TOC entry 4988 (class 2604 OID 17054)
-- Name: empresas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas ALTER COLUMN id SET DEFAULT nextval('public.empresas_id_seq'::regclass);


--
-- TOC entry 4963 (class 2604 OID 16528)
-- Name: faturamentos_mensais id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturamentos_mensais ALTER COLUMN id SET DEFAULT nextval('public.faturamentos_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 16410)
-- Name: funcionarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionarios ALTER COLUMN id SET DEFAULT nextval('public.funcionarios_id_seq'::regclass);


--
-- TOC entry 4974 (class 2604 OID 16612)
-- Name: funcoes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcoes ALTER COLUMN id SET DEFAULT nextval('public.funcoes_id_seq'::regclass);


--
-- TOC entry 4966 (class 2604 OID 16581)
-- Name: historico_custo_obra id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_custo_obra ALTER COLUMN id SET DEFAULT nextval('public.historico_custo_obra_id_seq'::regclass);


--
-- TOC entry 4948 (class 2604 OID 16449)
-- Name: investimentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investimentos ALTER COLUMN id SET DEFAULT nextval('public.investimentos_id_seq'::regclass);


--
-- TOC entry 4982 (class 2604 OID 16974)
-- Name: obra_recursos_humanos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obra_recursos_humanos ALTER COLUMN id SET DEFAULT nextval('public.obra_recursos_humanos_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 16959)
-- Name: obras id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obras ALTER COLUMN id SET DEFAULT nextval('public.obras_id_seq'::regclass);


--
-- TOC entry 4952 (class 2604 OID 16473)
-- Name: orcamentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orcamentos ALTER COLUMN id SET DEFAULT nextval('public.orcamentos_id_seq'::regclass);


--
-- TOC entry 4968 (class 2604 OID 16594)
-- Name: ordens_servico id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordens_servico ALTER COLUMN id SET DEFAULT nextval('public.ordens_servico_id_seq'::regclass);


--
-- TOC entry 4985 (class 2604 OID 17034)
-- Name: pagamentos_os id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamentos_os ALTER COLUMN id SET DEFAULT nextval('public.pagamentos_os_id_seq'::regclass);


--
-- TOC entry 4964 (class 2604 OID 16570)
-- Name: snapshots_financeiros id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshots_financeiros ALTER COLUMN id SET DEFAULT nextval('public.snapshots_financeiros_id_seq'::regclass);


--
-- TOC entry 4994 (class 2604 OID 17175)
-- Name: solicitacoes_alteracao id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes_alteracao ALTER COLUMN id SET DEFAULT nextval('public.solicitacoes_alteracao_id_seq'::regclass);


--
-- TOC entry 4990 (class 2604 OID 17066)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5222 (class 0 OID 16487)
-- Dependencies: 228
-- Data for Name: configuracao_producao; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.configuracao_producao (id, dias_trabalhados_mes, horas_trabalhadas_dia, qtd_unidades, tipo_tempo, tipo_organizacao, tamanho_grupo, empresa_id, margem_lucro_padrao, imposto_padrao) VALUES (2, 20, 178, 1, 'horas', 'individual', 1, 5, 30.00, 5.00);
INSERT INTO public.configuracao_producao (id, dias_trabalhados_mes, horas_trabalhadas_dia, qtd_unidades, tipo_tempo, tipo_organizacao, tamanho_grupo, empresa_id, margem_lucro_padrao, imposto_padrao) VALUES (1, 22, 176, 5, 'dias', 'grupo', 2, 4, 40.00, 5.00);


--
-- TOC entry 5216 (class 0 OID 16435)
-- Dependencies: 222
-- Data for Name: despesas_fixas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (71, 'Aluguel - Agosto', 5200.00, '2026-07-26 02:38:08.266705', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (72, 'Cemig - Agosto', 900.00, '2026-07-26 02:38:23.51563', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (73, 'Copasa - Agosto', 80.00, '2026-07-26 02:38:42.376788', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (74, 'Internet - Agosto', 110.00, '2026-07-26 02:39:00.877813', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (76, 'Combustível - Agosto', 2000.00, '2026-07-26 02:40:06.208994', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (77, 'Telefone - Agosto', 85.00, '2026-07-26 02:40:21.572261', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (78, 'Pró-labore - Agosto', 10000.00, '2026-07-26 02:41:38.399067', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (80, 'IPVA - Agosto', 375.00, '2026-07-26 02:42:52.198207', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (81, 'Manutenção Máquinas - Agosto', 300.00, '2026-07-26 02:43:05.407371', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (82, 'Contador - Agosto', 500.00, '2026-07-26 02:43:18.527394', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (83, 'Consultoria - Agosto', 265.00, '2026-07-26 02:43:32.231891', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (84, 'Marketing - Agosto', 1500.00, '2026-07-26 02:43:59.51408', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (85, 'INSS - Agosto', 160.00, '2026-07-26 02:44:12.659045', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (86, 'Outros - Agosto', 5000.00, '2026-07-26 02:44:46.00266', true, false, NULL, '2026-08-05', NULL, 4);
INSERT INTO public.despesas_fixas (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, data_pagamento, empresa_id) VALUES (87, 'Caçamba - Agosto', 960.00, '2026-07-26 04:18:08.076148', true, false, NULL, '2026-08-05', NULL, 4);


--
-- TOC entry 5240 (class 0 OID 17051)
-- Dependencies: 246
-- Data for Name: empresas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.empresas (id, nome_fantasia, cnpj, criado_em) VALUES (4, 'Denarius ', NULL, '2026-08-17 19:00:24.734008');
INSERT INTO public.empresas (id, nome_fantasia, cnpj, criado_em) VALUES (5, 'teste', '77.831.585/0001-16', '2026-08-17 21:19:32.23973');
INSERT INTO public.empresas (id, nome_fantasia, cnpj, criado_em) VALUES (6, 'teste 2', '01.924.530/0001-99', '2026-08-23 14:26:14.124891');


--
-- TOC entry 5224 (class 0 OID 16525)
-- Dependencies: 230
-- Data for Name: faturamentos_mensais; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.faturamentos_mensais (id, mes, ano, valor, empresa_id) VALUES (1, 2, 2026, 10000.00, 4);
INSERT INTO public.faturamentos_mensais (id, mes, ano, valor, empresa_id) VALUES (4, 1, 2026, 200000.00, 4);
INSERT INTO public.faturamentos_mensais (id, mes, ano, valor, empresa_id) VALUES (2, 3, 2026, 200000.00, 4);
INSERT INTO public.faturamentos_mensais (id, mes, ano, valor, empresa_id) VALUES (8, 5, 2026, 200000.00, 4);
INSERT INTO public.faturamentos_mensais (id, mes, ano, valor, empresa_id) VALUES (14, 7, 2026, 11.00, 4);
INSERT INTO public.faturamentos_mensais (id, mes, ano, valor, empresa_id) VALUES (13, 8, 2026, 200000.00, 4);


--
-- TOC entry 5214 (class 0 OID 16407)
-- Dependencies: 220
-- Data for Name: funcionarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (53, 'Gabriel Diniz Prates', 2316.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3025.73, '2026-05-03 16:12:52.311056', false, 'administrativo', '2026-05-03', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (63, 'Ana Clara', 2700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3527.40, '2026-07-16 03:53:12.101186', true, 'administrativo', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (65, 'Fernanda Lima', 1900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2482.24, '2026-07-16 03:54:59.418459', true, 'administrativo', '2026-07-16', NULL, NULL, 40, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (67, 'Juliana Costa', 4100.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5356.42, '2026-07-16 03:56:21.595022', true, 'administrativo', '2026-07-16', NULL, NULL, 39, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (69, 'Camila Ribeiro', 4300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5617.71, '2026-07-16 03:57:38.269992', true, 'administrativo', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (73, 'Isabela Nunes', 2800.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3658.04, '2026-07-16 04:00:00.817954', true, 'administrativo', '2026-07-16', NULL, NULL, 39, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (79, 'Matheus Nunes', 2900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3788.69, '2026-07-16 04:03:25.286232', true, 'administrativo', '2026-07-16', NULL, NULL, 42, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (81, 'Aline Batista', 4400.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5748.36, '2026-07-16 11:17:18.653284', true, 'administrativo', '2026-07-16', NULL, NULL, 45, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (83, 'Vanessa Duarte', 2900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3788.69, '2026-07-16 11:18:00.897291', true, 'administrativo', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (85, 'Priscila Andrade', 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3919.33, '2026-07-16 11:19:46.342943', true, 'administrativo', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (87, 'Natália Faria', 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6532.22, '2026-07-16 11:20:18.477742', true, 'administrativo', '2026-07-16', NULL, NULL, 43, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (91, 'Carla Menezes', 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5225.78, '2026-07-16 11:21:57.132219', true, 'administrativo', '2026-07-16', NULL, NULL, 44, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (59, 'João Henrique', 2100.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2743.53, '2026-07-16 03:49:59.761849', false, 'producao', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (92, 'Marlon', 4000.00, 333.33, 111.11, 333.33, 320.00, 128.00, 40.00, 0.00, 5265.77, '2026-07-16 13:57:23.01808', true, 'producao', '2026-07-16', NULL, NULL, 21, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (94, 'Fabrício', 4000.00, 333.33, 111.11, 333.33, 320.00, 128.00, 41.00, 0.00, 5266.77, '2026-07-16 13:58:48.62396', true, 'producao', '2026-07-16', NULL, NULL, 21, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (96, 'Gerivam', 4200.00, 350.00, 116.67, 350.00, 336.00, 134.40, 42.00, 0.00, 5529.07, '2026-07-16 14:00:09.000228', true, 'producao', '2026-07-16', NULL, NULL, 22, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (98, 'Guilherme', 1800.00, 150.00, 50.00, 150.00, 144.00, 57.60, 43.00, 0.00, 2394.60, '2026-07-16 14:01:00.591394', true, 'producao', '2026-07-16', NULL, NULL, 23, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (100, 'Everaldo', 2000.00, 166.67, 55.56, 166.67, 160.00, 64.00, 40.00, 0.00, 2652.90, '2026-07-16 14:01:52.912223', true, 'producao', '2026-07-16', NULL, NULL, 23, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (82, 'Daniel Pereira', 3300.00, 275.00, 91.67, 275.00, 264.00, 105.60, 0.00, 0.00, 4311.27, '2026-07-16 11:17:41.253356', false, 'producao', '2026-07-16', '2026-07-21', 'Falecimento', 22, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (33, 'João Fulano', 100.00, 8.33, 2.78, 8.33, 8.00, 3.20, 100.00, 0.00, 230.64, '2026-01-11 21:05:53.095436', false, 'producao', '2020-05-20', '2021-05-09', 'Pedido de Demissão', 60, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (60, 'Mariana Souza', 4500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5879.00, '2026-07-16 03:50:53.849538', true, 'administrativo', '2026-07-16', NULL, NULL, 39, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (70, 'Felipe Santos', 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3266.11, '2026-07-16 03:58:09.866428', true, 'administrativo', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (80, 'Ricardo Menezes', 7200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 9406.40, '2026-07-16 11:16:47.985797', true, 'administrativo', '2026-07-16', NULL, NULL, 44, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (88, 'André Luiz', 1600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2090.31, '2026-07-16 11:20:38.281599', true, 'administrativo', '2026-07-16', NULL, NULL, 40, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (78, 'Beatriz Moreira', 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6532.22, '2026-07-16 04:02:33.765423', true, 'administrativo', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (68, 'Bruno Oliveira', 2600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3396.76, '2026-07-16 03:57:08.295813', false, 'producao', '2026-07-16', NULL, NULL, 42, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (72, 'Eduardo Rocha', 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5225.78, '2026-07-16 03:59:04.138017', false, 'producao', '2026-07-16', NULL, NULL, 41, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (66, 'Gustavo Martins', 3700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4833.84, '2026-07-16 03:55:30.942378', false, 'producao', '2026-07-16', NULL, NULL, 41, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (84, 'Henrique Azevedo', 4500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5879.00, '2026-07-16 11:19:29.226645', false, 'producao', '2026-07-16', NULL, NULL, 21, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (90, 'Leonardo Pires', 3600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4703.20, '2026-07-16 11:21:21.869711', false, 'producao', '2026-07-16', NULL, NULL, 22, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (58, 'Lionel Messi', 1200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 20.00, 0.00, 1587.73, '2026-07-16 01:34:47.072669', false, 'producao', '2026-07-16', NULL, NULL, 31, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (62, 'Lucas Ferreira', 2900.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3788.69, '2026-07-16 03:51:42.835655', false, 'producao', '2026-07-16', NULL, NULL, 31, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (86, 'Marcelo Teixeira', 2000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2612.89, '2026-07-16 11:20:04.801825', false, 'producao', '2026-07-16', NULL, NULL, 23, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (75, 'Larissa Mendes', 6200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 8099.96, '2026-07-16 04:01:11.618279', false, 'producao', '2026-07-16', NULL, NULL, 43, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (49, 'Marlom', 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 40.00, 0.00, 5265.78, '2026-05-03 06:19:33.6436', false, 'producao', '2026-05-03', NULL, NULL, 21, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (71, 'Patrícia Fernandes', 5200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6793.51, '2026-07-16 03:58:40.171543', false, 'producao', '2026-07-16', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (61, 'Pedro Almeida', 3800.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4964.49, '2026-07-16 03:51:17.776828', false, 'producao', '2026-07-16', NULL, NULL, 21, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (89, 'Renata Silveira', 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3266.11, '2026-07-16 11:21:08.419808', false, 'producao', '2026-07-16', NULL, NULL, 40, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (77, 'Vinícius Barbosa', 1850.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2416.92, '2026-07-16 04:02:16.362485', false, 'producao', '2026-07-16', NULL, NULL, 31, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (93, 'João Paulo', 2600.00, 216.67, 72.22, 216.67, 208.00, 83.20, 40.00, 0.00, 3436.76, '2026-07-16 13:58:21.437243', true, 'producao', '2026-07-16', NULL, NULL, 21, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (74, 'Matheus Carvalho', 2750.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3592.72, '2026-07-16 04:00:32.129516', false, 'producao', '2026-07-16', NULL, NULL, 23, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (64, 'Rafael Gomes', 5600.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 7316.09, '2026-07-16 03:54:03.226357', false, 'producao', '2026-07-16', NULL, NULL, 23, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (76, 'Thiago Lopes', 5500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 7185.44, '2026-07-16 04:01:55.736675', false, 'producao', '2026-07-16', NULL, NULL, 21, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (45, 'Zé inacio', 2800.00, 233.33, 77.78, 233.33, 224.00, 89.60, 20.00, 0.00, 3678.04, '2026-01-21 22:30:47.740702', true, 'administrativo', '2026-01-22', NULL, NULL, 12, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (95, 'Igor', 5000.00, 416.67, 138.89, 416.67, 400.00, 160.00, 40.00, 0.00, 6572.23, '2026-07-16 13:59:15.671907', true, 'producao', '2026-07-16', NULL, NULL, 22, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (97, 'Magno', 2500.00, 208.33, 69.44, 208.33, 200.00, 80.00, 40.00, 0.00, 3306.10, '2026-07-16 14:00:33.8445', true, 'producao', '2026-07-16', NULL, NULL, 22, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (99, 'Lucas', 2000.00, 166.67, 55.56, 166.67, 160.00, 64.00, 40.00, 0.00, 2652.90, '2026-07-16 14:01:25.474051', true, 'producao', '2026-07-16', NULL, NULL, 23, 4, 0.00);
INSERT INTO public.funcionarios (id, nome, salario_base, decimo_terceiro, um_terco_ferias, ferias, inss, multa_fgts, epi, outros_gastos, custo_total_mensal, criado_em, ativo, setor, data_admissao, data_inativacao, motivo_inativacao, funcao_id, empresa_id, custo_hora) VALUES (101, 'Diego', 1800.00, 150.00, 50.00, 150.00, 144.00, 57.60, 40.00, 0.00, 2391.60, '2026-07-16 14:02:13.340376', true, 'producao', '2026-07-16', NULL, NULL, 23, 4, 0.00);


--
-- TOC entry 5232 (class 0 OID 16609)
-- Dependencies: 238
-- Data for Name: funcoes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (22, 'Torneiro', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (23, 'Pintor', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (39, 'Analista Financeiro', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (40, 'Recepcionista', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (41, 'Eletricista Industrial', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (42, 'Operador de Máquina', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (43, 'Coordenadora de RH', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (44, 'Gerente Administrativo', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (31, 'Soldador TIG', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (45, 'Analista de Compras', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (21, 'Mecânico', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (60, 'Marceneiro', 178.00, 0.00, 4);
INSERT INTO public.funcoes (id, nome, base_horas_mensais, custo_hora_mercado, empresa_id) VALUES (12, 'Auxiliar Administrativo', 178.00, 0.00, 4);


--
-- TOC entry 5228 (class 0 OID 16578)
-- Dependencies: 234
-- Data for Name: historico_custo_obra; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.historico_custo_obra (id, data_alteracao, custo_total_folha, configuracao_usada, valor_unitario_final, titulo, empresa_id) VALUES (2, '2026-07-29 19:29:43.644464', 119965.66, '{"dias": 22, "tipo": "horas", "horasDia": 8}', 150.00, 'Base Teste Injetada', 4);
INSERT INTO public.historico_custo_obra (id, data_alteracao, custo_total_folha, configuracao_usada, valor_unitario_final, titulo, empresa_id) VALUES (3, '2026-07-29 19:36:03.447011', 39468.70, '{"dias": 22, "horas_dia": 8, "tipo_tempo": "horas", "qtd_unidades": 1}', 224.25, 'Custo Padrão Produção (Inicial)', 4);


--
-- TOC entry 5218 (class 0 OID 16446)
-- Dependencies: 224
-- Data for Name: investimentos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.investimentos (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, empresa_id) VALUES (16, 'Serra - Agosto', 1140.00, '2026-07-26 02:45:43.692669', true, false, NULL, '2026-08-05', 4);
INSERT INTO public.investimentos (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, empresa_id) VALUES (17, 'Serra 2 - Agosto', 2730.00, '2026-07-26 02:46:07.482603', true, false, NULL, '2026-08-05', 4);
INSERT INTO public.investimentos (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, empresa_id) VALUES (18, 'Coladeira - Agosto', 1000.00, '2026-07-26 02:46:35.349619', true, false, NULL, '2026-08-05', 4);
INSERT INTO public.investimentos (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, empresa_id) VALUES (19, 'Moto - Agosto', 250.00, '2026-07-26 02:46:53.431226', true, false, NULL, '2026-08-05', 4);
INSERT INTO public.investimentos (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, empresa_id) VALUES (20, 'BDMG - Agosto', 1130.00, '2026-07-26 02:47:18.535743', true, false, NULL, '2026-08-05', 4);
INSERT INTO public.investimentos (id, nome, valor, criado_em, ativo, pago, beneficiario, data_vencimento, empresa_id) VALUES (21, 'Saveiro - Agosto', 1100.00, '2026-07-26 02:47:34.618458', true, false, NULL, '2026-08-05', 4);


--
-- TOC entry 5236 (class 0 OID 16971)
-- Dependencies: 242
-- Data for Name: obra_recursos_humanos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (144, 24, 21, 12.00, 26.46, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (145, 24, 23, 8.00, 14.34, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (150, 20, 23, 20.00, 14.34, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (151, 20, 21, 16.00, 26.46, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (154, 19, 21, 120.00, 26.46, 3, 'dias', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (155, 19, 23, 32.00, 14.34, 2, 'dias', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (167, 28, 45, 1.00, 32.66, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (168, 28, 12, 1.00, 24.62, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (169, 28, 41, 1.00, 0.00, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (170, 28, 40, 1.00, 12.99, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (171, 28, 60, 1.00, 0.00, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (172, 28, 42, 1.00, 21.53, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (173, 28, 44, 1.00, 41.57, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (174, 28, 31, 1.00, 0.00, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (175, 28, 43, 1.00, 37.11, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (176, 28, 23, 1.00, 14.34, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (177, 28, 22, 1.00, 29.18, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (178, 28, 39, 1.00, 28.21, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (179, 28, 21, 1.00, 26.46, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (109, 14, 21, 30.00, 26.46, 6, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (110, 14, 22, 12.00, 29.18, 3, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (111, 13, 21, 20.00, 26.46, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (112, 13, 22, 1.00, 29.18, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (113, 13, 23, 10.00, 14.34, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (114, 15, 40, 15.00, 12.99, 3, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (115, 16, 23, 4.00, 14.34, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (116, 16, 22, 10.00, 29.18, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (117, 16, 21, 36.00, 26.46, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (118, 17, 23, 32.00, 14.34, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (119, 17, 21, 24.00, 26.46, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (120, 18, 21, 28.00, 26.46, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (121, 18, 22, 12.00, 29.18, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (126, 21, 21, 44.00, 26.46, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (127, 21, 22, 40.00, 29.18, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (128, 21, 23, 6.00, 14.34, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (129, 22, 21, 16.00, 26.46, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (130, 22, 23, 32.00, 14.34, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (131, 23, 22, 8.00, 29.18, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (132, 23, 21, 45.00, 26.46, 3, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (135, 25, 21, 64.00, 26.46, 2, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (136, 25, 22, 24.00, 29.18, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (137, 25, 23, 8.00, 14.34, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (138, 26, 21, 5.00, 26.46, 1, 'horas', 4);
INSERT INTO public.obra_recursos_humanos (id, obra_id, funcao_id, horas_estimadas, custo_hora_aplicado, qtd_profissionais, unidade_tempo, empresa_id) VALUES (139, 27, 21, 40.00, 26.46, 1, 'horas', 4);


--
-- TOC entry 5234 (class 0 OID 16956)
-- Dependencies: 240
-- Data for Name: obras; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (25, '10-Fabricação de Cavaletes Industriais', 'Indústria Aliança Equipamentos', NULL, NULL, 'orcamento', 2508.27, '2026-07-29 00:51:47.048929', 'dias', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (26, '11- Teste 11', 'teste', NULL, NULL, 'orcamento', 132.29, '2026-07-30 22:07:07.730356', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (27, '12-teste ', 'teste', NULL, NULL, 'orcamento', 1058.28, '2026-07-30 22:07:25.719723', 'dias', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (24, '09-Balcão de Atendimento Planejado', 'Clínica Odonto Prime', NULL, NULL, 'orcamento', 432.17, '2026-07-29 00:51:03.288948', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (20, '05-Cozinha Planejada Completa', 'Móveis Elegance Planejados', NULL, NULL, 'orcamento', 710.02, '2026-07-29 00:18:24.69783', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (19, '04-Estrutura Metálica para Mezanino', 'Construtora Horizonte', NULL, NULL, 'orcamento', 3633.57, '2026-07-29 00:17:21.897679', 'dias', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (28, 'Teste 17', 'teste', NULL, NULL, 'orcamento', 268.66, '2026-08-16 15:29:19.017194', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (14, 'Segundo teste', 'teste', NULL, NULL, 'orcamento', 1143.88, '2026-07-26 12:25:14.732725', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (13, 'Primeiro testeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'Fulano', NULL, NULL, 'orcamento', 701.67, '2026-07-26 02:53:16.87667', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (15, 'Terceiro teste', 'Ciclano', NULL, NULL, 'orcamento', 194.85, '2026-07-26 20:25:56.658848', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (16, '01-Fabricação de Base para Prensa Hidráulica', 'Indústria Metal Forte Ltda', NULL, NULL, 'orcamento', 1301.60, '2026-07-29 00:14:07.20738', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (17, '02-Armário Planejado em MDF para Escritório', 'Marcenaria Carvalho Design', NULL, NULL, 'orcamento', 1093.70, '2026-07-29 00:15:01.838361', 'dias', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (18, '03-Recuperação de Eixo de Transmissão', 'AgroMáquinas Cerrado', NULL, NULL, 'orcamento', 1090.96, '2026-07-29 00:15:43.334601', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (21, '06-Fabricação de Suportes Industriais', 'Siderúrgica Alfa', NULL, NULL, 'orcamento', 2417.35, '2026-07-29 00:49:09.049023', 'horas', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (22, '07-Painel Ripado com Nichos e Iluminação', 'Hotel Serra Azul', NULL, NULL, 'orcamento', 882.04, '2026-07-29 00:49:44.930421', 'dias', 4);
INSERT INTO public.obras (id, titulo, cliente, data_inicio, data_entrega, status, custo_total_estimado, criado_em, tipo_tempo, empresa_id) VALUES (23, '08-Reparo em Tambor Transportador', 'Mineração Vale Verde', NULL, NULL, 'orcamento', 1424.01, '2026-07-29 00:50:37.402042', 'dias', 4);


--
-- TOC entry 5220 (class 0 OID 16470)
-- Dependencies: 226
-- Data for Name: orcamentos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (1, 'Peça mecanica', 3000.00, 1.00, 30.00, 5.00, 13.72, 905.94, 905.94, 7616.89, '2026-07-26 20:41:33.881934', 'Fulano', NULL, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (7, 'Armário Planejado em MDF', 2795.00, 1.00, 30.00, 7.00, 13.72, 1093.70, 1093.70, 7891.03, '2026-08-02 15:32:39.499572', '02-Marcenaria Carvalho Design', 17, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (6, 'Base para Prensa', 3900.00, 1.00, 33.00, 5.00, 13.72, 1301.60, 1301.60, 10773.82, '2026-08-02 15:28:29.66031', '01-Indústria Metal Forte Ltda', 16, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (8, 'ecuperação de Eixo de Transmissão', 3000.00, 1.00, 30.00, 5.00, 13.72, 1090.96, 1090.96, 7977.69, '2026-08-02 15:40:49.750037', '03-AgroMáquinas Cerrado', 18, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (10, 'Cozinha Planejada Completa', 3000.00, 1.00, 30.00, 5.00, 13.72, 710.02, 710.02, 7234.83, '2026-08-02 15:49:27.814553', '05-Móveis Elegance Planejados', 20, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (11, 'Fabricação de Suportes Industriais', 3000.00, 1.00, 30.00, 5.00, 13.72, 2417.35, 2417.35, 10564.26, '2026-08-02 15:53:49.819792', '06-Siderúrgica Alfa', 21, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (12, 'Painel Ripado com Nichos e Iluminação', 3000.00, 1.00, 30.00, 5.00, 13.72, 882.04, 882.04, 7570.28, '2026-08-02 15:57:25.02834', '07-Hotel Serra Azul', 22, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (13, 'Reparo em Tambor Transportador', 3000.00, 1.00, 30.00, 5.00, 13.72, 1424.01, 1424.01, 8627.16, '2026-08-02 15:58:21.181682', '08-Mineração Vale Verde', 23, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (14, 'Balcão de Atendimento Planejado', 3000.00, 1.00, 30.00, 5.00, 13.72, 432.17, 432.17, 6693.00, '2026-08-02 16:02:24.00225', '09-Clínica Odonto Prime', 24, 4);
INSERT INTO public.orcamentos (id, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, cliente, id_cenario_mo, empresa_id) VALUES (15, 'Fabricação de Cavaletes Industriais', 3000.00, 1.00, 30.00, 5.00, 13.72, 2508.27, 2508.27, 10741.56, '2026-08-02 16:03:09.915329', '10-Indústria Aliança', 25, 4);


--
-- TOC entry 5230 (class 0 OID 16591)
-- Dependencies: 236
-- Data for Name: ordens_servico; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (10, 13, 'pronto', 'pendente', '2026-08-14', '2026-08-04 19:50:03.269607', '2026-08-04 19:50:03.269607', NULL, NULL, NULL, 0.00, NULL, '2026-08-04', NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (8, 10, 'pronto', 'pendente', '2026-08-14', '2026-08-04 19:49:25.657996', '2026-08-09 18:55:06.129206', NULL, NULL, NULL, 0.00, NULL, '2026-08-09', NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (6, 8, 'fila', 'pendente', '2026-08-14', '2026-08-04 19:48:52.071691', '2026-08-09 19:22:05.958772', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (1, 15, 'fila', 'pendente', '2026-08-12', '2026-08-02 17:06:35.776846', '2026-08-02 17:06:35.776846', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (3, 12, 'fila', 'pendente', '2026-08-14', '2026-08-04 19:48:14.661332', '2026-08-04 19:48:14.661332', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (4, 6, 'fila', 'pendente', '2026-08-14', '2026-08-04 19:48:28.71867', '2026-08-04 19:48:28.71867', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (5, 7, 'fila', 'pendente', '2026-08-14', '2026-08-04 19:48:40.068797', '2026-08-04 19:48:40.068797', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (11, 11, 'fila', 'pago', '2026-08-12', '2026-08-08 21:29:12.875249', '2026-08-12 20:20:50.740432', NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.ordens_servico (id, orcamento_id, status_producao, status_financeiro, data_entrega, criado_em, atualizado_em, responsaveis_execucao, observacoes, laudo_tecnico, custo_extra_materiais, descricao_materiais_extras, data_finalizacao, data_entregue, observacoes_cliente, empresa_id) VALUES (2, 14, 'entregue', 'pago', '2026-08-11', '2026-08-02 22:18:13.900997', '2026-08-10 19:46:17.842391', 'Fulano, Teste, Ciclano-Mecanico, teste2, teste3, teste4, teste 5, teste 6, teste 7, teste 8, teste 9, teste10, teste11, teste12, teste13, teste14, teste15, teste16', 'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', 'teste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee teste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee teste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee teste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee teste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee teste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee tteste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee tteste 123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtteste vasrdfbgerhbethbtrhnrthwrgtw123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrttesteteste rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrt 123456789wergwerghetwhtrhwhtrhwrtteste teste 123456789wergwerghetwhtrhwhtrhwrt123456789wergwerghetwhtrhwhtrhwrtteste 123456789wergwerghetwhtrhwhtrhwrtwergwergwergwergwerwergwergwergwergwergwergweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', 10.00, 'chapa de açorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', '2026-08-02', NULL, NULL, 4);


--
-- TOC entry 5238 (class 0 OID 17031)
-- Dependencies: 244
-- Data for Name: pagamentos_os; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (4, 11, 10564.26, 'PIX', '2026-08-09', '2026-08-09 00:01:38.081692', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (5, 8, 5000.00, 'PIX', '2026-08-09', '2026-08-09 00:02:04.896137', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (7, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:32.325214', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (8, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:35.128952', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (9, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:38.182678', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (10, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:40.932846', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (11, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:43.572686', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (12, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:46.224667', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (13, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:49.128303', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (14, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:52.484612', 4);
INSERT INTO public.pagamentos_os (id, os_id, valor, forma_pagamento, data_pagamento, registrado_em, empresa_id) VALUES (15, 8, 1.00, 'PIX', '2026-08-09', '2026-08-09 00:19:55.501076', 4);


--
-- TOC entry 5226 (class 0 OID 16567)
-- Dependencies: 232
-- Data for Name: snapshots_financeiros; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (2, '2026-01-26 21:45:55.151422', 'Teste', 200000.00, 27435.00, 12350.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (8, '2026-07-23 23:42:38.96694', 'Teste 1', 0.00, 0.00, 0.00, 0.00, '{"despesas": [], "investimentos": []}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (9, '2026-07-23 23:44:23.728804', 'teste 2', 0.00, 0.00, 0.00, 0.00, '{"despesas": [], "investimentos": []}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (11, '2026-07-23 23:57:20.056496', 'teste 3', 100.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (3, '2026-01-26 22:05:57.844724', 'Teste2', 10000.00, 7200.00, 0.00, 72.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (5, '2026-03-08 00:10:19.090715', 'Custo fixo de Março', 200000.00, 27435.00, 0.00, 13.72, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 24, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 23, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 28, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 27, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 26, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 25, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (12, '2026-07-24 00:02:12.226487', 'teste 4', 100.00, NULL, NULL, NULL, NULL, 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (14, '2026-07-26 12:34:56.920171', 'Correção de Arredondamento', 10000.00, 1372.00, 0.00, 13.72, '{}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (6, '2026-04-26 19:12:59.543368', 'Teste 26 de abril', 0.00, 49.98, 0.00, 0.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5210, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 24, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 23, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-03-07T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 28, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 27, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 26, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 25, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 6, "nome": "Copasa", "pago": false, "ativo": true, "valor": 80, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 38, "nome": "Teste", "pago": false, "ativo": true, "valor": 49.98, "beneficiario": "teste", "dataVencimento": "2026-04-26T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}]}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (7, '2026-07-23 23:24:12.415821', 'Teste', 100.00, 14.00, 15.00, 14.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5210, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 53, "nome": "Copasa Maio", "pago": false, "ativo": true, "valor": 80, "beneficiario": "Copasa ", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 52, "nome": "Telefone Maio", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 51, "nome": "Pró-labore Maio", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 50, "nome": "Outros Maio", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 49, "nome": "Marketing Maio", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 48, "nome": "Manutenção Máquinas Maio", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 47, "nome": "IPVA Maio", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 46, "nome": "Internet Maio", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 45, "nome": "INSS Maio", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 44, "nome": "Contador Maio", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 43, "nome": "Consultoria Maio", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 42, "nome": "Combustível Maio", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 41, "nome": "Cemig Maio", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 40, "nome": "Caçamba Maio", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 39, "nome": "Aluguel Maio", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 61, "nome": "8", "pago": false, "ativo": true, "valor": 2, "beneficiario": "8", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 60, "nome": "7", "pago": false, "ativo": true, "valor": 2, "beneficiario": "7", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 59, "nome": "6", "pago": false, "ativo": true, "valor": 2, "beneficiario": "6", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 58, "nome": "5", "pago": false, "ativo": true, "valor": 2, "beneficiario": "5", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 57, "nome": "4", "pago": false, "ativo": true, "valor": 2, "beneficiario": "4", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 55, "nome": "Teste 2", "pago": false, "ativo": true, "valor": 2, "beneficiario": "", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 54, "nome": "Teste", "pago": false, "ativo": true, "valor": 2, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 13, "nome": "Teste", "pago": false, "ativo": true, "valor": 15, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}]}', 4);
INSERT INTO public.snapshots_financeiros (id, criado_em, descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup, empresa_id) VALUES (13, '2026-07-24 00:14:22.071167', '6', 100.00, 14.00, 15.00, 14.00, '{"despesas": [{"id": 18, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 17, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 16, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 15, "nome": "Consultoria", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 14, "nome": "Contador", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 13, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 12, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 11, "nome": "Caçamba", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 10, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 9, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 8, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 7, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 5, "nome": "Cemig", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-01-05T03:00:00.000Z"}, {"id": 1, "nome": "Aluguel", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 21, "nome": "Aluguel Fevereiro", "pago": false, "ativo": true, "valor": 5210, "beneficiario": "", "dataVencimento": "2026-02-05T03:00:00.000Z"}, {"id": 22, "nome": "Combustível", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-02-06T03:00:00.000Z"}, {"id": 36, "nome": "INSS", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 35, "nome": "IPVA", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 34, "nome": "Internet", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 33, "nome": "Manutenção Máquinas", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 32, "nome": "Marketing", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 31, "nome": "Outros", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 30, "nome": "Pró-labore", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 29, "nome": "Telefone", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-03-08T03:00:00.000Z"}, {"id": 53, "nome": "Copasa Maio", "pago": false, "ativo": true, "valor": 80, "beneficiario": "Copasa ", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 52, "nome": "Telefone Maio", "pago": false, "ativo": true, "valor": 85, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 51, "nome": "Pró-labore Maio", "pago": false, "ativo": true, "valor": 10000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 50, "nome": "Outros Maio", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 49, "nome": "Marketing Maio", "pago": false, "ativo": true, "valor": 1500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 48, "nome": "Manutenção Máquinas Maio", "pago": false, "ativo": true, "valor": 300, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 47, "nome": "IPVA Maio", "pago": false, "ativo": true, "valor": 375, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 46, "nome": "Internet Maio", "pago": false, "ativo": true, "valor": 110, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 45, "nome": "INSS Maio", "pago": false, "ativo": true, "valor": 160, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 44, "nome": "Contador Maio", "pago": false, "ativo": true, "valor": 500, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 43, "nome": "Consultoria Maio", "pago": false, "ativo": true, "valor": 265, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 42, "nome": "Combustível Maio", "pago": false, "ativo": true, "valor": 2000, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 41, "nome": "Cemig Maio", "pago": false, "ativo": true, "valor": 900, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 40, "nome": "Caçamba Maio", "pago": false, "ativo": true, "valor": 960, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 39, "nome": "Aluguel Maio", "pago": false, "ativo": true, "valor": 5200, "beneficiario": "", "dataVencimento": "2026-05-05T03:00:00.000Z"}, {"id": 61, "nome": "8", "pago": false, "ativo": true, "valor": 2, "beneficiario": "8", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 60, "nome": "7", "pago": false, "ativo": true, "valor": 2, "beneficiario": "7", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 59, "nome": "6", "pago": false, "ativo": true, "valor": 2, "beneficiario": "6", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 58, "nome": "5", "pago": false, "ativo": true, "valor": 2, "beneficiario": "5", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 57, "nome": "4", "pago": false, "ativo": true, "valor": 2, "beneficiario": "4", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 55, "nome": "Teste 2", "pago": false, "ativo": true, "valor": 2, "beneficiario": "", "dataVencimento": "2026-07-23T03:00:00.000Z"}, {"id": 54, "nome": "Teste", "pago": false, "ativo": true, "valor": 2, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}], "investimentos": [{"id": 11, "nome": "Compra de Maquinário", "pago": false, "ativo": true, "valor": 5000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 7, "nome": " Saveiro ", "pago": false, "ativo": true, "valor": 1100, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 6, "nome": " BDMG ", "pago": false, "ativo": true, "valor": 1130, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 5, "nome": " Moto ", "pago": false, "ativo": true, "valor": 250, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 4, "nome": " Serra ", "pago": false, "ativo": true, "valor": 2730, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 2, "nome": "Coladeira", "pago": false, "ativo": true, "valor": 1000, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 1, "nome": "Serra", "pago": false, "ativo": true, "valor": 1140, "beneficiario": "", "dataVencimento": "2026-01-21T03:00:00.000Z"}, {"id": 13, "nome": "Teste", "pago": false, "ativo": true, "valor": 15, "beneficiario": "teste", "dataVencimento": "2026-07-23T03:00:00.000Z"}]}', 4);


--
-- TOC entry 5244 (class 0 OID 17172)
-- Dependencies: 250
-- Data for Name: solicitacoes_alteracao; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (1, 3, 4, 'PERFIL_CONTA', '{"cnpj": null, "email": "gabrieldprates11@gmail.com", "nome_empresa": "Denarius", "nome_usuario": "Gabriel Prates"}', '{"cnpj": "", "email": "gabrieldprates11@gmail.com", "senha_hash": null, "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', 'APROVADA', '2026-08-20 19:11:27.812556', '2026-08-20 19:11:49.558985');
INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (2, 3, 4, 'PERFIL_CONTA', '{"cnpj": null, "email": "gabrieldprates11@gmail.com", "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', '{"cnpj": "", "email": "gabrieldprates11@gmail.com", "senha_hash": null, "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', 'APROVADA', '2026-08-20 19:12:19.139413', '2026-08-20 19:12:25.339764');
INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (3, 3, 4, 'PERFIL_CONTA', '{"cnpj": null, "email": "gabrieldprates11@gmail.com", "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', '{"cnpj": "", "email": "gabrieldprates11@gmail.com", "senha_hash": null, "nome_empresa": "Denarius ", "nome_usuario": "Gabriel Prates"}', 'REJEITADA', '2026-08-20 19:16:28.23204', '2026-08-20 19:19:36.187689');
INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (4, 3, 4, 'PERFIL_CONTA', '{"cnpj": null, "email": "gabrieldprates11@gmail.com", "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', '{"cnpj": "", "email": "gabrieldprates11@gmail.com", "senha_hash": null, "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', 'APROVADA', '2026-08-20 19:16:37.802821', '2026-08-20 19:22:12.836933');
INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (5, 3, 4, 'PERFIL_CONTA', '{"cnpj": null, "email": "gabrieldprates11@gmail.com", "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', '{"cnpj": "", "email": "gabrieldprates11@gmail.com", "senha_hash": null, "nome_empresa": "Denarius ", "nome_usuario": "Gabriel Prates"}', 'APROVADA', '2026-08-20 19:22:20.799782', '2026-08-20 19:22:26.277895');
INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (6, 3, 4, 'PERFIL_CONTA', '{"cnpj": null, "email": "gabrieldprates11@gmail.com", "nome_empresa": "Denarius ", "nome_usuario": "Gabriel Prates"}', '{"cnpj": "", "email": "gabrieldprates11@gmail.com", "senha_hash": null, "nome_empresa": "Denarius 01", "nome_usuario": "Gabriel Prates"}', 'REJEITADA', '2026-08-21 00:33:28.203673', '2026-08-21 00:33:34.388638');
INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (7, 4, 5, 'PERFIL_CONTA', '{"cnpj": null, "email": "teste@gmail.com", "nome_empresa": "teste", "nome_usuario": "teste"}', '{"cnpj": "", "email": "teste@gmail.com", "senha_hash": null, "nome_empresa": "teste 01", "nome_usuario": "teste"}', 'REJEITADA', '2026-08-23 02:19:57.51296', '2026-08-23 02:28:06.809222');
INSERT INTO public.solicitacoes_alteracao (id, usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status, criado_em, analisado_em) VALUES (8, 4, 5, 'PERFIL_CONTA', '{"cnpj": null, "email": "teste@gmail.com", "nome_empresa": "teste", "nome_usuario": "teste"}', '{"cnpj": "77.831.585/0001-16", "email": "teste@gmail.com", "senha_hash": null, "nome_empresa": "teste", "nome_usuario": "teste"}', 'APROVADA', '2026-08-23 14:24:42.20715', '2026-08-23 14:25:09.039176');


--
-- TOC entry 5242 (class 0 OID 17063)
-- Dependencies: 248
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuarios (id, empresa_id, nome, email, senha_hash, token_recuperacao, expiracao_token, ativo, criado_em, super_admin) VALUES (5, 6, 'teste 2', 'teste2@gmail.com', '$2b$10$VYqB1dFBUtTrG3sYg4GeC.f6S/67mOiS58BKIpxv7Tum49AVGnTFi', NULL, NULL, false, '2026-08-23 14:26:14.124891', false);
INSERT INTO public.usuarios (id, empresa_id, nome, email, senha_hash, token_recuperacao, expiracao_token, ativo, criado_em, super_admin) VALUES (3, 4, 'Gabriel Prates', 'gabrieldprates11@gmail.com', '$2b$10$2UjHr/dzAGIx.ooNIxuQrOc/jDOAAhCA/oTEJMt14zowokMrzKnjy', NULL, NULL, true, '2026-08-17 19:00:24.734008', true);
INSERT INTO public.usuarios (id, empresa_id, nome, email, senha_hash, token_recuperacao, expiracao_token, ativo, criado_em, super_admin) VALUES (4, 5, 'teste', 'teste@gmail.com', '$2b$10$h9ICXdNOIu8NiHs4XaUHOeNapqcgb2iaEVEDv/8hf5hKW9DsadiXC', NULL, NULL, true, '2026-08-17 21:19:32.23973', false);


--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracao_producao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.configuracao_producao_id_seq', 2, true);


--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 221
-- Name: despesas_fixas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.despesas_fixas_id_seq', 97, true);


--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 245
-- Name: empresas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empresas_id_seq', 7, true);


--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 229
-- Name: faturamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faturamentos_id_seq', 17, true);


--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 219
-- Name: funcionarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.funcionarios_id_seq', 104, true);


--
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 237
-- Name: funcoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.funcoes_id_seq', 71, true);


--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 233
-- Name: historico_custo_obra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.historico_custo_obra_id_seq', 3, true);


--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 223
-- Name: investimentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investimentos_id_seq', 22, true);


--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 241
-- Name: obra_recursos_humanos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.obra_recursos_humanos_id_seq', 183, true);


--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 239
-- Name: obras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.obras_id_seq', 32, true);


--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 225
-- Name: orcamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orcamentos_id_seq', 17, true);


--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 235
-- Name: ordens_servico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ordens_servico_id_seq', 11, true);


--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 243
-- Name: pagamentos_os_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pagamentos_os_id_seq', 15, true);


--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 231
-- Name: snapshots_financeiros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.snapshots_financeiros_id_seq', 15, true);


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 249
-- Name: solicitacoes_alteracao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.solicitacoes_alteracao_id_seq', 8, true);


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 247
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 6, true);


--
-- TOC entry 5006 (class 2606 OID 16499)
-- Name: configuracao_producao configuracao_producao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracao_producao
    ADD CONSTRAINT configuracao_producao_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 16444)
-- Name: despesas_fixas despesas_fixas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despesas_fixas
    ADD CONSTRAINT despesas_fixas_pkey PRIMARY KEY (id);


--
-- TOC entry 5032 (class 2606 OID 17061)
-- Name: empresas empresas_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_cnpj_key UNIQUE (cnpj);


--
-- TOC entry 5034 (class 2606 OID 17059)
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 16534)
-- Name: faturamentos_mensais faturamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT faturamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 16423)
-- Name: funcionarios funcionarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 16616)
-- Name: funcoes funcoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcoes
    ADD CONSTRAINT funcoes_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 16587)
-- Name: historico_custo_obra historico_custo_obra_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_custo_obra
    ADD CONSTRAINT historico_custo_obra_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 16455)
-- Name: investimentos investimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investimentos
    ADD CONSTRAINT investimentos_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 16981)
-- Name: obra_recursos_humanos obra_recursos_humanos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT obra_recursos_humanos_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 16969)
-- Name: obras obras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 16482)
-- Name: orcamentos orcamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT orcamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 16602)
-- Name: ordens_servico ordens_servico_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 17042)
-- Name: pagamentos_os pagamentos_os_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamentos_os
    ADD CONSTRAINT pagamentos_os_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 16576)
-- Name: snapshots_financeiros snapshots_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshots_financeiros
    ADD CONSTRAINT snapshots_financeiros_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 17187)
-- Name: solicitacoes_alteracao solicitacoes_alteracao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes_alteracao
    ADD CONSTRAINT solicitacoes_alteracao_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 17164)
-- Name: faturamentos_mensais uq_faturamento_mes_ano_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT uq_faturamento_mes_ano_empresa UNIQUE (mes, ano, empresa_id);


--
-- TOC entry 5023 (class 2606 OID 17166)
-- Name: funcoes uq_funcoes_nome_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcoes
    ADD CONSTRAINT uq_funcoes_nome_empresa UNIQUE (nome, empresa_id);


--
-- TOC entry 5036 (class 2606 OID 17170)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 5038 (class 2606 OID 17168)
-- Name: usuarios usuarios_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nome_key UNIQUE (nome);


--
-- TOC entry 5040 (class 2606 OID 17077)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 1259 OID 17027)
-- Name: idx_os_criado_em; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_criado_em ON public.ordens_servico USING btree (criado_em);


--
-- TOC entry 5016 (class 1259 OID 17028)
-- Name: idx_os_data_entrega; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_data_entrega ON public.ordens_servico USING btree (data_entrega);


--
-- TOC entry 5017 (class 1259 OID 17029)
-- Name: idx_os_data_finalizacao; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_data_finalizacao ON public.ordens_servico USING btree (data_finalizacao);


--
-- TOC entry 5028 (class 1259 OID 17048)
-- Name: idx_pagamentos_os_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pagamentos_os_id ON public.pagamentos_os USING btree (os_id);


--
-- TOC entry 5049 (class 2606 OID 17085)
-- Name: configuracao_producao configuracao_producao_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracao_producao
    ADD CONSTRAINT configuracao_producao_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5045 (class 2606 OID 17090)
-- Name: despesas_fixas despesas_fixas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despesas_fixas
    ADD CONSTRAINT despesas_fixas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5050 (class 2606 OID 17095)
-- Name: faturamentos_mensais faturamentos_mensais_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturamentos_mensais
    ADD CONSTRAINT faturamentos_mensais_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5058 (class 2606 OID 16987)
-- Name: obra_recursos_humanos fk_funcao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT fk_funcao FOREIGN KEY (funcao_id) REFERENCES public.funcoes(id) ON DELETE RESTRICT;


--
-- TOC entry 5043 (class 2606 OID 16619)
-- Name: funcionarios fk_funcionario_funcao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT fk_funcionario_funcao FOREIGN KEY (funcao_id) REFERENCES public.funcoes(id) ON DELETE RESTRICT;


--
-- TOC entry 5059 (class 2606 OID 16982)
-- Name: obra_recursos_humanos fk_obra; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT fk_obra FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;


--
-- TOC entry 5047 (class 2606 OID 17014)
-- Name: orcamentos fk_orcamento_cenario_mo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT fk_orcamento_cenario_mo FOREIGN KEY (id_cenario_mo) REFERENCES public.obras(id) ON DELETE SET NULL;


--
-- TOC entry 5053 (class 2606 OID 17019)
-- Name: ordens_servico fk_os_orcamento; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT fk_os_orcamento FOREIGN KEY (orcamento_id) REFERENCES public.orcamentos(id) ON DELETE RESTRICT;


--
-- TOC entry 5044 (class 2606 OID 17100)
-- Name: funcionarios funcionarios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcionarios
    ADD CONSTRAINT funcionarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5056 (class 2606 OID 17105)
-- Name: funcoes funcoes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funcoes
    ADD CONSTRAINT funcoes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5052 (class 2606 OID 17110)
-- Name: historico_custo_obra historico_custo_obra_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_custo_obra
    ADD CONSTRAINT historico_custo_obra_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5046 (class 2606 OID 17115)
-- Name: investimentos investimentos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investimentos
    ADD CONSTRAINT investimentos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5060 (class 2606 OID 17120)
-- Name: obra_recursos_humanos obra_recursos_humanos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obra_recursos_humanos
    ADD CONSTRAINT obra_recursos_humanos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5057 (class 2606 OID 17125)
-- Name: obras obras_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5048 (class 2606 OID 17130)
-- Name: orcamentos orcamentos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orcamentos
    ADD CONSTRAINT orcamentos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5054 (class 2606 OID 17135)
-- Name: ordens_servico ordens_servico_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5055 (class 2606 OID 16603)
-- Name: ordens_servico ordens_servico_orcamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES public.orcamentos(id) ON DELETE CASCADE;


--
-- TOC entry 5061 (class 2606 OID 17140)
-- Name: pagamentos_os pagamentos_os_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamentos_os
    ADD CONSTRAINT pagamentos_os_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5062 (class 2606 OID 17043)
-- Name: pagamentos_os pagamentos_os_os_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamentos_os
    ADD CONSTRAINT pagamentos_os_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE CASCADE;


--
-- TOC entry 5051 (class 2606 OID 17145)
-- Name: snapshots_financeiros snapshots_financeiros_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshots_financeiros
    ADD CONSTRAINT snapshots_financeiros_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- TOC entry 5064 (class 2606 OID 17193)
-- Name: solicitacoes_alteracao solicitacoes_alteracao_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes_alteracao
    ADD CONSTRAINT solicitacoes_alteracao_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- TOC entry 5065 (class 2606 OID 17188)
-- Name: solicitacoes_alteracao solicitacoes_alteracao_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes_alteracao
    ADD CONSTRAINT solicitacoes_alteracao_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5063 (class 2606 OID 17080)
-- Name: usuarios usuarios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


-- Completed on 2026-08-23 20:17:34

--
-- PostgreSQL database dump complete
--



