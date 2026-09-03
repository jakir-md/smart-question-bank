import { describe, it, expect } from 'vitest';
import {
  generatePracticeQuiz,
  generateMockExam,
  evaluateQuiz,
  checkTimerWarning,
  toggleFlagQuestion,
  createErrorReport,
  generateRetestFromMistakes,
  updateMistakeBank,
  QuizQuestion,
} from './quiz.service';

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    subjectId: 's1',
    chapterId: 'c1',
    text: 'What is HTTP?',
    options: ['Protocol', 'Database', 'Language', 'Hardware'],
    correctAnswer: 0,
    explanation: 'HTTP is a application protocol.',
  },
  {
    id: 'q2',
    subjectId: 's1',
    chapterId: 'c1',
    text: 'What port does HTTPS use?',
    options: ['80', '21', '443', '22'],
    correctAnswer: 2,
    explanation: 'HTTPS operates over TCP port 443.',
  },
  {
    id: 'q3',
    subjectId: 's2',
    chapterId: 'c2',
    text: 'What is a B-Tree?',
    options: ['Graph', 'Data Structure', 'CPU', 'OS'],
    correctAnswer: 1,
    explanation: 'B-Tree is a self-balancing search tree.',
  },
];

describe('Quiz & Examination Module Service Tests (US-7.1 to US-7.6)', () => {
  // US-7.1
  it('US-7.1: should generate practice quiz filtered by subject and chapter', () => {
    const quiz = generatePracticeQuiz(mockQuestions, 's1', 'c1');
    expect(quiz).toHaveLength(2);
    expect(quiz.every((q) => q.chapterId === 'c1')).toBe(true);
  });

  // US-7.2
  it('US-7.2: should generate multi-chapter mock exam covering selected subjects', () => {
    const mockExam = generateMockExam(mockQuestions, ['s1', 's2']);
    expect(mockExam).toHaveLength(3);
  });

  // US-7.3
  it('US-7.3: should evaluate quiz submission with accuracy percentage and missed list', () => {
    const answers = { q1: 0, q2: 1 }; // q1 is correct, q2 is wrong (correct is 2), q3 is unattempted
    const evaluation = evaluateQuiz(mockQuestions, answers);

    expect(evaluation.correctAnswers).toBe(1);
    expect(evaluation.incorrectAnswers).toBe(1);
    expect(evaluation.unattempted).toBe(1);
    expect(evaluation.scorePercentage).toBe(33);
    expect(evaluation.missedQuestionIds).toEqual(['q2', 'q3']);
  });

  // US-7.4
  it('US-7.4: should trigger audio/visual warning when timer drops below 5 minutes (300s)', () => {
    expect(checkTimerWarning(290)).toBe(true);
    expect(checkTimerWarning(600)).toBe(false);
  });

  // US-7.5
  it('US-7.5: should toggle question flag and create error report', () => {
    let flagged: string[] = [];
    flagged = toggleFlagQuestion(flagged, 'q1');
    expect(flagged).toContain('q1');

    const report = createErrorReport('q1', 'user123', 'Typo in question text');
    expect(report.questionId).toBe('q1');
    expect(report.reason).toBe('Typo in question text');
  });

  // US-7.6
  it('US-7.6: should generate targeted re-test from mistakes and clear correctly answered items', () => {
    const mistakeBank = ['q2', 'q3'];
    const retest = generateRetestFromMistakes(mockQuestions, mistakeBank);
    expect(retest).toHaveLength(2);

    const updatedBank = updateMistakeBank(mistakeBank, 'q2');
    expect(updatedBank).not.toContain('q2');
    expect(updatedBank).toContain('q3');
  });
});