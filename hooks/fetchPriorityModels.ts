//to get the order of the priority models
import { useQuery } from "@tanstack/react-query";
import { listUserModelPrioritiesByUserId } from "@/graph/queries";
// import { listUserModelPriorities } from "@/graphql/queries/queries";
import {
  ListUserModelPrioritiesResponse,
  UserModelPriority,
} from "@/types/settings";
import { client } from "@/utils/amplifyGenerateClient";
import { handleAmplifyError, handleGraphQLErrors } from "@/utils/errorUtils";
import logger from "@/utils/logger/browserLogger";

export const useUserModelPriorities = (userId: string | undefined) => {
  return useQuery<UserModelPriority[]>({
    queryKey: ["userModelPriorities", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 mins: data stays “fresh”
    gcTime: 1000 * 60 * 30, // 30 mins: cache kept even if unused
    refetchOnWindowFocus: false, // optional: prevents random refetches
    refetchOnReconnect: false, // optional: prevents random refetches
    queryFn: async () => {
      if (!userId) {
        handleGraphQLErrors([{ message: "Missing userId" }]);
        return [];
      }

      try {
        const response = await client.graphql<ListUserModelPrioritiesResponse>({
          query: listUserModelPrioritiesByUserId,
          variables: { userId },
        });

        if (
          "data" in response &&
          response.data?.listUserModelPrioritiesByUserId?.items
        ) {
          return response.data.listUserModelPrioritiesByUserId.items;
        } else {
          logger.error("GraphQL response missing 'data' property or items.");
          return [];
        }
      } catch (error) {
        logger.error("Error fetching user model priorities:", error);
        handleAmplifyError(error);
        return [];
      }
    },
  });
};
