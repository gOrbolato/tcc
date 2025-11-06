-- Cria (se necessário) e seleciona o banco de dados correto
CREATE DATABASE IF NOT EXISTS `tcc` CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `tcc`;

-- Desativa temporariamente a checagem de chaves estrangeiras para permitir apagar as tabelas
SET FOREIGN_KEY_CHECKS=0;

-- Apaga as tabelas antigas, se elas existirem
DROP TABLE IF EXISTS Notificacoes;
DROP TABLE IF EXISTS Admins;
DROP TABLE IF EXISTS Avaliacoes;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Cursos;
DROP TABLE IF EXISTS Instituicoes;
DROP TABLE IF EXISTS Desbloqueios;
DROP TABLE IF EXISTS AvaliacaoRespostas;
DROP TABLE IF EXISTS AnalyticsResults;
DROP TABLE IF EXISTS Consents;

-- Reativa a checagem de chaves estrangeiras
SET FOREIGN_KEY_CHECKS=1;

-- Recria a tabela Instituicoes
CREATE TABLE IF NOT EXISTS Instituicoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Recria a tabela Cursos
CREATE TABLE IF NOT EXISTS Cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    instituicao_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Recria a tabela Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    ra VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    instituicao_id INT,
    curso_id INT,
    periodo VARCHAR(50),
    semestre VARCHAR(50),
    previsao_termino VARCHAR(7),
    anonymized_id VARCHAR(32) NOT NULL UNIQUE,
    is_trancado BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_trancamento TEXT,
    desbloqueio_aprovado_em DATETIME,
    reset_token VARCHAR(255) UNIQUE,
    reset_token_expires_at DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id),
    FOREIGN KEY (curso_id) REFERENCES Cursos(id),
    UNIQUE (ra, instituicao_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Recria a tabela Avaliacoes
CREATE TABLE IF NOT EXISTS Avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    instituicao_id INT,
    curso_id INT,
    media_final DECIMAL(3, 2) NOT NULL,
    nota_infraestrutura INT,
    nota_coordenacao INT,
    nota_direcao INT,
    nota_localizacao INT,
    nota_suporte_mercado INT,
    nota_acessibilidade INT,
    nota_equipamentos INT,
    nota_biblioteca INT,
    nota_didatica INT,
    nota_conteudo INT,
    nota_dinamica_professores INT,
    nota_disponibilidade_professores INT,
    comentario_infraestrutura TEXT,
    comentario_coordenacao TEXT,
    comentario_direcao TEXT,
    comentario_localizacao TEXT,
    comentario_suporte_mercado TEXT,
    comentario_acessibilidade TEXT,
    comentario_equipamentos TEXT,
    comentario_biblioteca TEXT,
    comentario_didatica TEXT,
    comentario_conteudo TEXT,
    comentario_dinamica_professores TEXT,
    comentario_disponibilidade_professores TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES Cursos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Recria a tabela Admins
CREATE TABLE IF NOT EXISTS Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Recria a tabela Notificacoes
CREATE TABLE IF NOT EXISTS Notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  mensagem VARCHAR(255) NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Tabela para pedidos de desbloqueio
CREATE TABLE IF NOT EXISTS Desbloqueios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    admin_id INT DEFAULT NULL,
    motivo TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NULL,
    verification_code VARCHAR(10) NULL,
    code_expires_at DATETIME NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES Admins(id),
    INDEX idx_verification_code (verification_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Tabela para respostas de avaliação normalizadas
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
    INDEX (question_key),
    FULLTEXT idx_respostas_comentario (comentario)
);

-- Tabela para resultados de análise
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

-- Tabela para consentimentos
CREATE TABLE IF NOT EXISTS Consents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    `type` VARCHAR(64) NOT NULL,
    agreed BOOLEAN NOT NULL DEFAULT TRUE,
    version VARCHAR(64) NULL,
    source VARCHAR(128) NULL,
    ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id),
    INDEX (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;