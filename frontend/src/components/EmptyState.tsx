type EmptyStateProps = {
  onCreate: () => void;
};

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="empty">
      <h2>No quizzes yet</h2>
      <p>Create your first quiz to see it here.</p>
      <button className="primary" onClick={onCreate}>
        Create a quiz
      </button>
    </div>
  );
}