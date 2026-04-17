// List of models
import { useQuery } from "@tanstack/react-query";
import { HttpErrorCodes, HttpErrorMessages } from "@/constants/constants";
import { getModels } from "@/graphql/queries/queries";
import { client } from "@/utils/amplifyGenerateClient";
import { handleAmplifyError, ExtractErrorMessage } from "@/utils/errorUtils";
import logger from "@/utils/logger/browserLogger";
import { calculateRetryDelay } from "@/utils/retryUtils";
import { gcTimeMs, staleTimeMs } from "@/utils/timeConstants";

export interface ProviderModel {
  modelId: string;
  modelName: string;
  providerId: string;
  status?: string;
  label?: {
    label?: string | null;
  } | null;
  modelType?: string | null;
  provider?: {
    providerName?: string | null;
    showLabel?: boolean | null;
  } | null;
}

interface GraphQLResponse {
  data?: {
    listProviderModels?: {
      items?: ProviderModel[];
    };
  };
}

export const useProviderModels = (providerIds?: string[]) => {
  return useQuery({
    retryOnMount: true,
    queryKey: ["providerModels", providerIds],

    queryFn: async (): Promise<ProviderModel[]> => {
      try {
        const response = await client.graphql({
          query: getModels,
        });

        const typed = response as GraphQLResponse;
        const allModels = typed?.data?.listProviderModels?.items || [];

        if (providerIds && providerIds.length > 0) {
          return allModels.filter((model) =>
            providerIds.includes(model.providerId)
          );
        }

        return allModels;
      } catch (error) {
        logger.error("❌ Error fetching provider models:", error);
        handleAmplifyError(error);
        return [];
      }
    },

    retry: (failureCount, error) => {
      const message = ExtractErrorMessage(error);
      const unauthorizedRegex = new RegExp(
        `${HttpErrorCodes.UNAUTHORIZED}|${HttpErrorCodes.FORBIDDEN}|${HttpErrorMessages.UNAUTHORIZED}`,
        "i"
      );
      return !unauthorizedRegex.test(message) && failureCount < 3;
    },

    retryDelay: (attemptIndex) => calculateRetryDelay(attemptIndex),

    staleTime: staleTimeMs,
    gcTime: gcTimeMs,
  });
};
