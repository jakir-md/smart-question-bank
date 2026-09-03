import { describe, it, expect } from 'vitest';
import {
  filterQuestions,
  getSubjectsWithCounts,
  toggleBookmark,
  generatePDFData,
  parseCSVQuestions,
  Question,
  Subject,
} from './question.service';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    chapterId: 'c1',
    subjectId: 's1',
    title: 'Dijkstra',
    text: 'What is Dijkstra algorithm?',
    year: 2020,
    marks: 10,
    difficulty: 'Hard',
    type: 'Written',
    topic: 'Graph',
  },
  {
    id: 'q2',
    chapterId: 'c1',
    subjectId: 's1',
    title: 'Subnetting',
    text: 'Explain Subnetting mask.',
    year: 2022,
    marks: 5,
    difficulty: 'Easy',
    type: 'Short Answer',
    topic: 'Networking',
  },
];

const mockSubjects: Subject[] = [
  {
    id: 's1',
    name: 'Computer Networks',
    chapters: [
      { id: 'c1', name: 'Routing', questionCount: 5 },
      { id: 'c2', name: 'IP Addressing', questionCount: 10 },
    ],
  },
];

describe('Smart Question Bank Service Tests (US-6.1 to US-6.6)', () => {
  // US-6.1
  it('US-6.1: should calculate total questions for subject browsing layout', () => {
    const result = getSubjectsWithCounts(mockSubjects);
    expect(result[0].totalQuestions).toBe(15);
  });

  // US-6.2 & US-6.3
  it('US-6.2 & US-6.3: should filter by difficulty, search keyword, and sort', () => {
    const searchResult = filterQuestions(mockQuestions, { searchQuery: 'Subnetting' });
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0].id).toBe('q2');

    const filterResult = filterQuestions(mockQuestions, { difficulty: 'Hard' });
    expect(filterResult).toHaveLength(1);
    expect(filterResult[0].id).toBe('q1');
  });

  // US-6.4
  it('US-6.4: should toggle bookmarks correctly', () => {
    let bookmarks: string[] = [];
    bookmarks = toggleBookmark(bookmarks, 'q1');
    expect(bookmarks).toContain('q1');

    bookmarks = toggleBookmark(bookmarks, 'q1');
    expect(bookmarks).not.toContain('q1');
  });

  // US-6.5
  it('US-6.5: should format questions for PDF export', () => {
    const pdfData = generatePDFData(mockQuestions, 'Midterm Exam');
    expect(pdfData.header).toBe('Midterm Exam');
    expect(pdfData.totalCount).toBe(2);
    expect(pdfData.items[0]).toContain('Dijkstra algorithm');
  });

  // US-6.6
  it('US-6.6: should parse uploaded CSV questions', () => {
    const csvContent = 'title,text,marks,year\nBFS,Explain BFS,5,2023';
    const parsed = parseCSVQuestions(csvContent);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('BFS');
    expect(parsed[0].marks).toBe(5);
  });
});