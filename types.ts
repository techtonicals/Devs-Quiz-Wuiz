
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Tough';
export type QuizMode = 'Quiz' | 'Practice';

export interface QuizConfig {
  grade: number;
  subject: string;
  topic: string;
  numQuestions: number;
  difficulty: Difficulty;
  mode: QuizMode;
}
