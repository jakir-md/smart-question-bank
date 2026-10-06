import { Question, QuestionFilterCriteria, CSVQuestionRow } from '../models/question.model';

export class QuestionController {
  private questions: Question[] = [];

  constructor(initialQuestions: Question[] = []) {
    this.questions = initialQuestions;
  }

  // US-6.1 & US-6.2: Filter & Browse
  filterQuestions(criteria: QuestionFilterCriteria): Question[] {
    return this.questions.filter((q) => {
      if (criteria.subject && q.subject !== criteria.subject) return false;
      if (criteria.chapter && q.chapter !== criteria.chapter) return false;
      if (criteria.topic && q.topic !== criteria.topic) return false;
      if (
        criteria.searchQuery &&
        !q.text.toLowerCase().includes(criteria.searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }

  // US-6.3: Search
  searchQuestions(query: string): Question[] {
    return this.filterQuestions({ searchQuery: query });
  }

  // US-6.4: Bookmark
  toggleBookmark(questionId: string): boolean {
    const question = this.questions.find((q) => q.id === questionId);
    if (question) {
      question.isBookmarked = !question.isBookmarked;
      return question.isBookmarked;
    }
    return false;
  }

  // US-6.5: Export Data Helper
  getQuestionsForPDFExport(questionIds: string[]): Question[] {
    return this.questions.filter((q) => questionIds.includes(q.id));
  }

  // US-6.6: Batch Upload CSV
  processCSVUpload(rows: CSVQuestionRow[]): Question[] {
    const newQuestions: Question[] = rows.map((row, index) => ({
      id: `csv-${Date.now()}-${index}`,
      text: row.text,
      subject: row.subject,
      chapter: row.chapter,
      options: row.options.split('|').map((opt) => opt.trim()),
      correctAnswer: row.correctAnswer,
    }));
    this.questions.push(...newQuestions);
    return newQuestions;
  }
}