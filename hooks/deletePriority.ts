// hooks/useDeleteUserModelPriorities.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserModelPriorities } from "@/graphql/queries/queries";
import { client } from "@/utils/amplifyGenerateClient";

interface DeleteUserModelPrioritiesParams {
  userId: string;
}

export const useDeleteUserModelPriorities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: DeleteUserModelPrioritiesParams) => {
      const response = await client.graphql({
        query: deleteUserModelPriorities,
        variables: {
          userId: userId,
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userModelPriorities"] });
    },
  });
};
