import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserSubscriptionsStatus } from "@/graph/API";
import { createUserSubscriptions } from "@/graph/customMutations";
import {
  CreateUserSubscriptionParams,
  UserSubscriptionResponse,
} from "@/types/global";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

export const useCreateUserSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UserSubscriptionResponse | null,
    Error,
    CreateUserSubscriptionParams
  >({
    mutationFn: async (params: CreateUserSubscriptionParams) => {
      const { userSubscriptionId, status, planId, userId } = params;

      const matchedStatus =
        UserSubscriptionsStatus[
          status as keyof typeof UserSubscriptionsStatus
        ] ?? null;

      const response = await client.graphql({
        query: createUserSubscriptions,
        variables: {
          input: {
            userSubscriptionId,
            planId,
            status: matchedStatus,
            userId,
          },
        },
      });

      if ("data" in response && response.data) {
        return (
          (response.data
            ?.createUserSubscriptions as UserSubscriptionResponse) ?? null
        );
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
    onError: (error) => {
      logger.error("Failed to create user subscription:", error);
    },
  });
};
