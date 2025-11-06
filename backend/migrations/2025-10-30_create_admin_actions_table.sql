-- Migração: tabela para logs de ações de admins
CREATE TABLE IF NOT EXISTS AdminActions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  target_user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
