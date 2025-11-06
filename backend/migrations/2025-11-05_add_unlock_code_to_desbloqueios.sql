-- Adiciona colunas para o código de verificação de desbloqueio e sua expiração
ALTER TABLE Desbloqueios
ADD COLUMN verification_code VARCHAR(10) NULL,
ADD COLUMN code_expires_at DATETIME NULL;

-- Adiciona um índice na coluna do código para buscas rápidas
ALTER TABLE Desbloqueios
ADD INDEX idx_verification_code (verification_code);
