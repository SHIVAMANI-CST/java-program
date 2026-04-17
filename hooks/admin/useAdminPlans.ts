
import { useQuery } from "@tanstack/react-query";
import { listPlans } from "@/graph/customQueries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";

export const useAdminPlans = () => {
    return useQuery({
        queryKey: ["admin-plans"],
        queryFn: async () => {
            try {
                const response = await client.graphql({
                    query: listPlans,
                });
                if ("data" in response && response.data) {
                    return response.data.listPlans.items || [];
                }
                return [];
            } catch (error) {
                logger.error("Failed to fetch admin plans:", error);
            }
        },
        staleTime: staleTimeMs,
    });
};
