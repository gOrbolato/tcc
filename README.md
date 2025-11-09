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
- **Painel do Usuário:** Visualização do histórico de avaliações submetidas, com contagem regressiva para a próxima avaliação disponível.
- **Recuperação de Senha Aprimorada:** Fluxo seguro de redefinição de senha via código enviado por e-mail, com validação e regras de segurança para a nova senha.

### Para Administradores
- **Dashboard de Admin:** Painel central com acesso às funcionalidades de gerenciamento e visualização de notificações pendentes.
- **CRUD de Usuários:** Gerenciamento completo (Criar, Ler, Atualizar, Deletar) de usuários da plataforma.
- **CRUD de Instituições e Cursos:** Gerenciamento de instituições de ensino e seus respectivos cursos.
- **Visualização de Relatórios Detalhados:** Acesso a relatórios e análises gerados a partir dos dados das avaliações, agora com funcionalidades aprimoradas:
  - **Visão Geral Unificada:** Relatório consolidado que apresenta um panorama completo da instituição/curso.
  - **Análise de Tendências:** Compare o desempenho atual com períodos anteriores (semestral ou anual, com base em períodos fixos).
  - **Resumo Executivo:** Um parágrafo gerado por IA que sintetiza os principais pontos fortes e de atenção do relatório.
  - **Sugestões e Insights Aprimorados:** Análises mais detalhadas, incluindo polarização de notas e recomendações acionáveis.
  - **Download de Relatório em PDF:** Baixe o relatório completo em formato PDF para fácil compartilhamento.

## Melhorias e Refatorações Implementadas

Durante o desenvolvimento recente, diversas melhorias e correções críticas foram implementadas:

- **Refatoração da Página de Relatórios:** A página de relatórios foi unificada para exibir a "Visão Geral" por padrão, removendo a alternância entre visões e focando nos insights mais relevantes.
- **Implementação do Resumo Executivo:** Adição de um resumo gerado por IA para fornecer uma visão de alto nível da análise.
- **Aprimoramento da Lógica de Sugestões:** As sugestões agora são mais detalhadas, considerando a polarização das notas e oferecendo recomendações mais específicas.
- **Funcionalidade de Download de PDF:** Implementação completa da geração e download de relatórios em formato PDF, utilizando um script Python no backend.
- **Ajuste da Lógica de Datas para Tendências:** A análise de tendências (semestral/anual) agora utiliza períodos fixos (semestres e anos completos anteriores) para maior clareza e relevância histórica.
- **Correção de Múltiplos Bugs Críticos:** Resolução de erros de compilação, erros de tipagem (TypeScript), problemas de carregamento infinito, erros de conexão com o backend e falhas no script Python, garantindo a estabilidade e funcionalidade do sistema.
- **Padronização de Design:** Unificação completa do design de todas as páginas da área do usuário e do administrador, seguindo o padrão visual da página Home (sem header/footer), utilizando um sistema de seções e cards consistente.
- **Fluxo de Autenticação Robusto:** Correção de bugs de carregamento e redirecionamento em páginas protegidas, garantindo que o estado de autenticação seja sempre verificado antes da renderização do conteúdo.
- **Integração Python para Análise:** Implementação de um script Python para análise avançada de avaliações, gerando sugestões e insights para o painel administrativo.
- **Sistema de Avaliação Interativo:** Substituição do sistema de estrelas por carinhas dinâmicas e interativas no formulário de avaliação.
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
  - Python (Análise de Dados, Geração de Sugestões e PDF)
    - Bibliotecas Python: `pandas`, `reportlab`

## Setup e Instalação

Para configurar o ambiente de desenvolvimento, siga os passos abaixo:

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Python (versão 3.8 ou superior)
- MySQL Server
- Git

### 1. Configuração do Banco de Dados
- Garanta que você tenha um servidor MySQL rodando.
- Crie um banco de dados chamado `tcc` (ou o nome que preferir, ajustando no `.env` do backend).
- Execute o script SQL localizado em `backend/database.sql` no seu cliente MySQL para criar as tabelas necessárias.

### 2. Configuração do Backend
- Navegue até a pasta `backend` no seu terminal.
- Crie um arquivo `.env` na raiz da pasta `backend` com base no exemplo (`.env.example` se existir) e preencha com suas credenciais (ex: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).
- Instale as dependências Node.js:
  ```bash
  npm install
  ```
- Instale as dependências Python necessárias para os scripts de análise e PDF:
  ```bash
  C:\Users\GuilhermeOrbolato\AppData\Local\Programs\Python\Python311\python.exe -m pip install pandas reportlab
  ```
  *(Certifique-se de que o caminho para o executável Python está correto para o seu sistema.)*
- Inicie o servidor de desenvolvimento do backend:
  ```bash
  npm run dev
  ```
  O servidor estará rodando em `http://localhost:3001`.

### 3. Configuração do Frontend
- Em um novo terminal, navegue até a pasta `frontend`.
- Instale as dependências Node.js:
  ```bash
  npm install
  ```
- Inicie o servidor de desenvolvimento do frontend:
  ```bash
  npm run dev
  ```
  A aplicação estará acessível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

## Primeiros Passos e Utilização

### Cadastro de Administrador
Para acessar o painel administrativo e todas as funcionalidades de gerenciamento e relatórios, você precisará criar um usuário administrador:
1.  Com o backend rodando, navegue até a pasta `backend/src/scripts` no seu terminal.
2.  Execute o script de criação de administrador:
    ```bash
    ts-node create-admin.ts
    ```
3.  Siga as instruções no terminal para inserir o nome, e-mail e senha do novo administrador.

### Fluxo Básico de Uso
1.  **Acesse o Frontend:** Abra `http://localhost:5173` no seu navegador.
2.  **Login:** Utilize as credenciais do administrador que você acabou de criar para fazer login.
3.  **Navegue:** Explore o painel administrativo para gerenciar usuários, instituições, cursos e acessar os relatórios de avaliações.
4.  **Relatórios:** Na seção de relatórios, selecione uma instituição (e opcionalmente um curso) e clique em "Procurar" para gerar a análise. Utilize os botões "Semestral" e "Anual" para comparar períodos e o botão "Download PDF" para baixar o relatório.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.
