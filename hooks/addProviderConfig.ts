// get the provider list
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserProviderConfig } from "@/graph/mutations";
import { AddProviderConfigParams } from "@/types/stepper";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { parseMessage } from "@/utils/parseMessageUtils";

interface ProviderConfigResponse {
  data: string;
  errorType: string | null;
  isError: boolean | null;
  message: string | null;
  statusCode: number;
}

interface AddUserProviderConfigResponse {
  addUserProviderConfig: ProviderConfigResponse;
}

export const useAddProviderConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddProviderConfigParams) => {
      const { apiKey, providerId, userId, isDefaultProvider } = params;

      const response = await client.graphql<AddUserProviderConfigResponse>({
        query: addUserProviderConfig,
        variables: { apiKey, providerId, userId, isDefaultProvider },
      });

      const graphqlResult = response as { data?: AddUserProviderConfigResponse };
      const data = graphqlResult?.data?.addUserProviderConfig;
      if (!data) {
        throw new Error("Invalid response structure from GraphQL.");
      }

      const { isError, errorType, message, statusCode, data: rawData } = data;

      if (isError || errorType || statusCode !== 200) {
        throw new Error(`Request failed: ${parseMessage(message)}`);
      }

      try {
        return JSON.parse(rawData) as ProviderConfigResponse;
      } catch {
        throw new Error("Failed to parse provider config data.");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerConfigs"] });
    },

    onError: (error) => {
      logger.error("❌ Failed to create provider config:", error);
    },
  });
};
