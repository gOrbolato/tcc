-- Migração para adicionar novas colunas de notas na tabela Avaliacoes

ALTER TABLE Avaliacoes
ADD COLUMN nota_coordenacao INT,
ADD COLUMN nota_direcao INT,
ADD COLUMN nota_localizacao INT,
ADD COLUMN nota_acessibilidade INT,
ADD COLUMN nota_equipamentos INT,
ADD COLUMN nota_biblioteca INT,
ADD COLUMN nota_didatica INT,
ADD COLUMN nota_conteudo INT,
ADD COLUMN nota_dinamica_professores INT,
ADD COLUMN nota_disponibilidade_professores INT;
