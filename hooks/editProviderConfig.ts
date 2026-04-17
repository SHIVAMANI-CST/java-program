import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editUserProviderConfig } from "@/graphql/queries/queries";
import {
  EditProviderConfigParams,
  EditProviderConfigResponse,
} from "@/types/stepper";
import { client } from "@/utils/amplifyGenerateClient";
import { throwMissingParamError } from "@/utils/errorUtils";
import logger from "@/utils/logger/browserLogger";
import { parseMessage } from "@/utils/parseMessageUtils";
import { calculateRetryDelay } from "@/utils/retryUtils";

interface GraphQLResponse {
  data?: EditProviderConfigResponse;
  errors?: { message?: string }[];
}

export const useEditProviderConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EditProviderConfigParams) => {
      try {
        if (!input.userProviderConfigId) {
          throwMissingParamError("userProviderConfigId");
        }

        const response = await client.graphql({
          query: editUserProviderConfig,
          variables: {
            apiKey: input.apiKey,
            providerId: input.providerId,
            userId: input.userId,
            userProviderConfigId: input.userProviderConfigId,
          },
        });

        const typed = response as GraphQLResponse;

        if (!typed?.data?.editUserProviderConfig) {
          throw new Error(
            "No data returned from editUserProviderConfig mutation"
          );
        }

        const result = typed.data.editUserProviderConfig;
        const { data, message, statusCode } = result;

        if (statusCode !== 200 || (data === null && message)) {
          throw new Error(`Request failed: ${parseMessage(message)}`);
        }

        return result;
      } catch (error) {
        logger.error("❌ Error in useEditProviderConfig:", error);
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerConfigs"] });
    },

    retryDelay: (attemptIndex) => {
      return calculateRetryDelay(attemptIndex);
    },
  });
};
