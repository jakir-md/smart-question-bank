export interface Question {
  id: string;
  chapterId: string;
  text: string;
  year: number;
  marks: number;
}

export const filterQuestions = (
  questions: Question[],
  sortBy: 'oldest' | 'newest' | 'highest_marks' | 'lowest_marks',
  searchQuery: string = ''
): Question[] => {
  let result = questions.filter((q) =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return result.sort((a, b) => {
    if (sortBy === 'oldest') return a.year - b.year;
    if (sortBy === 'newest') return b.year - a.year;
    if (sortBy === 'highest_marks') return b.marks - a.marks;
    if (sortBy === 'lowest_marks') return a.marks - b.marks;
    return 0;
  });
};