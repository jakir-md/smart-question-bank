import { describe, it, expect } from 'vitest';
import { QuestionController } from '../../../controllers/question.controller';
import { Question } from '../../../models/question.model';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'What is Dijkstra algorithm?',
    subject: 'Algorithm',
    chapter: 'Graph',
    options: ['Shortest path', 'Sorting', 'Searching', 'Greedy'],
    correctAnswer: 'Shortest path',
    isBookmarked: false,
  },
  {
    id: 'q2',
    text: 'What is QuickSort?',
    subject: 'Algorithm',
    chapter: 'Sorting',
    options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(1)'],
    correctAnswer: 'O(n log n)',
    isBookmarked: true,
  },
];

describe('Question Module Tests (MVC - QuestionController)', () => {
  // US-6.1 & US-6.2: Filter & Search
  it('US-6.1: should filter questions by subject and chapter', () => {
    const controller = new QuestionController(mockQuestions);
    const filtered = controller.filterQuestions({
      subject: 'Algorithm',
      chapter: 'Graph',
    });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('q1');
  });

  // US-6.3: Search Questions
  it('US-6.3: should search questions by keyword', () => {
    const controller = new QuestionController(mockQuestions);
    const searchResult = controller.searchQuestions('Dijkstra');
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].text).toContain('Dijkstra');
  });

  // US-6.4: Bookmark Question
  it('US-6.4: should toggle bookmark status', () => {
    const controller = new QuestionController(mockQuestions);
    const isBookmarked = controller.toggleBookmark('q1');
    expect(isBookmarked).toBe(true);
  });

  // US-6.5: Export PDF Helper
  it('US-6.5: should retrieve questions for PDF export', () => {
    const controller = new QuestionController(mockQuestions);
    const exportData = controller.getQuestionsForPDFExport(['q1', 'q2']);
    expect(exportData.length).toBe(2);
  });

  // US-6.6: Batch Upload CSV
  it('US-6.6: should parse and add questions from CSV upload', () => {
    const controller = new QuestionController([]);
    const csvRows = [
      {
        text: 'What is Binary Search?',
        subject: 'Algorithm',
        chapter: 'Searching',
        options: 'O(log n) | O(n) | O(1)',
        correctAnswer: 'O(log n)',
      },
    ];
    const newQuestions = controller.processCSVUpload(csvRows);
    expect(newQuestions.length).toBe(1);
    expect(newQuestions[0].text).toBe('What is Binary Search?');
  });
});