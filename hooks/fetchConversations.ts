import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/graphql/queries/queries";
import { client } from "@/utils/amplifyGenerateClient";
import { handleAmplifyError } from "@/utils/errorUtils";
import logger from "@/utils/logger/browserLogger";

export const useConversationFeature = (conversationId: string | null) => {
  return useQuery<string | null>({
    queryKey: ["conversationFeature", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) {
        throw {
          isUnauthorized: false,
          message: "Missing conversationId",
        };
      }

      try {
        const response = await client.graphql({
          query: getConversations,
          variables: { conversationId },
        });

        if (
          "errors" in response &&
          response.errors &&
          response.errors.length > 0
        ) {
          const error = response.errors[0];

          // Check if it's an authorization error
          if (
            (error as { errorType?: string }).errorType === "Unauthorized" ||
            error.message?.includes("Not Authorized")
          ) {
            logger.error(
              "🚫 Unauthorized access to conversation:",
              conversationId
            );
            throw {
              isUnauthorized: true,
              message: "You do not have permission to view this conversation.",
              errorType: "Unauthorized",
              originalError: error,
            };
          }

          // Handle other GraphQL errors
          logger.error("GraphQL error:", error);
          throw {
            isUnauthorized: false,
            message: error.message || "Failed to fetch conversation",
            originalError: error,
          };
        }

        // Check for successful data
        if (
          "data" in response &&
          response.data?.getConversations?.feature !== undefined
        ) {
          return response.data.getConversations.feature;
        } else {
          logger.error("Feature not found in GraphQL response.");
          throw {
            isUnauthorized: false,
            message: "Conversation not found",
          };
        }
      } catch (error: unknown) {
        // Helper type guards
        const isFormattedError = (
          err: unknown
        ): err is { isUnauthorized?: boolean } =>
          typeof err === "object" && err !== null && "isUnauthorized" in err;

        const isGraphQLErrorResponse = (
          err: unknown
        ): err is { errors: Array<{ errorType?: string; message?: string }> } =>
          typeof err === "object" &&
          err !== null &&
          "errors" in err &&
          Array.isArray((err as { errors?: unknown }).errors);

        // If it's already our formatted error, re-throw it
        if (isFormattedError(error)) {
          throw error;
        }

        // Check if the error has GraphQL errors nested
        if (isGraphQLErrorResponse(error)) {
          const graphqlError = error.errors[0];
          if (
            graphqlError.errorType === "Unauthorized" ||
            graphqlError.message?.includes("Not Authorized")
          ) {
            logger.error(
              "🚫 Unauthorized access to conversation:",
              conversationId
            );
            throw {
              isUnauthorized: true,
              message: "You do not have permission to view this conversation.",
              errorType: "Unauthorized",
              originalError: graphqlError,
            };
          }
        }

        logger.error("Error fetching conversation feature:", error);
        handleAmplifyError(error);
        return null;
      }
    },
    retry: false,
  });
};
