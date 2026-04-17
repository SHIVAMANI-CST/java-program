import { useQuery } from "@tanstack/react-query";
import { paymentInformation } from "@/graph/API";
import { listPaymentInformations } from "@/graph/customQueries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";

interface AdminTransactionsResponse {
  transactions: paymentInformation[];
  totalCount: number;
  totalRevenue: number;
  currencySymbol: string;
}

export const useAdminTransactions = () => {
  return useQuery<AdminTransactionsResponse>({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      try {
        let allTransactions: paymentInformation[] = [];
        let nextToken: string | null = null;
        let pageCount = 0;

        // Fetch all pages recursively
        do {
          pageCount++;
          logger.info(
            `Fetching admin transactions page ${pageCount}${nextToken ? ` with token` : ""}`
          );

          const response: any = await client.graphql({
            query: listPaymentInformations,
            variables: nextToken ? { nextToken } : undefined,
          });

          if ("data" in response && response.data) {
            const items = response.data.listPaymentInformations.items || [];
            allTransactions = [
              ...allTransactions,
              ...items.filter(
                (item: any): item is paymentInformation => item !== null
              ),
            ];
            nextToken = response.data.listPaymentInformations.nextToken || null;

            logger.info(
              `Page ${pageCount}: Fetched ${items.length} transactions, Total so far: ${allTransactions.length}`
            );
          } else {
            break;
          }
        } while (nextToken);

        // Filter successful transactions and calculate revenue
        const successfulPayments = allTransactions.filter(
          (t) => t.status === "captured" || t.status === "success"
        );
        const totalRevenue =
          successfulPayments.reduce(
            (acc, curr) => acc + (curr.amount || 0),
            0
          ) / 100;
        const currencySymbol =
          successfulPayments.length > 0
            ? successfulPayments[0].currency === "INR"
              ? "₹"
              : "$"
            : "$";

        logger.info(
          `✅ Completed fetching all transactions. Total: ${allTransactions.length} (Successful: ${successfulPayments.length}) across ${pageCount} pages`
        );
        logger.info(
          `💰 Total Revenue: ${currencySymbol}${totalRevenue.toFixed(2)}`
        );

        return {
          transactions: allTransactions,
          totalCount: allTransactions.length,
          totalRevenue,
          currencySymbol,
        };
      } catch (error) {
        logger.error("Failed to fetch admin transactions:", error);
        return {
          transactions: [],
          totalCount: 0,
          totalRevenue: 0,
          currencySymbol: "$",
        };
      }
    },
    staleTime: staleTimeMs,
  });
};
