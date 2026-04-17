// List of Providers
import { useQuery } from "@tanstack/react-query";
import { HttpErrorCodes, HttpErrorMessages } from "@/constants/constants";
import { GptProvidersStatus } from "@/graph/API";
import { listGptProviders } from "@/graph/queries";
import { GptProvider } from "@/types/global";
import { client } from "@/utils/amplifyGenerateClient";
import { handleAmplifyError, ExtractErrorMessage } from "@/utils/errorUtils";
import logger from "@/utils/logger/browserLogger";
import { calculateRetryDelay } from "@/utils/retryUtils";
import { gcTimeMs, staleTimeMs } from "@/utils/timeConstants";

export const useGptProviders = () => {
  return useQuery({
    retryOnMount: true,
    queryKey: ["gptProviders"],
    queryFn: async (): Promise<GptProvider[]> => {
      try {
        const response = await client.graphql({
          query: listGptProviders,
          variables: {
            filter: {
              status: {
                eq: GptProvidersStatus.ACTIVE,
              },
            },
          },
        });

        if ("data" in response && response.data) {
          return (
            response.data.listGptProviders?.items?.map((item) => ({
              ...item,
              providerName: item.providerName ?? "",
              requiresKey: item.requiresKey ?? true,
            })) || []
          );
        }

        throw new Error("No data received from listGptProviders query");
      } catch (error) {
        logger.error("❌ Error in useGptProviders:", error);
        handleAmplifyError(error);

        throw error;
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
    retryDelay: (attemptIndex) => {
      return calculateRetryDelay(attemptIndex);
    },
    staleTime: staleTimeMs, // 5 minutes
    gcTime: gcTimeMs, // 10 minutes
  });
};
