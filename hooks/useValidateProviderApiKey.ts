import { useMutation } from "@tanstack/react-query";
import { validateProviderApiKey } from "@/graph/mutations";
import { client } from "@/utils/amplifyGenerateClient";

export const useValidateProviderApiKey = () => {
  return useMutation({
    mutationFn: async ({
      apiKey,
      providerId,
    }: {
      apiKey: string;
      providerId: string;
    }) => {
      const res = await client.graphql({
        query: validateProviderApiKey,
        variables: { apiKey, providerId },
      });

      return res.data.validateProviderApiKey;
    },
  });
};
