# Sistema de Avaliação Educacional

## Visão Geral

O "Sistema de Avaliação Educacional" é uma plataforma web desenvolvida para permitir que alunos avaliem suas instituições de ensino, cursos e professores de forma anônima e segura. O sistema coleta essas avaliações e, com o auxílio de análises de dados, gera relatórios detalhados para administradores, oferecendo insights valiosos sobre a qualidade do ensino.

A aplicação é responsiva, projetada para funcionar tanto em dispositivos móveis quanto em desktops, e segue padrões modernos de UI/UX para uma experiência interativa e agradável.

## Tecnologias Utilizadas

*   **Frontend:**
    *   **React:** Biblioteca JavaScript para construção de interfaces de usuário.
    *   **Vite:** Ferramenta de build rápido para projetos web.
    *   **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
    *   **CSS:** Para estilização e responsividade.
    *   **React Router DOM:** Para gerenciamento de rotas na aplicação.
    *   **Chart.js & React-Chartjs-2:** Para visualização de dados em gráficos no painel administrativo.
    *   **UUID:** Para geração de IDs únicos (usado em notificações).

*   **Backend:**
    *   **Node.js:** Ambiente de execução JavaScript no servidor.
    *   **Express.js:** Framework web para Node.js, para construção de APIs RESTful.
    *   **TypeScript:** Para tipagem estática no código do servidor.
    *   **MySQL:** Sistema de gerenciamento de banco de dados relacional.
    *   **`mysql2/promise`:** Driver MySQL para Node.js com suporte a Promises.
    *   **`dotenv`:** Para carregar variáveis de ambiente.
    *   **`jsonwebtoken` (JWT):** Para autenticação baseada em tokens.
    *   **`bcrypt`:** Para hash seguro de senhas.
    *   **`cors`:** Para habilitar requisições de diferentes origens (frontend).
    *   **`express-validator`:** Para validação robusta de dados de entrada nas APIs.
    *   **`child_process`:** Módulo Node.js para executar scripts externos (usado para chamar o Python).

*   **Análise de Dados (Integrada ao Backend):**
    *   **Python:** Utilizado para realizar análises estatísticas e agregação de dados mais complexas para os relatórios administrativos.

## Funcionalidades Principais

### Frontend

1.  **Página Home:**
    *   Solicitação de consentimento de cookies e localização ao usuário.
    *   Cabeçalho com nome do sistema, links para Login e Criação de Conta.
    *   Seção explicativa sobre o sistema (propósito, segurança, anonimato).
    *   Quadro de pesquisa por instituição, curso ou cidade (placeholder).
    *   Seção de "Criadores" com foto, nome e cargo.
    *   Rodapé informativo.

2.  **Página Login:**
    *   Layout responsivo com divisão de tela (35% nome do sistema, 65% formulário).
    *   Formulário de login com e-mail e senha.
    *   Opção para visualizar a senha.
    *   Feedback visual de carregamento e notificações de erro/sucesso.
    *   Link para a página de Cadastro e Recuperação de Senha.

3.  **Página de Cadastro:**
    *   Layout responsivo com divisão de tela (35% nome do sistema, 65% formulário).
    *   Formulário para Nome Completo, CPF, RA, Idade, E-mail, Senha (com validação de requisitos), Confirmação de Senha.
    *   **Seleção Dinâmica:** Dropdowns para Instituição e Curso, populados via API e filtrados pela instituição selecionada.
    *   Seleção de Período (Diurno, Noturno, Integral) e Módulo/Semestre.
    *   Feedback visual de carregamento e notificações de erro/sucesso.
    *   Link para a página de Login.

4.  **Página de Recuperação de Senha:**
    *   Layout responsivo com divisão de tela.
    *   Formulário para solicitar recuperação (inserir e-mail).
    *   Formulário para redefinir senha (inserir token e nova senha).
    *   Feedback visual de carregamento e notificações de erro/sucesso.

5.  **Página de Dashboard do Usuário/Aluno:**
    *   Cabeçalho com menu (Perfil, Sair).
    *   Identificação anônima do usuário (ex: "Aluno(a)-XXXXX").
    *   Botão para "Fazer Avaliação".
    *   Seção "Últimas Avaliações" com data, instituição, média final.
    *   (Funcionalidade futura: Popup para ver detalhes da avaliação).
    *   Feedback visual de carregamento e notificações de erro/sucesso.

6.  **Página de Perfil:**
    *   Formulário para atualizar senha, curso, instituição e período.
    *   Dropdowns para Instituição e Curso, populados dinamicamente.
    *   Feedback visual de carregamento e notificações de erro/sucesso.

7.  **Página de Avaliação:**
    *   Formulário com perguntas sobre Instituição (Infraestrutura, etc.) e Curso (Material Didático, etc.).
    *   Input de nota (1 a 5) e campo de observações para cada pergunta.
    *   Dropdowns para Instituição e Curso, populados via API e filtrados.
    *   Feedback visual de carregamento e notificações de erro/sucesso.
    *   (Lógica de backend: Restrições de edição e frequência de avaliação).

8.  **Página de Dashboard do Administrador:**
    *   Cabeçalho com links para Sair, Gerenciar Admins e Gerenciar Instituições/Cursos.
    *   Campo de pesquisa (placeholder).
    *   Botão "Baixar Relatórios" (placeholder).
    *   Seção "Análises" com **gráficos** (Chart.js) e resumos textuais dos relatórios gerados pelo backend (via Python).
    *   Feedback visual de carregamento e notificações de erro/sucesso.

9.  **Página de Gerenciamento de Administradores (Admin):**
    *   Interface para criar, listar e excluir usuários administradores.
    *   Feedback visual de carregamento e notificações de erro/sucesso.

10. **Página de Gerenciamento de Instituições e Cursos (Admin):**
    *   Interface para criar, listar e excluir instituições.
    *   Interface para criar, listar e excluir cursos (associados a instituições).
    *   Feedback visual de carregamento e notificações de erro/sucesso.

### Backend

*   **APIs RESTful:** Endpoints para todas as funcionalidades do frontend (autenticação, perfil, avaliações, admin, consentimento, instituições, cursos).
*   **Autenticação JWT:** Geração e verificação de tokens para proteger rotas.
*   **Hash de Senhas:** Uso de `bcrypt` para armazenar senhas de forma segura.
*   **Validação de Dados:** `express-validator` para garantir a integridade dos dados recebidos.
*   **Integração com MySQL:** Conexão e operações com o banco de dados.
*   **Análise de Relatórios com Python:** O serviço de admin chama um script Python para processar e analisar os dados das avaliações, retornando relatórios estruturados.

## Estrutura do Projeto

```
tcc/
├── backend/
│   ├── node_modules/
│   ├── python_scripts/
│   │   └── analyze_evaluations.py  # Script Python para análise de dados
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        # Configuração de conexão com o MySQL
│   │   ├── controllers/           # Lógica de requisição/resposta
│   │   │   ├── adminController.ts
│   │   │   ├── adminUserController.ts
│   │   │   ├── authController.ts
│   │   │   ├── consentController.ts
│   │   │   ├── evaluationController.ts
│   │   │   └── institutionCourseController.ts
│   │   ├── middlewares/           # Funções intermediárias (autenticação, validação, admin)
│   │   │   ├── authMiddleware.ts
│   │   │   ├── isAdmin.ts
│   │   │   └── validationMiddleware.ts
│   │   ├── routes/                # Definição de rotas da API
│   │   │   ├── adminRoutes.ts
│   │   │   ├── adminUserRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── consentRoutes.ts
│   │   │   ├── evaluationRoutes.ts
│   │   │   ├── institutionCourseRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── services/              # Lógica de negócio e interação com o DB
│   │   │   ├── adminService.ts
│   │   │   ├── adminUserService.ts
│   │   │   ├── authService.ts
│   │   │   ├── consentService.ts
│   │   │   ├── evaluationService.ts
│   │   │   ├── institutionCourseService.ts
│   │   │   └── userService.ts
│   │   └── server.ts              # Ponto de entrada do servidor Express
│   ├── .env                       # Variáveis de ambiente (NÃO COMMITAR!)
│   ├── .env.example               # Exemplo de variáveis de ambiente
│   ├── database.sql               # Script SQL para criação do banco de dados
│   ├── package.json               # Dependências e scripts do Node.js
│   ├── tsconfig.json              # Configuração do TypeScript
│   └── ...
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── CookieConsent.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   ├── contexts/
│   │   │   └── NotificationContext.tsx # Contexto para notificações globais
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   │   # ... (outras páginas)
│   │   │   ├── AdminUserManagement.tsx
│   │   │   ├── Avaliacao.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── InstitutionCourseManagement.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Perfil.tsx
│   │   │   ├── RecuperarSenha.tsx
│   │   │   └── Registro.tsx
│   │   ├── routes/
│   │   │   └── index.tsx            # Definição de rotas do React Router
│   │   ├── styles/
│   │   │   ├── Auth.css
│   │   │   ├── global.css
│   │   │   └── Home.css
│   │   ├── App.js
│   │   └── main.tsx                 # Ponto de entrada da aplicação React
│   ├── index.html
│   ├── package.json                 # Dependências e scripts do React/Vite
│   ├── tsconfig.json
│   ├── vite.config.ts               # Configuração do Vite (com proxy para o backend)
│   └── ...
└── README.md                      # Este arquivo
```

## Como Configurar e Rodar a Aplicação

### Pré-requisitos

*   Node.js (versão 18 ou superior)
*   npm (gerenciador de pacotes do Node.js)
*   Python 3 (com `pip`)
*   Servidor MySQL

### 1. Configuração do Banco de Dados

1.  Certifique-se de que seu servidor MySQL esteja em execução.
2.  Acesse seu cliente MySQL (ex: MySQL Workbench, phpMyAdmin, linha de comando).
3.  Execute o script SQL localizado em `backend/database.sql` para criar o banco de dados `avaliacao_educacional` e todas as tabelas necessárias.

    ```sql
    -- Conteúdo de backend/database.sql
    CREATE DATABASE IF NOT EXISTS avaliacao_educacional;

    USE avaliacao_educacional;

    CREATE TABLE IF NOT EXISTS Usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
        ra VARCHAR(20) NOT NULL UNIQUE,
        idade INT NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        instituicao_id INT,
        curso_id INT,
        periodo VARCHAR(50),
        semestre VARCHAR(50),
        reset_token VARCHAR(255) UNIQUE,
        reset_token_expires_at DATETIME,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Instituicoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Cursos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        instituicao_id INT NOT NULL,
        FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Avaliacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        instituicao_id INT NOT NULL,
        curso_id INT NOT NULL,
        nota_infraestrutura INT NOT NULL,
        obs_infraestrutura TEXT,
        nota_material_didatico INT NOT NULL,
        obs_material_didatico TEXT,
        media_final DECIMAL(3, 2) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES Cursos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Consentimento (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        consentimento_cookies BOOLEAN NOT NULL DEFAULT false,
        consentimento_localizacao BOOLEAN NOT NULL DEFAULT false,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
    );

    -- Adicionando referência de instituição e curso na tabela de usuários após a criação das outras tabelas
    ALTER TABLE Usuarios
    ADD CONSTRAINT fk_usuario_instituicao FOREIGN KEY (instituicao_id) REFERENCES Instituicoes(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_usuario_curso FOREIGN KEY (curso_id) REFERENCES Cursos(id) ON DELETE SET NULL;
    ```
    *Nota: Adicionei `ON DELETE CASCADE` e `ON DELETE SET NULL` para garantir a integridade referencial em cascata, o que é uma boa prática.*

### 2. Configuração do Backend

1.  Navegue até o diretório `backend`:
    ```bash
    cd tcc/backend
    ```
2.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz do diretório `backend` (você pode copiar o `backend/.env.example`).
4.  Edite o arquivo `.env` com suas credenciais do MySQL e uma chave secreta para JWT:
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua_senha_do_mysql
    DB_NAME=avaliacao_educacional

    JWT_SECRET=sua_chave_secreta_para_jwt
    PORT=3001
    ```
    *Substitua `sua_senha_do_mysql` e `sua_chave_secreta_para_jwt` por valores reais e seguros.*
5.  Instale as dependências do Python (se for expandir o script Python com bibliotecas como `pandas`, `numpy`):
    ```bash
    pip install pandas numpy # ou outras bibliotecas que você venha a usar
    ```

### 3. Configuração do Frontend

1.  Navegue até o diretório `frontend`:
    ```bash
    cd tcc/frontend
    ```
2.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```

### 4. Como Rodar a Aplicação

1.  **Inicie o Backend:**
    No diretório `tcc/backend`, execute:
    ```bash
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:3001`.

2.  **Inicie o Frontend:**
    Em um novo terminal, no diretório `tcc/frontend`, execute:
    ```bash
    npm run dev
    ```
    A aplicação frontend estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

## Próximos Passos e Melhorias Futuras

*   **UI/UX do Painel Admin:** Aprimorar a interface do `AdminDashboard` com mais gráficos interativos, filtros e opções de exportação de relatórios.
*   **Tratamento de Erros e Notificações:** Implementar um sistema de notificação global mais robusto e visualmente integrado (ex: toasts) para substituir os `alert()` e mensagens de erro simples.
*   **Gerenciamento de Estado Global no Frontend:** Considerar o uso de uma biblioteca de gerenciamento de estado (ex: Redux, Zustand) para aplicações maiores.
*   **Funcionalidade de Pesquisa:** Implementar a funcionalidade de pesquisa na Home e no Admin Dashboard.
*   **Testes:** Adicionar testes unitários e de integração para garantir a estabilidade e o correto funcionamento.
*   **Deploy:** Configurar a aplicação para deploy em ambiente de produção.

---