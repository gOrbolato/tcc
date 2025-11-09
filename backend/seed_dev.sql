-- Development seed: one institution and one admin
-- Usage: run `mysql -u root -p tcc < seed_dev.sql` after importing database.sql

USE `tcc`;

INSERT INTO Instituicoes (nome, latitude, longitude, is_active)
VALUES ('Instituição de Teste', NULL, NULL, TRUE)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Create a dev admin. To generate the bcrypt hash, run the node script `node hash-admin.js "yourpassword"`
-- Then paste the resulting hash below in place of <BCRYPT_HASH>

-- Example (do not run until you've replaced <BCRYPT_HASH>):
-- INSERT INTO Admins (nome, email, senha) VALUES ('Dev Admin', 'admin@example.com', '<BCRYPT_HASH>');

-- Alternatively, create a plaintext password user for quick local testing (not recommended for production):
-- INSERT INTO Admins (nome, email, senha) VALUES ('Dev Admin', 'admin@example.com', '$2b$10$ABCDEFG...');

-- If you prefer automatic insertion with a weak unhashed password for quick testing, uncomment below (NOT recommended):
-- INSERT INTO Admins (nome, email, senha) VALUES ('Dev Admin', 'admin@example.com', 'devpassword');
