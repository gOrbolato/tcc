-- Migração para adicionar a coluna is_active na tabela Usuarios
-- Esta alteração é necessária para controlar o status (ativo/bloqueado) dos usuários.

ALTER TABLE Usuarios
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
