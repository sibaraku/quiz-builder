import { EmptyState } from './EmptyState';
import { QuizRow } from './QuizRow';
import { QuizSummary } from '../types/quiz';

type QuizListProps = {
  quizzes: QuizSummary[];
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
};

export function QuizList({ quizzes, onOpen, onDelete, onCreate }: QuizListProps) {
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Your quizzes</h1>
          <p className="muted">
            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
          </p>
        </div>
        <button className="primary" onClick={onCreate}>
          New quiz
        </button>
      </div>
      {quizzes.length === 0 ? (
        <EmptyState onCreate={onCreate} />
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <QuizRow
              key={quiz.id}
              quiz={quiz}
              onOpen={() => onOpen(quiz.id)}
              onDelete={() => onDelete(quiz.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}