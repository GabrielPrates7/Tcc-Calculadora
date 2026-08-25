-- Separa o campo unico "epi" (EPI/Beneficios) da tabela funcionarios em dois
-- campos independentes: valor_epi e valor_beneficio.
--
-- Nao ha ferramenta de migrations neste projeto (schema versionado apenas
-- como snapshot em BACKEND/banco_dados.sql - ver CLAUDE.md). Este arquivo
-- documenta e executa essa mudanca pontual; apos rodar, atualizar o dump.
--
-- CRITERIO DE MIGRACAO DOS DADOS EXISTENTES:
--   - valor_beneficio recebe integralmente o valor que estava em `epi` para
--     cada funcionario. Como o campo antigo era unico (sem distincao entre
--     EPI e beneficio/vale), o valor ja cadastrado e tratado como
--     "beneficio" por padrao, preservando o custo total mensal existente.
--   - valor_epi comeca zerado (0) para TODO registro ja cadastrado, ja que
--     nao havia informacao anterior que permitisse separar quanto do valor
--     original era especificamente EPI.
--   - Resultado: para quem nao alterar nada, valor_epi + valor_beneficio =
--     valor antigo de `epi`, entao o custo_total_mensal recalculado fica
--     identico ao que ja estava salvo.

BEGIN;

ALTER TABLE funcionarios ADD COLUMN valor_epi numeric DEFAULT 0 NOT NULL;
ALTER TABLE funcionarios ADD COLUMN valor_beneficio numeric DEFAULT 0 NOT NULL;

UPDATE funcionarios SET valor_beneficio = epi, valor_epi = 0;

ALTER TABLE funcionarios DROP COLUMN epi;

COMMIT;
