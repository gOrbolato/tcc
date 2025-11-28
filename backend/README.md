# Backend do Sistema de Avaliação Educacional

Este diretório contém o código-fonte do backend da aplicação. Desenvolvido em Node.js com TypeScript e Express, ele é responsável por toda a lógica de negócio, autenticação, interação com o banco de dados e fornecimento de uma API RESTful para o frontend.

## Funcionalidades Principais

- **Gerenciamento de Usuários e Administradores:** Cadastro, login, atualização de perfil e autenticação baseada em JWT.
- **Sistema de Avaliação:** Submissão e consulta de avaliações de instituições e cursos.
- **Análise de Dados:** Geração de relatórios e análises a partir dos dados de avaliação, utilizando scripts Python para processamento avançado.
- **Gestão de Cursos e Instituições:** CRUD (Criar, Ler, Atualizar, Deletar) para cursos e instituições.
- **Moderação:** Ferramentas administrativas para gerenciar usuários, solicitações de desbloqueio e outros conteúdos.

## Estrutura do Projeto

O projeto segue uma arquitetura em camadas para separar responsabilidades:

- `src/`
  - `config/`: Configurações da aplicação, como a conexão com o banco de dados.
  - `controllers/`: Recebem as requisições HTTP, validam os dados de entrada e chamam os serviços correspondentes.
  - `middlewares/`: Funções que interceptam requisições, como para autenticação (`authMiddleware`) e tratamento de erros.
  - `routes/`: Definição de todas as rotas da API, associando cada endpoint a um controlador.
  - `services/`: Contêm a lógica de negócio principal da aplicação.
  - `scripts/`: Scripts auxiliares, incluindo os scripts Python para análise de dados.
  - `types/`: Definições de tipos e interfaces TypeScript.
- `database.sql`: Script SQL para criar a estrutura inicial do banco de dados.
- `package.json`: Lista de dependências e scripts do projeto.

## Pré-requisitos

- **Node.js:** Versão 18 ou superior.
- **npm:** Geralmente instalado com o Node.js.
- **MySQL:** Um servidor de banco de dados MySQL em execução.
- **Python:** Necessário para a funcionalidade de geração de relatórios.

## Guia de Instalação e Execução

1.  **Clone o Repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd tcc/backend
    ```

2.  **Instale as Dependências do Node.js:**
    Este comando instalará todas as bibliotecas listadas no `package.json`.
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados:**
    - Conecte-se ao seu servidor MySQL.
    - Crie um banco de dados para a aplicação (ex: `CREATE DATABASE meu_banco;`).
    - Execute o script `database.sql` para criar todas as tabelas necessárias.

4.  **Configure as Variáveis de Ambiente:**
    - Renomeie o arquivo `.env.example` para `.env`.
    - Abra o arquivo `.env` e preencha as variáveis com as credenciais do seu banco de dados e outras configurações, como a `JWT_SECRET`.

## Dependência de Python para Relatórios

A funcionalidade de geração de relatórios (`/api/admin/report/download` e outras rotas de análise) depende de scripts Python.

### Configurando o Ambiente Python

1.  **Instale o Python:**
    - Baixe e instale uma versão recente do Python em [python.org](https://www.python.org/downloads/).
    - **Importante:** Durante a instalação, marque a opção "Add Python to PATH" (ou similar) para que o executável `python` fique disponível globalmente no seu terminal.

2.  **Instale as Dependências do Python:**
    - Navegue até o diretório que contém o `requirements.txt`:
      ```bash
      # A partir da raiz de 'backend/'
      cd src/scripts
      ```
    - Instale as bibliotecas com o `pip`:
      ```bash
      pip install -r requirements.txt
      ```

## Como Executar a Aplicação

Para iniciar o servidor em modo de desenvolvimento (que reinicia automaticamente ao detectar alterações nos arquivos), execute:

```bash
npm run dev
```

O servidor estará disponível, por padrão, em `http://localhost:3001` (ou na porta que você definiu no seu arquivo `.env`).

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento com `ts-node-dev`.
- `npm run build`: Compila o código TypeScript para JavaScript (gera o diretório `dist`).
- `npm start`: Inicia o servidor em modo de produção a partir dos arquivos compilados em `dist/`.
- `npm run migrate`: Executa as migrações do banco de dados (atualmente não configurado, mas pode ser implementado).
- `npm run seed`: Popula o banco de dados com dados iniciais (atualmente não configurado).
