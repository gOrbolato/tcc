# Plataforma de Avaliação Educacional

Este projeto é uma aplicação web full-stack projetada para ser uma ponte de comunicação entre alunos e instituições de ensino, permitindo que estudantes avaliem seus cursos e instituições de forma anônima e segura.

## Visão Geral

A plataforma permite que o público geral pesquise e visualize avaliações sobre instituições e cursos. Alunos podem se cadastrar para submeter suas próprias avaliações, enquanto administradores possuem um painel dedicado para gerenciar usuários, instituições e visualizar relatórios consolidados com insights acionáveis.

## Funcionalidades Principais

- **Pesquisa Interativa:** Busca por instituições e cursos.
- **Cadastro e Login de Usuários:** Autenticação segura com JWT.
- **Submissão de Avaliação:** Formulário detalhado para avaliar a instituição e o curso.
- **Painel do Usuário:** Histórico de avaliações e status para a próxima.
- **Recuperação de Senha:** Fluxo seguro via código enviado por e-mail.
- **Painel Administrativo:**
    - Gerenciamento de Usuários, Instituições e Cursos (CRUD).
    - Visualização de Relatórios com análise de tendências.
    - Geração de Resumo Executivo com IA.
    - Download de Relatório em PDF.

## Estrutura do Projeto

O projeto é um monorepo dividido em duas pastas principais: `frontend` e `backend`.

- **`backend/`**: Contém a aplicação Node.js/Express com TypeScript.
    - **`src/`**: Código-fonte da aplicação.
        - **`config/`**: Configuração do banco de dados.
        - **`controllers/`**: Lógica de requisição e resposta HTTP.
        - **`middlewares/`**: Funções de interceptação (auth, erros).
        - **`routes/`**: Definição das rotas da API.
        - **`services/`**: Lógica de negócio principal.
        - **`scripts/`**: Scripts auxiliares (ex: `create-admin.ts`).
        - **`types/`**: Interfaces e tipos de dados.
    - **`database.sql`**: Script para criação do banco de dados.

- **`frontend/`**: Contém a aplicação React com TypeScript e Vite.
    - **`src/`**: Código-fonte da aplicação.
        - **`components/`**: Componentes reutilizáveis (Header, Footer, etc.).
        - **`contexts/`**: Contextos React para gerenciamento de estado global (Auth, Notificação).
        - **`layouts/`**: Estruturas de página (Admin, Usuário).
        - **`pages/`**: Componentes de página, organizados por funcionalidade (auth, admin, user).
        - **`routes/`**: Configuração do roteamento da aplicação.
        - **`services/`**: Configuração do cliente HTTP (Axios).
        - **`types/`**: Interfaces e tipos de dados.
        - **`assets/`**: Imagens e outros arquivos estáticos.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, React Router, Axios, Material-UI, Chart.js.
- **Backend:** Node.js, Express, TypeScript, MySQL, Bcrypt, JWT, Python (`pandas`, `reportlab`).

## Setup e Instalação

### Pré-requisitos
- Node.js (v18+)
- Python (v3.8+)
- MySQL Server
- Git

### 1. Banco de Dados
- Inicie seu servidor MySQL.
- Crie um banco de dados (ex: `CREATE DATABASE tcc;`).
- Execute o script `backend/database.sql` para criar as tabelas.

### 2. Backend
- Navegue até `backend/`.
- Crie um arquivo `.env` a partir do `.env.example` e preencha com suas credenciais do banco de dados.
- Instale as dependências:
  ```bash
  npm install
  ```
- Instale as dependências Python:
  ```bash
  pip install pandas reportlab
  ```
- Inicie o servidor:
  ```bash
  npm run dev
  ```
  O backend rodará em `http://localhost:3001`.

### 3. Frontend
- Em um novo terminal, navegue até `frontend/`.
- Instale as dependências:
  ```bash
  npm install
  ```
- Inicie o servidor:
  ```bash
  npm run dev
  ```
  O frontend estará acessível em `http://localhost:5173`.

### 4. Criando um Administrador
- Com o backend rodando, navegue até `backend/src/scripts`.
- Execute o script:
  ```bash
  ts-node create-admin.ts
  ```
- Siga as instruções para criar seu usuário administrador. Agora você pode fazer login e acessar o painel administrativo.
