-- Seleciona o banco de dados correto
USE avaliacao_educacional;

-- Desativa temporariamente a checagem de chaves estrangeiras para permitir apagar as tabelas
SET FOREIGN_KEY_CHECKS=0;

-- Apaga as tabelas antigas, se elas existirem
DROP TABLE IF EXISTS Notificacoes;
DROP TABLE IF EXISTS Admins;
DROP TABLE IF EXISTS Avaliacoes;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Cursos;
DROP TABLE IF EXISTS Instituicoes;

-- Reativa a checagem de chaves estrangeiras
SET FOREIGN_KEY_CHECKS=1;

-- Recria a tabela Instituicoes
CREATE TABLE IF NOT EXISTS Instituicoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- Recria a tabela Cursos
CREATE TABLE IF NOT EXISTS Cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    instituicao_id INT NOT NULL,
    FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id) ON DELETE CASCADE
);

-- Recria a tabela Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    ra VARCHAR(20) NOT NULL,
    idade INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    instituicao_id INT,
    curso_id INT,
    periodo VARCHAR(50),
    semestre VARCHAR(50),
    reset_token VARCHAR(255) UNIQUE,
    reset_token_expires_at DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id),
    FOREIGN KEY (curso_id) REFERENCES Cursos(id),
    UNIQUE (ra, instituicao_id)
);

-- Recria a tabela Avaliacoes (VERSÃO CORRIGIDA E COMPLETA)
CREATE TABLE IF NOT EXISTS Avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    instituicao_id INT NOT NULL,
    curso_id INT NOT NULL,
    media_final DECIMAL(3, 2) NOT NULL,
    
    -- Notas
    nota_infraestrutura INT,
    nota_coordenacao INT,
    nota_direcao INT,
    nota_localizacao INT,
    nota_acessibilidade INT,
    nota_equipamentos INT,
    nota_biblioteca INT,
    nota_didatica INT,
    nota_conteudo INT,
    nota_dinamica_professores INT,
    nota_disponibilidade_professores INT,
    
    -- Comentários
    comentario_infraestrutura TEXT,
    comentario_coordenacao TEXT,
    comentario_direcao TEXT,
    comentario_localizacao TEXT,
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
);

-- Recria a tabela Admins
CREATE TABLE IF NOT EXISTS Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recria a tabela Notificacoes
CREATE TABLE IF NOT EXISTS Notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  mensagem VARCHAR(255) NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);