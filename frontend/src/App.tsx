import { FormEvent, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { QuestionEditor } from './components/QuestionEditor';
import { QuizDetail } from './components/QuizDetail';
import { QuizList } from './components/QuizList';
import { Question, Quiz, QuizSummary } from './types/quiz';
import { emptyQuestion } from './utils/quiz';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function App() {
  // App owns shared state because each screen needs to update or display it.
  const [path, setPath] = useState(window.location.pathname);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // The URL is the navigation state, so loading follows route changes.
  useEffect(() => {
    if (path === '/quizzes' || path === '/') loadQuizzes();
    if (path.startsWith('/quizzes/')) loadQuiz(path.split('/')[2]);
  }, [path]);

  async function loadQuizzes() {
    setLoading(true);
    try {
      setQuizzes(await fetch(`${API_URL}/quizzes`).then((response) => response.json()));
    } catch {
      setError('Could not load quizzes.');
    } finally {
      setLoading(false);
    }
  }

  async function loadQuiz(id: string) {
    setLoading(true);
    try {
      setQuiz(await fetch(`${API_URL}/quizzes/${id}`).then((response) => response.json()));
    } catch {
      setError('Could not load this quiz.');
    } finally {
      setLoading(false);
    }
  }

  function navigate(nextPath: string) {
    // Update the URL without reloading the page; path then selects the screen.
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    setError('');
  }

  async function createQuiz(event: FormEvent) {
    event.preventDefault();
    setError('');
    const normalizedTitle = title.trim();
    const normalizedQuestions = questions.map((question) => ({
      ...question,
      text: question.text.trim(),
      answer: question.answer.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctOptions: question.correctOptions.map((option) => option.trim()).filter(Boolean),
    }));
    // Validate normalized values so whitespace-only fields cannot be saved.
    const hasIncompleteQuestion = normalizedQuestions.some((question) => {
      if (!question.text) return true;
      if (question.type === 'boolean') return !['true', 'false'].includes(question.answer);
      if (question.type === 'input') return !question.answer;
      if (question.type === 'checkbox') {
        const nonEmptyOptions = question.options.filter(Boolean);
        return (
          nonEmptyOptions.length < 2 ||
          !question.correctOptions.some((option) => nonEmptyOptions.includes(option))
        );
      }
      return false;
    });
    if (!normalizedTitle || hasIncompleteQuestion) {
      setError('Please add a title and complete each question.');
      return;
    }
    try {
      // Send the normalized quiz to the backend using the existing API endpoint.
      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: normalizedTitle, questions: normalizedQuestions }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(result?.message ?? 'Could not save this quiz.');
      }
      navigate('/quizzes');
      setTitle('');
      setQuestions([emptyQuestion()]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save this quiz.');
    }
  }

  async function deleteQuiz(id: number) {
    if (!window.confirm('Delete this quiz?')) return;
    await fetch(`${API_URL}/quizzes/${id}`, { method: 'DELETE' });
    setQuizzes((current) => current.filter((item) => item.id !== id));
  }

  function updateQuestion(index: number, changes: Partial<Question>) {
    setQuestions((current) =>
      current.map((question, itemIndex) =>
        itemIndex === index ? { ...question, ...changes } : question,
      ),
    );
  }

  return (
    <>
      <Header onNavigate={navigate} />
      <main>
        {error && <p className="error">{error}</p>}
        {loading && <p className="muted">Loading...</p>}
        {!loading && path === '/create' && (
          <>
            <div className="page-title">
              <div>
                <p className="eyebrow">Create</p>
                <h1>Build a quiz</h1>
              </div>
            </div>
            <form onSubmit={createQuiz}>
              <label>
                Quiz title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Product onboarding"
                  required
                />
              </label>
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  question={question}
                  index={index}
                  canRemove={questions.length > 1}
                  onChange={(changes) => updateQuestion(index, changes)}
                  onRemove={() =>
                    setQuestions(questions.filter((_, itemIndex) => itemIndex !== index))
                  }
                />
              ))}
              <div className="form-actions">
                <button type="button" onClick={() => setQuestions([...questions, emptyQuestion()])}>
                  + Add question
                </button>
                <button className="primary" type="submit">
                  Save quiz
                </button>
              </div>
            </form>
          </>
        )}
        {!loading && path.startsWith('/quizzes/') && (
          <QuizDetail quiz={quiz} onBack={() => navigate('/quizzes')} />
        )}
        {!loading && path !== '/create' && !path.startsWith('/quizzes/') && (
          <QuizList
            quizzes={quizzes}
            onOpen={(id) => navigate(`/quizzes/${id}`)}
            onDelete={deleteQuiz}
            onCreate={() => navigate('/create')}
          />
        )}
      </main>
    </>
  );
}

export default App;
