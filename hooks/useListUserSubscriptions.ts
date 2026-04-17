import { useQuery } from "@tanstack/react-query";
import { UserSubscriptionsStatus } from "@/graph/API";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";
import { listUserSubscriptionsByUserId } from "@/graph/customMutations";

export interface Plan {
  displayTag?: string | null;
  planName?: string | null;
  planId: string;
  planDuration?: number | null;
  planType?: string | null;
  status?: string | null;
  description?: string | null;
  price?: number | null;
  isSubPlan?: boolean | null;
  subPlan?: string | null;
  country?: {
    currency?: string | null;
  } | null;
  features?: Array<string | null> | null;
}

export interface PaymentInformation {
  wallet?: string | null;
  vpa?: string | null;
  userId: string;
  updatedAt: string;
  totalPrice?: number | null;
  status: string;
  tax?: number | null;
  platformFee?: number | null;
  paymentInfoId: string;
  notes?: string | null;
  orderId: string;
  method?: string | null;
  email?: string | null;
  currency?: string | null;
  createdAt: string;
  contact?: string | null;
  card?: string | null;
  captured?: boolean | null;
  amount?: number | null; // in smallest unit (e.g. paise)
  bank?: string | null;
}

export interface UserSubscription {
  createdAt: string;
  endDate?: string | null;
  paymentInfoId?: string | null | undefined;
  planId?: string | null;
  startDate?: string | null;
  status?: string | null;
  timestamp?: string | null;
  updatedAt: string;
  userId?: string | null;
  userSubscriptionId: string;
  paymentInformation?: PaymentInformation | null;
  plan?: Plan | null;
}


export const useListUserSubscriptions = (userId: string | null) => {
  return useQuery({
    queryKey: ["userSubscriptions", userId],
    queryFn: async (): Promise<UserSubscription[]> => {
      if (!userId) {
        return [];
      }

      try {
        const response = await client.graphql({
          query: listUserSubscriptionsByUserId,
          variables: {
            userId,
            filter: {
              or: [
                { status: { eq: UserSubscriptionsStatus.ACTIVE } },
                { status: { eq: UserSubscriptionsStatus.INACTIVE } },
              ],
            },
          },
        });

        if (
          "data" in response &&
          response.data?.listUserSubscriptionsByUserId?.items
        ) {
          return response.data.listUserSubscriptionsByUserId.items;
        }
        return [];
      } catch (error) {
        logger.error("Failed to fetch user subscriptions:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: staleTimeMs,
  });
};