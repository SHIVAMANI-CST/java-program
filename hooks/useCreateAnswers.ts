import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { createAnswers } from "@/graphql/queries/queries";
import { useUserId } from "@/lib/getUserId";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface Answer {
  questionId: string;
  answer: string | number;
}

interface UseCreateAnswersReturn {
  submitAnswers: (input: {
    answers: Answer[];
    formId?: string;
  }) => Promise<{ success: boolean; successfulAnswers: string[] }>;
  isLoading: boolean;
  error: Error | null;
}

export const useCreateAnswers = (): UseCreateAnswersReturn => {
  const userId = useUserId();

  const mutation = useMutation({
    mutationFn: async ({
      answers,
      formId,
    }: {
      answers: Answer[];
      formId?: string;
    }) => {
      if (!userId) {
        logger.error("User ID is required to submit answers");
      }

      const results = {
        success: false,
        successfulAnswers: [] as string[],
      };

      for (const answer of answers) {
        try {
          await client.graphql({
            query: createAnswers,
            variables: {
              input: {
                answerId: uuidv4(),
                answerValue: String(answer.answer),
                formId: formId,
                questionId: answer.questionId,
                userId: userId,
                rOwner: [userId],
                rdOwner: [userId],
                ruOwner: [userId],
                rwOwner: [userId],
              },
            },
          });

          results.successfulAnswers.push(answer.questionId);
        } catch (error) {
          logger.error(
            `Failed to submit answer for question ${answer.questionId}:`,
            error
          );
        }
      }

      results.success = results.successfulAnswers.length > 0;

      logger.info("Answer submission summary:", {
        totalAnswers: answers.length,
        successful: results.successfulAnswers.length,
      });

      return results;
    },
    onError: (error) => {
      logger.error("Failed to submit answers:", error);
    },
  });

  return {
    submitAnswers: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
