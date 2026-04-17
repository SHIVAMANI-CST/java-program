import { useMutation } from "@tanstack/react-query";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { generateOrder } from "@/graph/mutations";
import { GenerateOrderMutation } from "@/graph/API";

// params for this mutation
export type GenerateOrderParams = {
  planId: string;
  userId: string;
  notes?: string;
  receipt?: string;
};

export const useGenerateOrder = () => {
  return useMutation({
    mutationFn: async ({
      planId,
      userId,
      notes,
      receipt,
    }: GenerateOrderParams) => {
      const response = await client.graphql<GenerateOrderMutation>({
        query: generateOrder,
        variables: {
          planId,
          userId,
          notes,
          receipt,
        },
      });

      if ("data" in response && response.data) {
        return response.data.generateOrder;
      }
      return null;
    },
    onError: (error) => {
      logger.error("Failed to generate order:", error);
    },
  });
};
