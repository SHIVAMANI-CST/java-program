// Delete the apy key list
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserProviderConfig } from "@/graphql/queries/queries";
import { DeleteProviderConfigParams } from "@/types/stepper";
import { client } from "@/utils/amplifyGenerateClient";

export const useDeleteProviderConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteProviderConfigParams) => {
      const { userProviderConfigId } = params;
      return client.graphql({
        query: deleteUserProviderConfig,
        variables: {
          userProviderConfigId,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerConfigs"] });
    },
  });
};
