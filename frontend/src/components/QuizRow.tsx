import { QuizSummary } from '../types/quiz';

type QuizRowProps = {
  quiz: QuizSummary;
  onOpen: () => void;
  onDelete: () => void;
};

export function QuizRow({ quiz, onOpen, onDelete }: QuizRowProps) {
  return (
    <article className="quiz-row">
      <button className="quiz-link" onClick={onOpen}>
        <strong>{quiz.title}</strong>
        <span>
          {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
        </span>
      </button>
      <button className="delete" aria-label={`Delete ${quiz.title}`} onClick={onDelete}>
        Delete
      </button>
    </article>
  );
}