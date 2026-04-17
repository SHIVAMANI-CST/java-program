import { useQuery } from "@tanstack/react-query";
import { listConversationsByUserIdQuery } from "@/graphql/queries/queries";
import { Conversation } from "@/types/home";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";

export const useListConversations = (userId: string | null) => {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async (): Promise<Conversation[]> => {
      if (!userId) {
        return [];
      }

      try {
        const response = await client.graphql({
          query: listConversationsByUserIdQuery,
          variables: {
            userId,
          },
        });

        if (
          "data" in response &&
          response.data?.listConversationsByUserId?.items
        ) {
          return response.data.listConversationsByUserId.items;
        }
        return [];
      } catch (error) {
        logger.error("Failed to fetch conversations:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: staleTimeMs,
  });
};
