import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserSubscriptions } from "@/graph/customMutations";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface DeleteUserSubscriptionParams {
  userSubscriptionId: string;
}

export const useDeleteUserSubscription = (userId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userSubscriptionId,
    }: DeleteUserSubscriptionParams) => {
      try {
        const response = await client.graphql({
          query: deleteUserSubscriptions,
          variables: {
            input: { userSubscriptionId },
          },
        });

        return response?.data?.deleteUserSubscriptions;
      } catch (error) {
        logger.error("Failed to delete subscription:", error);
        throw error;
      }
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["userSubscriptions", userId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
  });
};


