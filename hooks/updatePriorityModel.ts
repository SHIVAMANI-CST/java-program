// update priority models
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserModelPrioritiesFeature } from "@/graph/API";
import { client } from "@/utils/amplifyGenerateClient";
import { updateUserModelPriorities } from "@/graph/customMutations";

export interface UpdateUserModelPriorityParams {
  input: Array<{
    id: string;
    models: string[];
    userId: string;
    feature: UserModelPrioritiesFeature;
  }>;
}

export const useUpdateUserModelPriorities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateUserModelPriorityParams) => {
      const mutationPromises = params.input.map(async (inputItem) => {
        const ownerTuple = [inputItem.userId] as [string];
        const response = await client.graphql({
          query: updateUserModelPriorities,
          variables: {
            input: {
              id: inputItem.id,
              models: inputItem.models,
              userId: inputItem.userId,
              feature: inputItem.feature as UserModelPrioritiesFeature,
              rOwner: ownerTuple,
              rdOwner: ownerTuple,
              ruOwner: ownerTuple,
              rwOwner: ownerTuple,
            },
          },
        });

        if ("data" in response && response.data) {
          return response.data.updateUserModelPriorities;
        }
        return null;
      });

      const results = await Promise.all(mutationPromises);
      return results.filter((result) => result !== null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userModelPriorities"] });
    },
  });
};

