import { useQuery } from "@tanstack/react-query";
import { PlansStatus } from "@/graph/API";
import { listPlansByCountryId } from "@/graphql/queries/queries";
import { client } from "@/utils/amplifyGenerateClient";
import { handleAmplifyError } from "@/utils/errorUtils";
import logger from "@/utils/logger/browserLogger";

export const useSubscriptionPlans = (countryId?: string | null) => {
  return useQuery({
    queryKey: ["plans", countryId],
    queryFn: async () => {
      if (!countryId) {
        return [];
      }
      try {
        const response = await client.graphql({
          query: listPlansByCountryId,
          variables: { countryId ,
            filter: {
              status: { eq: PlansStatus.ACTIVE }
            },},
        });

        if ("data" in response && response.data?.listPlansByCountryId?.items) {
          return response.data.listPlansByCountryId.items;
        } else {
          logger.error("GraphQL response missing 'data' or 'items'.");
          return [];
        }
      } catch (error) {
        logger.error(`Error fetching plans for countryId ${countryId}:`, error);
        handleAmplifyError(error);
        return [];
      }
    },
    enabled: !!countryId,
  });
};
