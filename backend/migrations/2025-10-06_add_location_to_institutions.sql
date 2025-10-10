-- Migração para adicionar as colunas de latitude e longitude na tabela Instituicoes.
-- Estas colunas são necessárias para a funcionalidade de filtro por localização.

ALTER TABLE Instituicoes
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);
