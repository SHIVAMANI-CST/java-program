// create convo
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversations } from "@/graph/customMutations";
import { CreateConversationParams } from "@/types/home";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateConversationParams) => {
      const { conversationId, title, userId, feature } = params;

      const response = await client.graphql({
        query: createConversations,
        variables: {
          input:{conversationId,
          title,
          userId,
          feature,
         } },
      });

      if ("data" in response && response.data) {
        return response.data.createConversations;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      logger.error("Failed to create conversation:", error);
    },
  });
};
