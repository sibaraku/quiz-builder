import { Quiz } from '../types/quiz';

type QuizDetailProps = {
  quiz: Quiz | null;
  onBack: () => void;
};

export function QuizDetail({ quiz, onBack }: QuizDetailProps) {
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