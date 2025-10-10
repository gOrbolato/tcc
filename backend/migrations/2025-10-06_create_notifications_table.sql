-- Migração para criar a tabela de Notificacoes
-- Esta tabela armazenará os pedidos de reativação de matrícula dos usuários.

CREATE TABLE IF NOT EXISTS Notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  mensagem VARCHAR(255) NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);
