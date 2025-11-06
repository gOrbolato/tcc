-- Seed migration: demo evaluation from screenshot (media_final = 3.64)
USE avaliacao_educacional;

-- 1) Ensure institution exists
INSERT INTO Instituicoes (nome)
SELECT 'Faculdade de Tecnologia de Presidente Prudente - Análise e Desenvolvimento de Sistemas'
WHERE NOT EXISTS (SELECT 1 FROM Instituicoes WHERE nome = 'Faculdade de Tecnologia de Presidente Prudente - Análise e Desenvolvimento de Sistemas');

SET @instituicao_id = (SELECT id FROM Instituicoes WHERE nome = 'Faculdade de Tecnologia de Presidente Prudente - Análise e Desenvolvimento de Sistemas' LIMIT 1);

-- 2) Ensure course exists for that institution
INSERT INTO Cursos (nome, instituicao_id)
SELECT 'Análise e Desenvolvimento de Sistemas', @instituicao_id
WHERE NOT EXISTS (SELECT 1 FROM Cursos WHERE nome = 'Análise e Desenvolvimento de Sistemas' AND instituicao_id = @instituicao_id);

SET @curso_id = (SELECT id FROM Cursos WHERE nome = 'Análise e Desenvolvimento de Sistemas' AND instituicao_id = @instituicao_id LIMIT 1);

-- 3) Create a demo user if not exists (anonymized)
INSERT INTO Usuarios (nome, cpf, ra, email, senha, instituicao_id, curso_id, anonymized_id)
SELECT 'Aluno Demo', NULL, '000000', 'demo+aluno@example.com', 'demo-password', @instituicao_id, @curso_id, 'demo_user_1'
WHERE NOT EXISTS (SELECT 1 FROM Usuarios WHERE anonymized_id = 'demo_user_1');

SET @usuario_id = (SELECT id FROM Usuarios WHERE anonymized_id = 'demo_user_1' LIMIT 1);

-- 4) Insert the evaluation with media_final = 3.64 (will fill nota_* as NULL)
INSERT INTO Avaliacoes (usuario_id, instituicao_id, curso_id, media_final, criado_em)
VALUES (@usuario_id, @instituicao_id, @curso_id, 3.64, NOW());

SET @avaliacao_id = LAST_INSERT_ID();

-- 5) Optional: insert skeleton rows into AvaliacaoRespostas (question_key matches our mapping keys)
INSERT INTO AvaliacaoRespostas (avaliacao_id, question_id, question_key, nota, comentario)
VALUES
(@avaliacao_id, 101, 'infraestrutura', NULL, NULL),
(@avaliacao_id, 102, 'equipamentos', NULL, NULL),
(@avaliacao_id, 103, 'biblioteca', NULL, NULL),
(@avaliacao_id, 104, 'suporte_mercado', NULL, NULL),
(@avaliacao_id, 105, 'localizacao', NULL, NULL),
(@avaliacao_id, 106, 'acessibilidade', NULL, NULL),
(@avaliacao_id, 107, 'direcao', NULL, NULL),
(@avaliacao_id, 108, 'coordenacao', NULL, NULL),
(@avaliacao_id, 109, 'didatica', NULL, NULL),
(@avaliacao_id, 110, 'dinamica_professores', NULL, NULL),
(@avaliacao_id, 111, 'disponibilidade_professores', NULL, NULL),
(@avaliacao_id, 112, 'conteudo', NULL, NULL);

-- Done. You can adjust the user or add nota/comentario values as needed.
