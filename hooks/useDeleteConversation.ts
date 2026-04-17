import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteConversationsInput } from "@/graph/API";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface UseDeleteConversationReturn {
  deleteConversation: (input: DeleteConversationsInput) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const deleteConversations = /* GraphQL */ `
  mutation DeleteConversations(
    $condition: ModelConversationsConditionInput
    $input: DeleteConversationsInput!
  ) {
    deleteConversations(condition: $condition, input: $input) {
      conversationId
      userId
      title
      feature
      totalTokens
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const useDeleteConversation = (): UseDeleteConversationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: DeleteConversationsInput) => {
      try {
        const response = await client.graphql({
          query: deleteConversations,
          variables: {
            condition: null,
            input,
          },
        });

        if ("data" in response) {
          logger.info("Successfully deleted conversation:", response.data);
          return response.data;
        } else {
          throw new Error("Unexpected subscription response for mutation");
        }
      } catch (error) {
        logger.error("Failed to delete conversation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    deleteConversation: async (input: DeleteConversationsInput) => {
      await mutation.mutateAsync(input);
    },
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
