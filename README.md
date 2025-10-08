
# Plataforma de Avaliação Educacional

Este projeto é uma aplicação web full-stack projetada para ser uma ponte de comunicação entre alunos e instituições de ensino, permitindo que estudantes avaliem seus cursos e instituições de forma anônima e segura.

## Visão Geral

A plataforma permite que o público geral pesquise e visualize avaliações sobre instituições e cursos. Alunos podem se cadastrar para submeter suas próprias avaliações, enquanto administradores possuem um painel dedicado para gerenciar usuários, instituições e visualizar relatórios consolidados.

## Principais Funcionalidades

### Para Usuários e Visitantes
- **Pesquisa Pública:** Busca por instituições, cursos e cidades para visualizar avaliações.
- **Cadastro de Usuário:** Processo de registro validado para alunos.
- **Login Unificado:** Um único ambiente de login que redireciona usuários comuns e administradores para seus respectivos painéis.
- **Submissão de Avaliação:** Formulário detalhado para avaliar a instituição e o curso.
- **Dashboard do Usuário:** Visualização do histórico de avaliações submetidas.
- **Recuperação de Senha:** Fluxo seguro de redefinição de senha por e-mail.

### Para Administradores
- **Dashboard de Admin:** Painel central com acesso às funcionalidades de gerenciamento.
- **CRUD de Usuários:** Gerenciamento completo (Criar, Ler, Atualizar, Deletar) de usuários da plataforma.
- **CRUD de Instituições e Cursos:** Gerenciamento de instituições de ensino e seus respectivos cursos.
- **Visualização de Relatórios:** Acesso a relatórios e análises gerados a partir dos dados das avaliações.

## Melhorias e Refatorações Implementadas

Durante o desenvolvimento, diversas melhorias foram implementadas para garantir a qualidade e estabilidade do código:

- **Correção Crítica de Rotas:** Implementação de um sistema de rotas protegidas (`ProtectedRoute`) e adição de todas as páginas da aplicação, que antes estavam inacessíveis.
- **Padronização de Chamadas à API:** Substituição de chamadas `fetch` por uma instância padronizada do `axios`, centralizando a lógica de autenticação e tratamento de erros.
- **Refatoração de Layout:** Criação de um componente reutilizável (`AuthLayout`) para as páginas de autenticação, eliminando duplicação de código e garantindo consistência visual.
- **Correção de Bugs:** Resolução de múltiplos erros de compilação no backend (funções e importações ausentes) e de um erro crítico no frontend que resultava em uma página em branco.
- **Consistência de Design:** Unificação dos estilos de tabelas e garantia de que o layout principal (Header/Footer) seja exibido corretamente.

## Medidas de Segurança e Anonimato

A segurança dos dados e o anonimato do usuário são pilares deste projeto.

- **Hashing de Senhas:** Todas as senhas de usuários e administradores são criptografadas com o algoritmo **bcrypt** antes de serem armazenadas no banco de dados.
- **Prevenção de SQL Injection:** O backend utiliza queries parametrizadas (`?`) em todas as interações com o banco de dados, prevenindo ataques de injeção de SQL.
- **Variáveis de Ambiente (`.env`):** Dados sensíveis como credenciais do banco de dados e o segredo do JWT são mantidos fora do código-fonte, em um arquivo `.env`.
- **Autenticação via JWT:** O acesso a rotas protegidas é controlado por JSON Web Tokens, garantindo que apenas usuários autenticados possam acessar áreas restritas.
- **Anonimato nas Avaliações:** A API foi projetada para **nunca** expor dados pessoais (nome, CPF, RA, e-mail) do autor de uma avaliação ao listar ou agregar os dados para relatórios. A conexão existe apenas no banco de dados para integridade, mas não é exposta externamente.
- **Validação de Dados:** Implementação de validação de CPF no frontend para melhorar a qualidade dos dados de entrada.

## Tech Stack

- **Frontend:**
  - React com TypeScript
  - Vite (Build Tool)
  - React Router (Roteamento)
  - Axios (Cliente HTTP)

- **Backend:**
  - Node.js com Express e TypeScript
  - MySQL (`mysql2`)
  - Bcrypt (Hashing de Senhas)
  - JSON Web Token (Autenticação)

## Setup e Instalação

1.  **Banco de Dados:**
    - Garanta que você tenha um servidor MySQL rodando.
    - Crie o banco de dados e as tabelas executando o script do arquivo `backend/database.sql`.

2.  **Backend:**
    - Navegue até a pasta `backend`.
    - Crie um arquivo `.env` a partir do exemplo fornecido e preencha com suas credenciais.
    - Rode `npm install` para instalar as dependências.
    - Rode `npm run dev` para iniciar o servidor.

3.  **Frontend:**
    - Em um novo terminal, navegue até a pasta `frontend`.
    - Rode `npm install` para instalar as dependências.
    - Rode `npm run dev` para iniciar o servidor de desenvolvimento.
    - Acesse a URL local fornecida pelo Vite (geralmente `http://localhost:5173`).
