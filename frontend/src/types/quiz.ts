export type QuestionType = 'boolean' | 'input' | 'checkbox';

export type Question = {
  type: QuestionType;
  text: string;
  answer: string;
  options: string[];
  correctOptions: string[];
};

export type QuizSummary = {
  id: number;
  title: string;
  questionCount: number;
  createdAt: string;
};

export type QuizQuestion = Question & {
  id: number;
  quizId: number;
};

export type Quiz = QuizSummary & {
  questions: QuizQuestion[];
};