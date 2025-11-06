# Backend do Sistema de Avaliação Educacional

Este diretório contém o código-fonte do backend da aplicação, desenvolvido em Node.js com TypeScript e Express.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (geralmente instalado com o Node.js)
- Um banco de dados MySQL

## Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd tcc/backend
    ```

2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Renomeie o arquivo `.env.example` para `.env`.
    - Preencha as variáveis de ambiente no arquivo `.env` com as informações do seu banco de dados e outras configurações.

## Dependência de Python para Relatórios

A funcionalidade de geração de relatórios em PDF (`/api/admin/report/download`) depende de um script Python.

**Para que essa funcionalidade opere corretamente, você precisa ter o Python instalado em sua máquina e as bibliotecas listadas no arquivo `src/scripts/requirements.txt`.**

### Configurando o Ambiente Python

1.  **Instale o Python:**
    - Baixe e instale a versão mais recente do Python em [python.org](https://www.python.org/downloads/).
    - **Importante:** Durante a instalação no Windows, marque a opção "Add Python to PATH".

2.  **Instale as dependências do Python:**
    - Navegue até o diretório que contém o `requirements.txt`:
      ```bash
      cd src/scripts
      ```
    - Instale as bibliotecas com o `pip`:
      ```bash
      pip install -r requirements.txt
      ```

## Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento (com recarregamento automático), execute:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001` (ou na porta definida no seu arquivo `.env`).
