import { useMutation } from "@tanstack/react-query";
import { UpdateMessagesInput } from "@/graph/API";
import { updateMessages } from "@/graph/customMutations";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface UseUpdateMessageLikeDislikeReturn {
  updateMessageReaction: (input: UpdateMessagesInput) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useUpdateMessage = (): UseUpdateMessageLikeDislikeReturn => {
  const mutation = useMutation({
    mutationFn: async (input: UpdateMessagesInput) => {
      try {
        const response = await client.graphql({
          query: updateMessages,
          variables: {
            input,
          },
        });

        logger.info(
          "Successfully updated message like/dislike:",
          response.data
        );
        return response.data;
      } catch (error) {
        logger.error("Failed to update message like/dislike:", error);
        throw error;
      }
    },
  });

  return {
    updateMessageReaction: async (input: UpdateMessagesInput) => {
      await mutation.mutateAsync(input);
    },
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
