import { useQuery } from "@tanstack/react-query";
import { listQuestions } from "@/graph/queries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs, gcTimeMs } from "@/utils/timeConstants";

interface Question {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: "questions";
  createdAt: string;
  displayOrder: number;
  formId: string;
  furtherSuggestions?: string | null;
  options?: (string | null)[] | null;
  questionId: string;
  questionText?: string | null;
  questionType?:
    | "STAR_RATING"
    | "SINGLE_CHOICE"
    | "CONDITIONAL_TRIGGER"
    | "TEXT_AREA"
    | null;
  updatedAt: string;
}

export const useListQuestions = () => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listQuestions"],
    queryFn: async (): Promise<Question[]> => {
      try {
        const response = await client.graphql({ query: listQuestions });

        return (
          response.data?.listQuestions?.items?.sort(
            (a, b) => a.displayOrder - b.displayOrder
          ) || []
        );
      } catch (error) {
        logger.error("Failed to fetch questions:", error);
        return [];
      }
    },
    staleTime: staleTimeMs,
    gcTime: gcTimeMs,
  });

  return { data, isLoading, error };
};
