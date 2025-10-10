# Plataforma de Avaliação Educacional

Este projeto é uma aplicação web full-stack projetada para ser uma ponte de comunicação entre alunos e instituições de ensino, permitindo que estudantes avaliem seus cursos e instituições de forma anônima e segura.

## Visão Geral

A plataforma permite que o público geral pesquise e visualize avaliações sobre instituições e cursos diretamente na página inicial. Alunos podem se cadastrar para submeter suas próprias avaliações, enquanto administradores possuem um painel dedicado para gerenciar usuários, instituições e visualizar relatórios consolidados com insights acionáveis.

## Principais Funcionalidades

### Para Usuários e Visitantes
- **Pesquisa Interativa:** Busca por instituições e cursos diretamente na Home page, exibindo médias e permitindo a navegação entre instituições e seus cursos.
- **Cadastro de Usuário:** Processo de registro validado para alunos.
- **Login Unificado:** Um único ambiente de login que redireciona usuários comuns e administradores para seus respectivos painéis.
- **Submissão de Avaliação:** Formulário detalhado para avaliar a instituição e o curso, com sistema de votação por carinhas interativas e campo para observações.
- **Dashboard do Usuário:** Visualização do histórico de avaliações submetidas, com contagem regressiva para a próxima avaliação disponível.
- **Recuperação de Senha Aprimorada:** Fluxo seguro de redefinição de senha via código enviado por e-mail, com validação e regras de segurança para a nova senha.

### Para Administradores
- **Dashboard de Admin:** Painel central com acesso às funcionalidades de gerenciamento e visualização de notificações pendentes.
- **CRUD de Usuários:** Gerenciamento completo (Criar, Ler, Atualizar, Deletar) de usuários da plataforma.
- **CRUD de Instituições e Cursos:** Gerenciamento de instituições de ensino e seus respectivos cursos.
- **Visualização de Relatórios Detalhados:** Acesso a relatórios e análises gerados a partir dos dados das avaliações, incluindo:
  - Médias gerais e por pergunta.
  - Gráficos de barras para visualização das médias.
  - Sugestões e insights acionáveis gerados por análise de dados (Python), indicando pontos fortes, pontos de atenção e pontos críticos.
  - Opção de download de relatório em PDF.

## Melhorias e Refatorações Implementadas

Durante o desenvolvimento, diversas melhorias foram implementadas para garantir a qualidade e estabilidade do código:

- **Padronização de Design:** Unificação completa do design de todas as páginas da área do usuário e do administrador, seguindo o padrão visual da página Home (sem header/footer), utilizando um sistema de seções e cards consistente.
- **Fluxo de Autenticação Robusto:** Correção de bugs de carregamento e redirecionamento em páginas protegidas, garantindo que o estado de autenticação seja sempre verificado antes da renderização do conteúdo.
- **Integração Python para Análise:** Implementação de um script Python para análise avançada de avaliações, gerando sugestões e insights para o painel administrativo.
- **Sistema de Avaliação Interativo:** Substituição do sistema de estrelas por carinhas dinâmicas e interativas no formulário de avaliação.
- **Correção de Bugs Críticos:** Resolução de múltiplos erros de compilação, erros de tipagem (TypeScript), problemas de carregamento infinito e erros de conexão com o backend.
- **Melhoria na Experiência do Usuário:** Adição de contagem regressiva para o cooldown de avaliações e mensagens mais claras.

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
  - Chart.js e React-Chartjs-2 (Visualização de Dados)

- **Backend:**
  - Node.js com Express e TypeScript
  - MySQL (`mysql2`)
  - Bcrypt (Hashing de Senhas)
  - JSON Web Token (Autenticação)
  - Python (Análise de Dados e Geração de Sugestões)

## Setup e Instalação

1.  **Banco de Dados:**
    - Garanta que você tenha um servidor MySQL rodando.
    - Execute o script do arquivo `backend/database.sql` no seu cliente MySQL para criar as tabelas.

2.  **Backend:**
    - Navegue até a pasta `backend`.
    - Crie um arquivo `.env` a partir do exemplo fornecido e preencha com suas credenciais (incluindo `JWT_SECRET`).
    - Rode `npm install` para instalar as dependências.
    - **Instale as dependências Python:** Navegue até `backend/src/scripts` e rode `py -m pip install -r requirements.txt`.
    - Rode `npm run dev` para iniciar o servidor.
    - **Crie um usuário administrador:** Navegue até `backend/src/scripts` e rode `ts-node create-admin.ts`. Siga as instruções.

3.  **Frontend:**
    - Em um novo terminal, navegue até a pasta `frontend`.
    - Rode `npm install` para instalar as dependências.
    - Rode `npm run dev` para iniciar o servidor de desenvolvimento.
    - Acesse a URL local fornecida pelo Vite (geralmente `http://localhost:5173`).

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.