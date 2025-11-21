// scripts/seed_advanced.ts
import { faker } from '@faker-js/faker/locale/pt_BR';
import bcrypt from 'bcrypt';
import pool from '../src/config/database';
import { OkPacket } from 'mysql2';

const BATCH_SIZE = 50; // Process users in batches to avoid memory issues

const log = (message: string) => console.log(`[SEED] ${message}`);

async function clearDatabase() {
  log('Clearing database...');
  const connection = await pool.getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE Avaliacoes;');
    await connection.query('TRUNCATE TABLE Desbloqueios;');
    await connection.query('TRUNCATE TABLE Usuarios;');
    await connection.query('TRUNCATE TABLE Cursos;');
    await connection.query('TRUNCATE TABLE Instituicoes;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    log('Database cleared successfully.');
  } finally {
    connection.release();
  }
}

async function seedInstitutions() {
  log('Seeding institutions...');
  const institutions = [
    {
      nome: 'Faculdade de Tecnologia de Presidente Prudente',
      cidade: 'Presidente Prudente',
      estado: 'SP',
    },
    {
      nome: 'Faculdade de Ciências e Tecnologia - Presidente Prudente',
      cidade: 'Presidente Prudente',
      estado: 'SP',
    },
  ];

  const [fatecResult] = await pool.query<OkPacket>(
    'INSERT INTO Instituicoes (nome, cidade, estado) VALUES (?, ?, ?)',
    [institutions[0].nome, institutions[0].cidade, institutions[0].estado]
  );
  const fatecId = fatecResult.insertId;

  const [fctResult] = await pool.query<OkPacket>(
    'INSERT INTO Instituicoes (nome, cidade, estado) VALUES (?, ?, ?)',
    [institutions[1].nome, institutions[1].cidade, institutions[1].estado]
  );
  const fctId = fctResult.insertId;

  log('Institutions seeded.');
  return { fatecId, fctId };
}

async function seedCursos(fatecId: number, fctId: number) {
  log('Seeding cursos...');
  const fatecCursos = [
    'Análise e Desenvolvimento de Sistemas',
    'Gestão Empresarial',
    'Produção Agropecuária',
    'Eventos',
  ];
  const fctCursos = [
    'Ciência da Computação',
    'Engenharia Ambiental',
    'Engenharia Cartográfica e de Agrimensura',
    'Estatística',
    'Física',
    'Geografia',
    'Matemática',
    'Pedagogia',
    'Química',
  ];

  for (const curso of fatecCursos) {
    await pool.query('INSERT INTO Cursos (nome, instituicao_id) VALUES (?, ?)', [curso, fatecId]);
  }
  for (const curso of fctCursos) {
    await pool.query('INSERT INTO Cursos (nome, instituicao_id) VALUES (?, ?)', [curso, fctId]);
  }

  const [cursosFatec] = await pool.query<any[]>('SELECT id FROM Cursos WHERE instituicao_id = ?', [fatecId]);
  const [cursosFct] = await pool.query<any[]>('SELECT id FROM Cursos WHERE instituicao_id = ?', [fctId]);

  log('Cursos seeded.');
  return {
    cursosFatecIds: cursosFatec.map((c: any) => c.id),
    cursosFctIds: cursosFct.map((c: any) => c.id),
  };
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedUsersAndEvaluations(
  institutionId: number,
  courseIds: number[],
  userCount: number
) {
  log(`Seeding ${userCount} users and their evaluations for institution ${institutionId}...`);
  const hashedPassword = await bcrypt.hash('Senha@123', 10);

  for (let i = 0; i < userCount; i++) {
    const nome = faker.person.fullName();
    const email = faker.internet.email({ firstName: nome.split(' ')[0], lastName: nome.split(' ')[1] }).toLowerCase();
    const ra = faker.string.numeric(8);
    const cpf = faker.string.numeric(11);
    const cursoId = getRandomItem(courseIds);
    const isTrancado = Math.random() < 0.1; // 10% chance of being locked

    const [userInsertResult] = await pool.query<OkPacket>(
      'INSERT INTO Usuarios (nome, email, senha, ra, cpf, instituicao_id, curso_id, is_trancado, anonymized_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())',
      [nome, email, hashedPassword, ra, cpf, institutionId, cursoId, isTrancado]
    );
    const userId = userInsertResult.insertId;

    // Create unlock request for some locked users
    if (isTrancado && Math.random() < 0.5) {
      await pool.query(
        'INSERT INTO Desbloqueios (usuario_id, motivo, status) VALUES (?, ?, ?)',
        [userId, faker.lorem.sentence(), 'PENDING']
      );
    }

    // Create evaluations for 80% of users
    if (Math.random() < 0.8) {
      const nota_infraestrutura = faker.number.int({ min: 1, max: 5 });
      const nota_coordenacao = faker.number.int({ min: 1, max: 5 });
      const nota_direcao = faker.number.int({ min: 1, max: 5 });
      const nota_didatica = faker.number.int({ min: 1, max: 5 });
      const nota_conteudo = faker.number.int({ min: 1, max: 5 });
      const media_final = (nota_infraestrutura + nota_coordenacao + nota_direcao + nota_didatica + nota_conteudo) / 5;

      await pool.query(
        `INSERT INTO Avaliacoes (usuario_id, instituicao_id, curso_id, media_final, nota_infraestrutura, comentario_infraestrutura, nota_coordenacao, comentario_coordenacao, nota_direcao, comentario_direcao, nota_didatica, comentario_didatica, nota_conteudo, comentario_conteudo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          institutionId,
          cursoId,
          media_final,
          nota_infraestrutura,
          faker.lorem.sentence(),
          nota_coordenacao,
          faker.lorem.sentence(),
          nota_direcao,
          faker.lorem.sentence(),
          nota_didatica,
          faker.lorem.sentence(),
          nota_conteudo,
          faker.lorem.sentence(),
        ]
      );
    }
    if ((i + 1) % BATCH_SIZE === 0) {
      log(`Seeded ${i + 1}/${userCount} users for institution ${institutionId}`);
    }
  }
}

async function main() {
  try {
    await clearDatabase();
    const { fatecId, fctId } = await seedInstitutions();
    const { cursosFatecIds, cursosFctIds } = await seedCursos(fatecId, fctId);
    await seedUsersAndEvaluations(fatecId, cursosFatecIds, 100);
    await seedUsersAndEvaluations(fctId, cursosFctIds, 100);
    log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
    log('Database connection closed.');
  }
}

main();
