"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../config/database"));
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
const createAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Iniciando script para criar/atualizar admin...');
    try {
        // Criptografa a senha definida acima
        const hashedPassword = yield bcrypt_1.default.hash(ADMIN_SENHA_PLANA, 10);
        console.log('Senha criptografada com sucesso.');
        // Query SQL que insere um novo admin, ou atualiza a senha se o e-mail já existir
        const query = `
      INSERT INTO Admins (nome, email, senha)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE senha = ?;
    `;
        const values = [ADMIN_NOME, ADMIN_EMAIL, hashedPassword, hashedPassword];
        // Executa a query
        yield database_1.default.query(query, values);
        console.log('\n****************************************************************');
        console.log('Usuário administrador criado/atualizado com sucesso!\n');
        console.log(`E-mail: ${ADMIN_EMAIL}`);
        console.log(`Senha: ${ADMIN_SENHA_PLANA}`);
        console.log('\nPor favor, use estas credenciais para fazer login no sistema.');
        console.log('****************************************************************');
    }
    catch (error) {
        console.error('Ocorreu um erro ao executar o script:', error);
    }
    finally {
        // Fecha a conexão com o banco de dados
        yield database_1.default.end();
        console.log('Conexão com o banco de dados fechada.');
    }
});
// Executa a função
createAdmin();
