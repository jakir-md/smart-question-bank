import { describe, it, expect } from 'vitest';
import { QuizController } from '../../../controllers/quiz.controller';
import { Question } from '../../../models/question.model';
import { QuizSubmission, MistakeItem } from '../../../models/quiz.model';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Sample Q1',
    subject: 'CSE',
    chapter: 'Ch1',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
  },
  {
    id: 'q2',
    text: 'Sample Q2',
    subject: 'CSE',
    chapter: 'Ch1',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'B',
  },
];

describe('Quiz & Examination Module Tests (MVC - QuizController)', () => {
  // US-7.3: Instant Evaluation & Scoring
  it('US-7.3: should evaluate quiz submission correctly', () => {
    const controller = new QuizController();
    const submissions: QuizSubmission[] = [
      { questionId: 'q1', selectedOption: 'A', timeSpentSeconds: 30 },
      { questionId: 'q2', selectedOption: 'C', timeSpentSeconds: 45 }, // Incorrect
    ];

    const result = controller.evaluateQuiz(mockQuestions, submissions, 50);

    expect(result.totalQuestions).toBe(2);
    expect(result.correctAnswers).toBe(1);
    expect(result.obtainedMarks).toBe(1);
    expect(result.percentage).toBe(50);
    expect(result.passed).toBe(true);
  });

  // US-7.6: Re-test Generation from Mistakes
  it('US-7.6: should generate targeted re-test from mistake items', () => {
    const controller = new QuizController();
    const mistakes: MistakeItem[] = [
      {
        question: mockQuestions[1],
        userAnswer: 'C',
        correctAnswer: 'B',
      },
    ];

    const retestQuestions = controller.generateRetestFromMistakes(mistakes);

    expect(retestQuestions.length).toBe(1);
    expect(retestQuestions[0].id).toBe('q2');
  });
});