CREATE DATABASE IF NOT EXISTS avaliacao_educacional;

USE avaliacao_educacional;

CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    ra VARCHAR(20) NOT NULL UNIQUE,
    idade INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    instituicao_id INT,
    curso_id INT,
    periodo VARCHAR(50),
    semestre VARCHAR(50),
    reset_token VARCHAR(255) UNIQUE,
    reset_token_expires_at DATETIME,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Instituicoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    instituicao_id INT NOT NULL,
    FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id)
);

CREATE TABLE IF NOT EXISTS Avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    instituicao_id INT NOT NULL,
    curso_id INT NOT NULL,
    nota_infraestrutura INT NOT NULL,
    obs_infraestrutura TEXT,
    nota_material_didatico INT NOT NULL,
    obs_material_didatico TEXT,
    media_final DECIMAL(3, 2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id),
    FOREIGN KEY (curso_id) REFERENCES Cursos(id)
);

CREATE TABLE IF NOT EXISTS Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Consentimento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    consentimento_cookies BOOLEAN NOT NULL DEFAULT false,
    consentimento_localizacao BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Adicionando referência de instituição e curso na tabela de usuários após a criação das outras tabelas
ALTER TABLE Usuarios
ADD FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id),
ADD FOREIGN KEY (curso_id) REFERENCES Cursos(id);
