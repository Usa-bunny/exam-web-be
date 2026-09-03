const { Answer, ExamAttempt, Exam, Question } = require("../../../models");

class AnswersService {
  async recalculateAttemptScore(attempt_id: any) {
    const attempt = await ExamAttempt.findByPk(attempt_id, {
      include: [
        {
          model: Exam,
          as: "exam",
          include: [
            {
              model: Question,
              as: "questions",
            },
          ],
        },
        {
          model: Answer,
          as: "answers",
        },
      ],
    });

    if (!attempt) throw new Error("Attempt not found");

    const questions = attempt.exam.questions || [];
    const answers = attempt.answers || [];

    const totalQuestions = questions ? questions.length : 0;
    if (totalQuestions === 0) {
      await attempt.update({ score: 0, status: "graded" });
      return;
    }

    let totalScoreSum = 0;
    let hasPendingEssay = false;

    for (const question of questions) {
      const answer = answers.find(
        (answer: any) => answer.question_id === question.id,
      );

      if (question.type === "essay") {
        if (!answer || answer.is_correct === null) {
          hasPendingEssay = true;
        } else {
          if (answer.percentage !== null && answer.percentage !== undefined) {
            totalScoreSum += answer.percentage;
          } else {
            totalScoreSum += answer.is_correct ? 100 : 0;
          }
        }
      } else {
        if (answer && answer.is_correct === true) {
          totalScoreSum += 100;
        }
      }
    }

    const finalScore = Math.round(totalScoreSum / totalQuestions);
    const score = hasPendingEssay ? null : finalScore;
    const status = hasPendingEssay ? "completed" : "graded";

    await attempt.update({
      score,
      status,
    });
  }

  async correctAnswer(answers: any) {
    if (!Array.isArray(answers)) throw new Error("Answer must be an array");

    const uniqueAttemptIds = new Set();
    let updateCount = 0;

    for (const item of answers) {
      const { id, is_correct, percentage } = item;

      const answer = await Answer.findByPk(id);
      if (answer) {
        let updateData: any = {};
        if (is_correct !== undefined) updateData.is_correct = is_correct;

        if (percentage !== undefined) {
          updateData.percentage = percentage;
          if (is_correct === undefined) {
            updateData.is_correct = percentage > 0;
          }
        }

        await answer.update(updateData);
        uniqueAttemptIds.add(answer.attempt_id);
        updateCount++;
      }
    }

    for (const attemptId of uniqueAttemptIds) {
      await this.recalculateAttemptScore(attemptId);
    }

    return {
      success: true,
      updated_answers: updateCount,
    };
  }
}

module.exports = new AnswersService();
