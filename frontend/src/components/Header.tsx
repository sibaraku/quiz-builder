type HeaderProps = {
  onNavigate: (path: string) => void;
};

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header>
      <button className="brand" onClick={() => onNavigate('/quizzes')}>
        Quiz Builder
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