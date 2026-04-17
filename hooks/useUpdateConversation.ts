import { useMutation,} from "@tanstack/react-query";
import { UpdateConversationsInput } from "@/graph/API";
import { updateConversations } from "@/graph/customMutations";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface UseUpdateConversationReturn {
  updateConversation: (input: UpdateConversationsInput) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useUpdateConversation = (): UseUpdateConversationReturn => {

  const mutation = useMutation({
    mutationFn: async (input: UpdateConversationsInput) => {
      try {
        const response = await client.graphql({
          query: updateConversations,
          variables: {
            input, 
          },
        });

        logger.info("Successfully updated conversation:", response.data);
        return response.data;
      } catch (error) {
        logger.error("Failed to update conversation:", error);
      }
    },
  });

  return {
    updateConversation: async (input: UpdateConversationsInput) => {
      await mutation.mutateAsync(input);
    },
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
