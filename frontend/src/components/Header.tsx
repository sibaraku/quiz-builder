type HeaderProps = {
  onNavigate: (path: string) => void;
};

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header>
      <button className="brand" onClick={() => onNavigate('/quizzes')}>
        <span>Quiz Builder</span>
        <img src="/quiz_builder_logo.png" alt="" />
      </button>
      <nav>
        <button onClick={() => onNavigate('/quizzes')}>Quizzes</button>
        <button className="primary" onClick={() => onNavigate('/create')}>
          New quiz
        </button>
      </nav>
    </header>
  );
}