// Importa a biblioteca mysql2/promise para interagir com o banco de dados MySQL de forma assíncrona.
import mysql from 'mysql2/promise';
// Importa a biblioteca dotenv para carregar variáveis de ambiente de um arquivo .env.
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env para process.env.
dotenv.config();

// Cria um pool de conexões com o banco de dados MySQL.
const pool = mysql.createPool({
  // O host do banco de dados, obtido das variáveis de ambiente.
  host: process.env.DB_HOST,
  // O usuário do banco de dados, obtido das variáveis de ambiente.
  user: process.env.DB_USER,
  // A senha do banco de dados, obtida das variáveis de ambiente.
  password: process.env.DB_PASSWORD,
  // O nome do banco de dados, obtido das variáveis de ambiente.
  database: process.env.DB_NAME,
  // Se deve esperar por conexões quando não houver nenhuma disponível no pool.
  waitForConnections: true,
  // O número máximo de conexões a serem criadas de uma só vez.
  connectionLimit: 10,
  // O limite máximo de solicitações de conexão na fila. 0 significa sem limite.
  queueLimit: 0
});

// Exporta o pool de conexões para ser usado em outras partes da aplicação.
export default pool;
