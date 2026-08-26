# Quiz Builder

A small full-stack quiz builder using React, TypeScript, Express, and SQLite.

## Requirements

- Node.js 20 or newer
- npm

## Setup

Install the backend and frontend dependencies from the project root:

```bash
npm run install:all
```

The default configuration works locally. To override it, copy the environment examples:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

## Start the application

The simplest option is to start both services together from the project root:

```bash
npm run dev
```

Open <http://localhost:5173> in a browser. The API runs at <http://localhost:3001>.

To start the services separately, use two terminals:

Backend terminal:

```bash
cd backend
npm run dev
```

Frontend terminal:

```bash
cd frontend
npm run dev
```

## Database

The backend uses SQLite through `sql.js`. No database server or manual migration is required. When the backend starts, it creates the database and tables if they do not already exist, then saves the database to:

```text
backend/data/quiz-builder.sqlite
```

The path can be changed with `DATABASE_PATH` in `backend/.env`. The default path is relative to the backend process directory, so starting the backend with `cd backend` uses the path shown above.

## Create a sample quiz

Start the backend first, then send a request to `POST /quizzes`. In PowerShell:

```powershell
$body = @{
  title = 'Web basics'
  questions = @(
    @{
      type = 'boolean'
      text = 'HTML is a markup language'
      answer = 'true'
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri http://localhost:3001/quizzes -Method Post -ContentType 'application/json' -Body $body
```

On macOS, Linux, or Git Bash, the equivalent request is:

```bash
curl -X POST http://localhost:3001/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"Web basics","questions":[{"type":"boolean","text":"HTML is a markup language","answer":"true"}]}'
```

The created quiz is persisted in SQLite and appears in the frontend at <http://localhost:5173>.

## Usage

1. Select **New quiz**.
2. Enter a title and add one or more questions.
3. Choose True / False, Short text, or Multiple choice.
4. Save the quiz, then open it from the quiz library.

## Checks

Build both applications:

```bash
npm run build
```

The API exposes `POST /quizzes`, `GET /quizzes`, `GET /quizzes/:id`, and `DELETE /quizzes/:id`.
