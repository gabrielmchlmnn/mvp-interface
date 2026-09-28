# MVP Interface

Interface web desenvolvida em **React com TypeScript** para gerenciamento de alunos. A aplicação permite cadastrar, consultar, editar e excluir alunos através da comunicação com a API REST do projeto.

## Tecnologias utilizadas

* React
* TypeScript
* Vite
* Material UI
* Axios
* ESLint
* Docker

## Funcionalidades

* Dashboard com quantidade total de alunos
* Listagem de alunos
* Busca por nome, e-mail ou CEP
* Cadastro de alunos
* Edição de alunos
* Exclusão de alunos
* Confirmação antes da exclusão
* Validação dos campos do formulário
* Máscara para telefone
* Máscara para CEP
* Consulta de endereço através da API ViaCEP
* Cache de consultas de CEP utilizando `localStorage`
* Interface responsiva

## Estrutura do projeto

```text
mvp-interface/
├── src/
│   ├── components/
│   │   ├── ConfirmDialog.tsx
│   │   ├── Dashboard.tsx
│   │   ├── StudentForm.tsx
│   │   └── StudentTable.tsx
│   ├── pages/
│   │   └── Students.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── student.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .dockerignore
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md
```

## Requisitos

Para executar o projeto localmente, é necessário ter instalado:

* Node.js 22 ou superior
* npm
* Git

Para execução utilizando container:

* Docker

## Instalação local

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd mvp-interface
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure a API

A interface utiliza a API backend disponível em:

```text
http://localhost:8000
```

Essa configuração está definida no arquivo:

```text
src/services/api.ts
```

O backend deve estar em execução antes de utilizar as operações de cadastro, edição, consulta e exclusão de alunos.

### 4. Inicie o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

## Execução com Docker

O projeto possui um `Dockerfile` para execução da interface em um container.

### 1. Crie a imagem

Na pasta raiz do projeto:

```bash
docker build -t mvp-interface .
```

### 2. Execute o container

```bash
docker run --rm -p 5173:5173 mvp-interface
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

O backend deve continuar disponível na porta `8000`.

## Comunicação com a API

A interface utiliza **Axios** para realizar as requisições HTTP para a API backend.

As principais operações utilizadas são:

| Método | Endpoint                 | Utilização      |
| ------ | ------------------------ | --------------- |
| GET    | `/students/`             | Listar alunos   |
| POST   | `/students/`             | Cadastrar aluno |
| PUT    | `/students/{student_id}` | Editar aluno    |
| DELETE | `/students/{student_id}` | Excluir aluno   |

Dessa forma, a interface utiliza os métodos HTTP `GET`, `POST`, `PUT` e `DELETE`.

## Consulta de CEP

O formulário de cadastro utiliza a API pública **ViaCEP** para consultar informações de endereço.

O fluxo funciona da seguinte forma:

1. O usuário informa o CEP.
2. A aplicação verifica se o CEP está armazenado no `localStorage`.
3. Caso exista no cache, os dados são utilizados localmente.
4. Caso não exista, a aplicação consulta a API ViaCEP.
5. Os dados retornados são apresentados no formulário.
6. O resultado da consulta é armazenado no `localStorage` para consultas futuras.

São apresentados os seguintes dados:

* Logradouro
* Bairro
* Cidade
* UF

O endereço não é enviado para o backend. Apenas o CEP é armazenado no cadastro do aluno.

## Scripts disponíveis

### Desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Verificação do código

```bash
npm run lint
```

### Preview da build

```bash
npm run preview
```

## Fluxo da aplicação

```text
                 ┌─────────────────────┐
                 │      Navegador      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  React + Material UI│
                 │   localhost:5173    │
                 └──────┬────────┬─────┘
                        │        │
             CRUD       │        │ Consulta CEP
                        │        │
                        ▼        ▼
              ┌─────────────┐  ┌─────────────┐
              │  FastAPI    │  │   ViaCEP    │
              │ localhost:  │  │ API pública │
              │    8000     │  └─────────────┘
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ PostgreSQL  │
              └─────────────┘
```

## Desenvolvimento

Durante o desenvolvimento, execute o backend e o frontend separadamente.

Backend:

```bash
cd mvp-api
docker compose up --build
```

Frontend:

```bash
cd mvp-interface
npm install
npm run dev
```

Depois, acesse:

```text
http://localhost:5173
```
