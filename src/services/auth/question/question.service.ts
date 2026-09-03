export interface Question {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  text: string;
  year: number;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'MCQ' | 'Short Answer' | 'Written';
  topic: string;
}

export interface Subject {
  id: string;
  name: string;
  chapters: { id: string; name: string; questionCount: number }[];
}

export interface FilterOptions {
  sortBy?: 'oldest' | 'newest' | 'highest_marks' | 'lowest_marks';
  searchQuery?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  type?: 'MCQ' | 'Short Answer' | 'Written';
  topic?: string;
  chapterId?: string;
}

// US-6.1: Browsing layout helper
export const getSubjectsWithCounts = (subjects: Subject[]) => {
  return subjects.map((sub) => ({
    ...sub,
    totalQuestions: sub.chapters.reduce((acc, c) => acc + c.questionCount, 0),
  }));
};

// US-6.2 & US-6.3: Advanced Filtering, Search, and Preview
export const filterQuestions = (
  questions: Question[],
  options: FilterOptions
): Question[] => {
  const { sortBy, searchQuery = '', difficulty, type, topic, chapterId } = options;

  let result = questions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficulty ? q.difficulty === difficulty : true;
    const matchesType = type ? q.type === type : true;
    const matchesTopic = topic ? q.topic === topic : true;
    const matchesChapter = chapterId ? q.chapterId === chapterId : true;

    return matchesSearch && matchesDifficulty && matchesType && matchesTopic && matchesChapter;
  });

  if (sortBy) {
    result.sort((a, b) => {
      if (sortBy === 'oldest') return a.year - b.year;
      if (sortBy === 'newest') return b.year - a.year;
      if (sortBy === 'highest_marks') return b.marks - a.marks;
      if (sortBy === 'lowest_marks') return a.marks - b.marks;
      return 0;
    });
  }

  return result;
};

// US-6.4: Bookmark System
export const toggleBookmark = (savedIds: string[], questionId: string): string[] => {
  if (savedIds.includes(questionId)) {
    return savedIds.filter((id) => id !== questionId);
  }
  return [...savedIds, questionId];
};

// US-6.5: Export to PDF Data Formatter
export const generatePDFData = (questions: Question[], headerTitle: string) => {
  return {
    header: headerTitle,
    generatedAt: new Date().toISOString(),
    totalCount: questions.length,
    items: questions.map((q, idx) => `${idx + 1}. [${q.marks} Marks] ${q.text}`),
  };
};

// US-6.6: CSV/Excel Parser Logic
export const parseCSVQuestions = (csvContent: string): Partial<Question>[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return {
      title: obj['title'] || '',
      text: obj['text'] || '',
      marks: Number(obj['marks']) || 0,
      year: Number(obj['year']) || 2026,
    };
  });
};