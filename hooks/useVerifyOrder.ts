import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { verifyOrder } from "@/graph/mutations";
import type { VerifyOrderMutation } from "@/graph/API";
import type { VerifyOrderPaymentStatus } from "@/graph/API";

// Params for verifyOrder
export type VerifyOrderParams = {
  paymentStatus: VerifyOrderPaymentStatus;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export const useVerifyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<
    VerifyOrderMutation["verifyOrder"],
    Error,
    VerifyOrderParams
  >({
    mutationFn: async ({
      paymentStatus,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }: VerifyOrderParams) => {
      const response = await client.graphql<VerifyOrderMutation>({
        query: verifyOrder,
        variables: {
          paymentStatus,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      });

      if ("data" in response && response.data) {
        return response.data.verifyOrder;
      }
      return null;
    },
    onSuccess: () => {
      // Invalidate admin dashboard queries
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });

      // Invalidate user-specific queries
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
    },
    onError: (error) => {
      logger.error("Failed to verify order:", error);
    },
  });
};
