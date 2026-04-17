// To get list of set api keys
import { useMutation } from "@tanstack/react-query";
import { HttpErrorCodes, HttpErrorMessages } from "@/constants/constants";
import { fetchUserProviderConfigs } from "@/graphql/queries/queries";
import {
  FetchUserProviderConfigsVariables,
  GraphQLResponse,
  ParsedFetchUserProviderConfigsResponse,
  ProviderConfigResult,
  UserProviderConfig,
} from "@/types/stepper";
import { client } from "@/utils/amplifyGenerateClient";
import {
  ExtractErrorMessage,
  handleAmplifyError,
  handleGraphQLErrors,
} from "@/utils/errorUtils";
import logger from "@/utils/logger/browserLogger";
import { calculateRetryDelay } from "@/utils/retryUtils";

export const useFetchUserProviderConfigs = () => {
  return useMutation<
    ParsedFetchUserProviderConfigsResponse,
    Error,
    FetchUserProviderConfigsVariables
  >({
    mutationFn: async (
      variables: FetchUserProviderConfigsVariables
    ): Promise<ParsedFetchUserProviderConfigsResponse> => {
      try {
        if (!variables.userId) {
          handleGraphQLErrors([{ message: "Missing userId" }]);
        }

        const response = await client.graphql({
          query: fetchUserProviderConfigs,
          variables,
        });

        let result: ProviderConfigResult | null = null;

        if ("data" in response && response.data) {
          const typedResponse = response as GraphQLResponse;
          result = typedResponse.data?.fetchUserProviderConfigs ?? null;
        }

        if (!result) {
          throw new Error("No data received from server");
        }

        let parsedData: UserProviderConfig[] = [];

        if (result.data) {
          if (typeof result.data === "string") {
            try {
              parsedData = JSON.parse(result.data);
            } catch (parseError) {
              logger.error("Error parsing provider configs data:", parseError);
              throw new Error("Invalid data format received from server");
            }
          } else {
            parsedData = result.data as UserProviderConfig[];
          }
        }

        return {
          data: parsedData,
          message: result.message ?? null,
          statusCode: result.statusCode ?? 0,
        };
      } catch (error) {
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
  });
};
