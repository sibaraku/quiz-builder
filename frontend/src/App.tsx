import { FormEvent, useEffect, useState } from 'react';
import './App.css';

type QuestionType = 'boolean' | 'input' | 'checkbox';
type Question = {
  type: QuestionType;
  text: string;
  answer: string;
  options: string[];
  correctOptions: string[];
};
type QuizSummary = { id: number; title: string; questionCount: number; createdAt: string };
type Quiz = QuizSummary & { questions: (Question & { id: number; quizId: number })[] };

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const emptyQuestion = (): Question => ({
  type: 'boolean',
  text: '',
  answer: 'true',
  options: ['', ''],
  correctOptions: [],
});

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    setError('');
  }

  async function createQuiz(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, questions }),
      });
      if (!response.ok) throw new Error();
      navigate('/quizzes');
      setTitle('');
      setQuestions([emptyQuestion()]);
    } catch {
      setError('Please add a title and complete each question.');
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

  function renderQuestionEditor(question: Question, index: number) {
    return (
      <section className="question-editor" key={index}>
        <div className="question-heading">
          <strong>Question {index + 1}</strong>
          {questions.length > 1 && (
            <button
              type="button"
              className="link-button"
              onClick={() => setQuestions(questions.filter((_, itemIndex) => itemIndex !== index))}
            >
              Remove
            </button>
          )}
        </div>
        <label>
          Question text
          <input
            value={question.text}
            onChange={(event) => updateQuestion(index, { text: event.target.value })}
            required
          />
        </label>
        <label>
          Type
          <select
            value={question.type}
            onChange={(event) =>
              updateQuestion(index, {
                type: event.target.value as QuestionType,
                answer: event.target.value === 'boolean' ? 'true' : '',
                options: event.target.value === 'checkbox' ? ['', ''] : [],
                correctOptions: [],
              })
            }
          >
            <option value="boolean">True / False</option>
            <option value="input">Short text</option>
            <option value="checkbox">Multiple choice</option>
          </select>
        </label>
        {question.type === 'boolean' && (
          <fieldset>
            <legend>Correct answer</legend>
            <label className="inline">
              <input
                type="radio"
                checked={question.answer === 'true'}
                onChange={() => updateQuestion(index, { answer: 'true' })}
              />{' '}
              True
            </label>
            <label className="inline">
              <input
                type="radio"
                checked={question.answer === 'false'}
                onChange={() => updateQuestion(index, { answer: 'false' })}
              />{' '}
              False
            </label>
          </fieldset>
        )}
        {question.type === 'input' && (
          <label>
            Expected answer
            <input
              value={question.answer}
              onChange={(event) => updateQuestion(index, { answer: event.target.value })}
              required
            />
          </label>
        )}
        {question.type === 'checkbox' && (
          <fieldset>
            <legend>Options (select all correct)</legend>
            {question.options.map((option, optionIndex) => (
              <div className="option-row" key={optionIndex}>
                <input
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(event) =>
                    updateQuestion(index, {
                      options: question.options.map((item, itemIndex) =>
                        itemIndex === optionIndex ? event.target.value : item,
                      ),
                    })
                  }
                  required
                />
                <label className="inline">
                  <input
                    type="checkbox"
                    checked={question.correctOptions.includes(option) && option !== ''}
                    onChange={(event) =>
                      updateQuestion(index, {
                        correctOptions: event.target.checked
                          ? [...question.correctOptions, option]
                          : question.correctOptions.filter((item) => item !== option),
                      })
                    }
                  />{' '}
                  Correct
                </label>
              </div>
            ))}
            <button
              type="button"
              className="link-button"
              onClick={() => updateQuestion(index, { options: [...question.options, ''] })}
            >
              + Add option
            </button>
          </fieldset>
        )}
      </section>
    );
  }

  return (
    <>
      <header>
        <button className="brand" onClick={() => navigate('/quizzes')}>
          Quiz Builder
        </button>
        <nav>
          <button onClick={() => navigate('/quizzes')}>Quizzes</button>
          <button className="primary" onClick={() => navigate('/create')}>
            New quiz
          </button>
        </nav>
      </header>
      <main>
        {error && <p className="error">{error}</p>}
        {loading && <p className="muted">Loading...</p>}
        {!loading &&
          (path === '/create' ? (
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
                {questions.map(renderQuestionEditor)}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setQuestions([...questions, emptyQuestion()])}
                  >
                    + Add question
                  </button>
                  <button className="primary" type="submit">
                    Save quiz
                  </button>
                </div>
              </form>
            </>
          ) : path.startsWith('/quizzes/') ? (
            <Detail quiz={quiz} onBack={() => navigate('/quizzes')} />
          ) : (
            <>
              <div className="page-title">
                <div>
                  <p className="eyebrow">Library</p>
                  <h1>Your quizzes</h1>
                  <p className="muted">
                    {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                  </p>
                </div>
                <button className="primary" onClick={() => navigate('/create')}>
                  New quiz
                </button>
              </div>
              {quizzes.length === 0 ? (
                <div className="empty">
                  <h2>No quizzes yet</h2>
                  <p>Create your first quiz to see it here.</p>
                  <button className="primary" onClick={() => navigate('/create')}>
                    Create a quiz
                  </button>
                </div>
              ) : (
                <div className="quiz-list">
                  {quizzes.map((item) => (
                    <article className="quiz-row" key={item.id}>
                      <button className="quiz-link" onClick={() => navigate(`/quizzes/${item.id}`)}>
                        <strong>{item.title}</strong>
                        <span>
                          {item.questionCount} {item.questionCount === 1 ? 'question' : 'questions'}
                        </span>
                      </button>
                      <button
                        className="delete"
                        aria-label={`Delete ${item.title}`}
                        onClick={() => deleteQuiz(item.id)}
                      >
                        Delete
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </>
          ))}
      </main>
    </>
  );
}

function Detail({ quiz, onBack }: { quiz: Quiz | null; onBack: () => void }) {
  if (!quiz) return <p className="muted">Quiz not found.</p>;
  return (
    <>
      <button className="back" onClick={onBack}>
        ← All quizzes
      </button>
      <div className="page-title">
        <div>
          <p className="eyebrow">Quiz detail</p>
          <h1>{quiz.title}</h1>
          <p className="muted">{quiz.questions.length} questions</p>
        </div>
      </div>
      <div className="detail-list">
        {quiz.questions.map((question, index) => (
          <section className="question-preview" key={question.id}>
            <div className="question-heading">
              <strong>
                {index + 1}. {question.text}
              </strong>
              <span className="tag">{question.type}</span>
            </div>
            {question.type === 'boolean' && (
              <p>
                Correct answer: <strong>{question.answer === 'true' ? 'True' : 'False'}</strong>
              </p>
            )}
            {question.type === 'input' && (
              <p>
                Expected answer: <strong>{question.answer}</strong>
              </p>
            )}
            {question.type === 'checkbox' && (
              <ul>
                {question.options.map((option) => (
                  <li
                    className={question.correctOptions.includes(option) ? 'correct' : ''}
                    key={option}
                  >
                    {option}
                    {question.correctOptions.includes(option) && ' (correct)'}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

export default App;
