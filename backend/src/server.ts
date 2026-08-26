import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import initSqlJs, { Database } from 'sql.js';
import { z } from 'zod';

dotenv.config();

const port = Number(process.env.PORT ?? 3001);
const databasePath = path.resolve(process.env.DATABASE_PATH ?? './data/quiz-builder.sqlite');
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());

const questionSchema = z.object({
  type: z.enum(['boolean', 'input', 'checkbox']),
  text: z.string().trim().min(1),
  answer: z.string().trim().optional().default(''),
  options: z.array(z.string().trim().min(1)).optional().default([]),
  correctOptions: z.array(z.string().trim().min(1)).optional().default([]),
});

const quizSchema = z.object({
  title: z.string().trim().min(1),
  questions: z.array(questionSchema).min(1),
});

type QuizRow = { id: number; title: string; created_at: string };
type QuestionRow = {
  id: number;
  quiz_id: number;
  type: 'boolean' | 'input' | 'checkbox';
  text: string;
  answer: string;
  options: string;
  correct_options: string;
};

let database: Database;

function saveDatabase() {
  const directory = path.dirname(databasePath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(databasePath, Buffer.from(database.export()));
}

function getQuestions(quizId: number) {
  const result = database.exec(
    'SELECT id, quiz_id, type, text, answer, options, correct_options FROM questions WHERE quiz_id = ? ORDER BY id',
    [quizId],
  );
  const rows = (result[0]?.values ?? []) as (string | number | null)[][];
  return rows.map((row) => {
    const question = {
      id: Number(row[0]),
      quizId: Number(row[1]),
      type: row[2] as QuestionRow['type'],
      text: String(row[3]),
      answer: String(row[4] ?? ''),
      options: JSON.parse(String(row[5] ?? '[]')) as string[],
      correctOptions: JSON.parse(String(row[6] ?? '[]')) as string[],
    };
    return question;
  });
}

function getQuiz(quizId: number) {
  const result = database.exec('SELECT id, title, created_at FROM quizzes WHERE id = ?', [quizId]);
  const row = result[0]?.values[0] as (string | number)[] | undefined;
  if (!row) return null;

  return {
    id: Number(row[0]),
    title: String(row[1]),
    createdAt: String(row[2]),
    questions: getQuestions(quizId),
  };
}

app.get('/quizzes', (_request, response) => {
  const result = database.exec(`
    SELECT quizzes.id, quizzes.title, quizzes.created_at, COUNT(questions.id) AS question_count
    FROM quizzes
    LEFT JOIN questions ON questions.quiz_id = quizzes.id
    GROUP BY quizzes.id
    ORDER BY quizzes.id DESC
  `);
  const rows = (result[0]?.values ?? []) as (string | number)[][];
  response.json(
    rows.map((row) => ({
      id: Number(row[0]),
      title: String(row[1]),
      createdAt: String(row[2]),
      questionCount: Number(row[3]),
    })),
  );
});

app.get('/quizzes/:id', (request, response) => {
  const quiz = getQuiz(Number(request.params.id));
  if (!quiz) {
    response.status(404).json({ message: 'Quiz not found' });
    return;
  }
  response.json(quiz);
});

app.post('/quizzes', (request, response) => {
  const parsed = quizSchema.safeParse(request.body);
  if (!parsed.success) {
    response
      .status(400)
      .json({ message: 'Please provide a title and at least one valid question.' });
    return;
  }

  const now = new Date().toISOString();
  const quizStatement = database.prepare('INSERT INTO quizzes (title, created_at) VALUES (?, ?)');
  quizStatement.run([parsed.data.title, now]);
  quizStatement.free();
  const quizId = Number(database.exec('SELECT last_insert_rowid()')[0].values[0][0]);

  const questionStatement = database.prepare(`
    INSERT INTO questions (quiz_id, type, text, answer, options, correct_options)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const question of parsed.data.questions) {
    questionStatement.run([
      quizId,
      question.type,
      question.text,
      question.answer,
      JSON.stringify(question.options),
      JSON.stringify(question.correctOptions),
    ]);
  }
  questionStatement.free();
  saveDatabase();
  response.status(201).json(getQuiz(quizId));
});

app.delete('/quizzes/:id', (request, response) => {
  const quizId = Number(request.params.id);
  if (!getQuiz(quizId)) {
    response.status(404).json({ message: 'Quiz not found' });
    return;
  }
  database.run('DELETE FROM questions WHERE quiz_id = ?', [quizId]);
  database.run('DELETE FROM quizzes WHERE id = ?', [quizId]);
  saveDatabase();
  response.status(204).send();
});

async function start() {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(path.dirname(require.resolve('sql.js')), file),
  });
  database = fs.existsSync(databasePath)
    ? new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)))
    : new SQL.Database();
  database.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      answer TEXT NOT NULL DEFAULT '',
      options TEXT NOT NULL DEFAULT '[]',
      correct_options TEXT NOT NULL DEFAULT '[]'
    );
  `);
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
