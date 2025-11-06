
import bcrypt from 'bcrypt';
import pool from '../config/database';

/*
cd C:\Users\GuilhermeOrbolato\Desktop\tcc\backend

# instalar ts-node se ainda não tiver
npm install --save-dev ts-node

# executar o script
npx ts-node src/scripts/create-admin.ts
*/

// --- CONFIGURAÇÕES ---
const ADMIN_EMAIL = 'orbolato.guilherme@gmail.com'; // adic
const ADMIN_NOME = 'Guilherme Admin';
const ADMIN_SENHA_PLANA = 'Eumesmo1993'; // A senha que você vai usar para logar
//const ADMIN_EMAIL = 'fnakano03@gmail.com'; // adicione o e-mail desejado aqui
//const ADMIN_NOME = 'Felipe Admin';
//const ADMIN_SENHA_PLANA = '@ForWork65'; // A senha que você vai usar para logar
// ---------------------

const createAdmin = async () => {
  console.log('Iniciando script para criar/atualizar admin...');

  try {
    // Criptografa a senha definida acima
    const hashedPassword = await bcrypt.hash(ADMIN_SENHA_PLANA, 10);
    console.log('Senha criptografada com sucesso.');

    // Query SQL que insere um novo admin, ou atualiza a senha se o e-mail já existir
    const query = `
      INSERT INTO Admins (nome, email, senha)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE senha = ?;
    `;

    const values = [ADMIN_NOME, ADMIN_EMAIL, hashedPassword, hashedPassword];

    // Executa a query
    await pool.query(query, values);

    console.log('\n****************************************************************');
    console.log('Usuário administrador criado/atualizado com sucesso!\n');
    console.log(`E-mail: ${ADMIN_EMAIL}`);
    console.log(`Senha: ${ADMIN_SENHA_PLANA}`);
    console.log('\nPor favor, use estas credenciais para fazer login no sistema.');
    console.log('****************************************************************');

  } catch (error) {
    console.error('Ocorreu um erro ao executar o script:', error);
  } finally {
    // Fecha a conexão com o banco de dados
    await pool.end();
    console.log('Conexão com o banco de dados fechada.');
  }
};

// Executa a função
createAdmin();
