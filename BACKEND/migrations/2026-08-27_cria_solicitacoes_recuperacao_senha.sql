-- Cria a tabela solicitacoes_recuperacao_senha, para o futuro fluxo de
-- "esqueci minha senha" self-service (usuario sem sessao ativa).
--
-- E uma tabela nova, separada de solicitacoes_alteracao, porque o pipeline
-- de aprovacao dessa ultima (POST /admin/solicitacoes/:id/aprovar) e
-- hardcoded para o formato de PERFIL_CONTA (sempre reescreve nome_fantasia,
-- cnpj, nome e email) e nao ramifica por tipo_alteracao -- reaproveitar
-- exigiria gambiarra nesse fluxo ja em producao. Ver investigacao anterior.
--
-- Nao ha ferramenta de migrations neste projeto (schema versionado apenas
-- como snapshot em BACKEND/banco_dados.sql - ver CLAUDE.md). Este arquivo
-- documenta e executa essa mudanca pontual; apos rodar, atualizar o dump.
--
-- usuario_id fica NULL quando a busca pelo identificador_informado nao
-- encontra nenhuma conta correspondente -- de proposito, para a resposta ao
-- usuario nunca revelar se aquele email/login/CNPJ existe no sistema
-- (mesma logica anti-enumeracao ja usada no login). ON DELETE SET NULL (em
-- vez de CASCADE) preserva o registro da solicitacao mesmo se a conta
-- associada for excluida depois -- e um registro de auditoria, nao deveria
-- desaparecer junto com o usuario.

BEGIN;

CREATE TABLE solicitacoes_recuperacao_senha (
    id                     SERIAL PRIMARY KEY,
    identificador_informado VARCHAR(255) NOT NULL,
    usuario_id             INTEGER NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    status                 VARCHAR(20) DEFAULT 'PENDENTE',
    criado_em              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analisado_em           TIMESTAMP NULL
);

COMMIT;
