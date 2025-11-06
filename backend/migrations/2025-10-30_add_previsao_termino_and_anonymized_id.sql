-- Migração: tornar 'idade' nullable, adicionar 'previsao_termino' e 'anonymized_id' à tabela Usuarios
ALTER TABLE Usuarios MODIFY COLUMN idade INT NULL;
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS previsao_termino VARCHAR(7) NULL AFTER semestre;
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS anonymized_id VARCHAR(64) UNIQUE NULL AFTER previsao_termino;
