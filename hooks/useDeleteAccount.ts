import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "@/graph/mutations";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface DeleteAccountParams {
  userId: string;
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: DeleteAccountParams) => {
      try {
        const response = await client.graphql({
          query: deleteAccount,
          variables: { userId },
        });

        const result = response?.data?.deleteAccount;
        return result;
      } catch (error) {
        logger.error("Error deleting account:", error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      const userId = variables?.userId;
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["userSubscriptions", userId] });
      }
    },
  });
};
