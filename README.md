# Quiz Builder

A small full-stack quiz builder using React, TypeScript, Express, and SQLite.

## Requirements

- Node.js 20 or newer
- npm

## Setup

Install all dependencies from the project root:

```bash
npm run install:all
```

Copy the environment examples if you want to change the defaults:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Start the API and frontend together:

```bash
npm run dev
```

Open <http://localhost:5173>. The API runs at <http://localhost:3001> and stores the SQLite database at `backend/data/quiz-builder.sqlite`.

## Usage

1. Select **New quiz**.
2. Enter a title and add one or more questions.
3. Choose True / False, Short text, or Multiple choice.
4. Save the quiz, then open it from the quiz library.

A sample quiz can also be created through the API:

```bash
curl -X POST http://localhost:3001/quizzes ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Web basics\",\"questions\":[{\"type\":\"boolean\",\"text\":\"HTML is a markup language\",\"answer\":\"true\"}]}"
```

## Checks

Build both applications:

```bash
npm run build
```

The API exposes `POST /quizzes`, `GET /quizzes`, `GET /quizzes/:id`, and `DELETE /quizzes/:id`.
