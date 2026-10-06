import { Question } from '../models/question.model';
import { QuizSubmission, QuizResult, MistakeItem } from '../models/quiz.model';

export class QuizController {
  // US-7.3: Instant Evaluation & Scoring
  evaluateQuiz(
    questions: Question[],
    submissions: QuizSubmission[],
    passThresholdPercent: number = 60
  ): QuizResult {
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((question) => {
      const submission = submissions.find((s) => s.questionId === question.id);
      if (submission && submission.selectedOption === question.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctAnswers: correctCount,
      totalMarks: totalQuestions,
      obtainedMarks: correctCount,
      percentage: Number(percentage.toFixed(2)),
      passed: percentage >= passThresholdPercent,
      flaggedQuestions: [],
    };
  }

  // US-7.6: Mistake Review and Re-test Generation
  generateRetestFromMistakes(mistakes: MistakeItem[]): Question[] {
    return mistakes.map((m) => m.question);
  }
}