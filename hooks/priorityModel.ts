// setup priority models
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateUserModelPriorityFeature } from "@/graph/API";
import { createUserModelPriorities } from "@/graphql/queries/queries";
import { CreateUserModelPriorityParams } from "@/types/stepper";
import { client } from "@/utils/amplifyGenerateClient";

export const useAddUserModelPriorities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateUserModelPriorityParams) => {
      const mutationPromises = params.input.map(async (inputItem) => {
        const ownerTuple = [inputItem.userId] as [string];
        const response = await client.graphql({
          query: createUserModelPriorities,
          variables: {
            input: {
              models: [inputItem.models],
              userId: inputItem.userId,
              feature: inputItem.feature as CreateUserModelPriorityFeature,
              rOwner: ownerTuple,
              rdOwner: ownerTuple,
              ruOwner: ownerTuple,
              rwOwner: ownerTuple,
            },
          } 
        });

        if ("data" in response && response.data) {
          return response.data.createUserModelPriority;
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
