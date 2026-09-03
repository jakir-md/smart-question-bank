import { describe, it, expect } from 'vitest';
import { filterQuestions, Question } from './question.service';

const mockQuestions: Question[] = [
  { id: 'q1', chapterId: 'c1', text: 'What is Dijkstra algorithm?', year: 2020, marks: 10 },
  { id: 'q2', chapterId: 'c1', text: 'Explain Subnetting mask.', year: 2022, marks: 5 },
];

describe('US-6.2 & US-6.3 Question Search & Filter', () => {
  it('should filter questions by keyword', () => {
    const result = filterQuestions(mockQuestions, 'newest', 'Subnetting');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('q2');
  });

  it('should sort questions by highest marks', () => {
    const result = filterQuestions(mockQuestions, 'highest_marks');
    expect(result[0].marks).toBe(10);
  });
});