import { Question } from './question.model';

export interface QuizSubmission {
  questionId: string;
  selectedOption: string;
  timeSpentSeconds: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  flaggedQuestions: string[];
}

export interface MistakeItem {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
}