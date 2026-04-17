import { useQuery } from "@tanstack/react-query";
import { PlansPlanType, UserSubscriptionsStatus, userSubscriptions, UsersSignupStatus } from "@/graph/API";
import { listUserSubscriptions } from "@/graph/customQueries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";

interface AdminSubscriptionsResponse {
  subscriptions: userSubscriptions[];
  totalCount: number;
  paidCount: number;
  freeCount: number;
}

export const useAdminSubscriptions = () => {
  return useQuery<AdminSubscriptionsResponse>({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      try {
        let allSubscriptions: userSubscriptions[] = [];
        let nextToken: string | null = null;
        let pageCount = 0;

        // Fetch all pages recursively
        do {
          pageCount++;
          logger.info(
            `Fetching admin subscriptions page ${pageCount}${nextToken ? ` with token` : ""}`
          );

          const response: any = await client.graphql({
            query: listUserSubscriptions,
            variables: {
              filter: { status: { eq: UserSubscriptionsStatus.ACTIVE } },
              ...(nextToken ? { nextToken } : {}),
            },
          });

          if ("data" in response && response.data) {
            const items = response.data.listUserSubscriptions.items || [];
            allSubscriptions = [
              ...allSubscriptions,
              ...items.filter(
                (item: any): item is userSubscriptions => item !== null
              ),
            ];
            nextToken = response.data.listUserSubscriptions.nextToken || null;

            logger.info(
              `Page ${pageCount}: Fetched ${items.length} subscriptions, Total so far: ${allSubscriptions.length}`
            );
          } else {
            break;
          }
        } while (nextToken);

        // Calculate counts
        const paidUsers = new Set<string>();
        const freeUsers = new Set<string>();

        allSubscriptions.forEach((sub) => {
          if (sub.userId && sub.user?.signupStatus !== UsersSignupStatus.DELETED) {
            if (sub.plan?.planType === PlansPlanType.PAID) {
              paidUsers.add(sub.userId);
            } else if (sub.plan?.planType === PlansPlanType.FREE) {
              freeUsers.add(sub.userId);
            }
          }
        });

        const paidCount = paidUsers.size;
        const freeCount = Array.from(freeUsers).filter(
          (userId) => !paidUsers.has(userId)
        ).length;

        logger.info(
          `✅ Completed fetching all subscriptions. Total: ${allSubscriptions.length} (Paid: ${paidCount}, Free: ${freeCount}) across ${pageCount} pages`
        );

        return {
          subscriptions: allSubscriptions,
          totalCount: allSubscriptions.length,
          paidCount,
          freeCount,
        };
      } catch (error) {
        logger.error("Failed to fetch admin subscriptions:", error);
        return {
          subscriptions: [],
          totalCount: 0,
          paidCount: 0,
          freeCount: 0,
        };
      }
    },
    staleTime: staleTimeMs,
  });
};
