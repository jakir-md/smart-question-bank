export interface QuizQuestion {
  id: string;
  subjectId: string;
  chapterId: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  flaggedQuestionIds: string[];
  timeSpentSeconds: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  scorePercentage: number;
  missedQuestionIds: string[];
}

export interface ErrorReport {
  questionId: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
}

// US-7.1: Practice Quiz Generator
export const generatePracticeQuiz = (
  allQuestions: QuizQuestion[],
  subjectId: string,
  chapterId: string
): QuizQuestion[] => {
  return allQuestions.filter(
    (q) => q.subjectId === subjectId && q.chapterId === chapterId
  );
};

// US-7.2: Combined Full-Syllabus Mock Exam Generator
export const generateMockExam = (
  allQuestions: QuizQuestion[],
  subjectIds: string[]
): QuizQuestion[] => {
  const filtered = allQuestions.filter((q) => subjectIds.includes(q.subjectId));
  // Shuffle questions deterministically/randomly
  return [...filtered].sort(() => 0.5 - Math.random());
};

// US-7.3: Instant Quiz Evaluation Engine
export const evaluateQuiz = (
  questions: QuizQuestion[],
  userAnswers: Record<string, number>
): QuizResult => {
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  const missedQuestionIds: string[] = [];

  questions.forEach((q) => {
    const answer = userAnswers[q.id];
    if (answer === undefined || answer === null) {
      unattempted++;
      missedQuestionIds.push(q.id);
    } else if (answer === q.correctAnswer) {
      correct++;
    } else {
      incorrect++;
      missedQuestionIds.push(q.id);
    }
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    totalQuestions: total,
    correctAnswers: correct,
    incorrectAnswers: incorrect,
    unattempted,
    scorePercentage: percentage,
    missedQuestionIds,
  };
};

// US-7.4: Custom Timer Configuration & Warning
export const checkTimerWarning = (
  remainingSeconds: number,
  warningThresholdSeconds: number = 300
): boolean => {
  return remainingSeconds <= warningThresholdSeconds && remainingSeconds > 0;
};

// US-7.5: Flagging and Error Reporting Logic
export const toggleFlagQuestion = (
  flaggedList: string[],
  questionId: string
): string[] => {
  if (flaggedList.includes(questionId)) {
    return flaggedList.filter((id) => id !== questionId);
  }
  return [...flaggedList, questionId];
};

export const createErrorReport = (
  questionId: string,
  userId: string,
  reason: string
): ErrorReport => {
  return {
    questionId,
    reportedBy: userId,
    reason,
    timestamp: new Date().toISOString(),
  };
};

// US-7.6: Mistake Review, Re-test Generation & Auto Clearance
export const generateRetestFromMistakes = (
  allQuestions: QuizQuestion[],
  mistakeBankIds: string[]
): QuizQuestion[] => {
  return allQuestions.filter((q) => mistakeBankIds.includes(q.id));
};

export const updateMistakeBank = (
  currentMistakeBankIds: string[],
  correctlyAnsweredId: string
): string[] => {
  return currentMistakeBankIds.filter((id) => id !== correctlyAnsweredId);
};