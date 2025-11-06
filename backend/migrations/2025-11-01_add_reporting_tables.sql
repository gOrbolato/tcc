-- Migration: 2025-11-01 Add reporting tables and metadata to Avaliacoes
-- Safe incremental migration: does not DROP existing tables, only ALTER/CREATE.

USE avaliacao_educacional;

-- 1) Add metadata columns to Avaliacoes if not exists
ALTER TABLE Avaliacoes
  ADD COLUMN IF NOT EXISTS template_id INT NULL,
  ADD COLUMN IF NOT EXISTS resposta_raw JSON NULL,
  ADD COLUMN IF NOT EXISTS anonymized_id VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS ip VARCHAR(45) NULL,
  ADD COLUMN IF NOT EXISTS user_agent VARCHAR(512) NULL,
  ADD COLUMN IF NOT EXISTS processed TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS escala VARCHAR(20) NULL;

-- 2) Add indexes for reporting performance (if not present)
ALTER TABLE Avaliacoes
  ADD INDEX IF NOT EXISTS idx_avaliacoes_instituicao (instituicao_id),
  ADD INDEX IF NOT EXISTS idx_avaliacoes_curso (curso_id),
  ADD INDEX IF NOT EXISTS idx_avaliacoes_usuario (usuario_id),
  ADD INDEX IF NOT EXISTS idx_avaliacoes_criado (criado_em);

-- 3) Create normalized responses table
CREATE TABLE IF NOT EXISTS AvaliacaoRespostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avaliacao_id INT NOT NULL,
  question_id INT NULL,
  question_key VARCHAR(128) NULL,
  nota INT NULL,
  comentario TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (avaliacao_id) REFERENCES Avaliacoes(id) ON DELETE CASCADE,
  INDEX (question_id),
  INDEX (question_key)
);

-- 4) Table to store analysis results from Python/IA
CREATE TABLE IF NOT EXISTS AnalyticsResults (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avaliacao_id INT NULL,
  instituicao_id INT NULL,
  curso_id INT NULL,
  tipo VARCHAR(50) NOT NULL,
  payload JSON NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (tipo),
  INDEX (instituicao_id),
  INDEX (curso_id)
);

-- 5) Fulltext indices: create only if supported by your MySQL version
-- If your MySQL does not support FULLTEXT on InnoDB, remove or adapt these statements.
ALTER TABLE Avaliacoes
  ADD FULLTEXT IF NOT EXISTS idx_comentarios (
    comentario_infraestrutura,
    comentario_coordenacao,
    comentario_direcao,
    comentario_localizacao,
    comentario_suporte_mercado,
    comentario_acessibilidade,
    comentario_equipamentos,
    comentario_biblioteca,
    comentario_didatica,
    comentario_conteudo,
    comentario_dinamica_professores,
    comentario_disponibilidade_professores
  );

ALTER TABLE AvaliacaoRespostas
  ADD FULLTEXT IF NOT EXISTS idx_respostas_comentario (comentario);

-- End migration
