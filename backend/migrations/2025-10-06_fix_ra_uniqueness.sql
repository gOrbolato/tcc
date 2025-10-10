-- Migração para corrigir a regra de unicidade do RA na tabela Usuarios.
-- O RA deve ser único por instituição, e não em todo o sistema.

-- 1. Remove a chave única antiga que estava incorreta
ALTER TABLE Usuarios DROP INDEX ra;

-- 2. Adiciona a chave única composta, que é a forma correta
ALTER TABLE Usuarios ADD UNIQUE (ra, instituicao_id);
