export interface Question {
  id: string;
  text: string;
  subject: string;
  chapter: string;
  topic?: string;
  subtopic?: string;
  taxonomy?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  isBookmarked?: boolean;
}

export interface QuestionFilterCriteria {
  subject?: string;
  chapter?: string;
  topic?: string;
  searchQuery?: string;
}

export interface CSVQuestionRow {
  text: string;
  subject: string;
  chapter: string;
  options: string; // Comma separated options
  correctAnswer: string;
}