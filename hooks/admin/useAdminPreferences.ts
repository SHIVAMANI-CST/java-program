
import { useQuery } from "@tanstack/react-query";
import { listUserPreferences } from "@/graph/customQueries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";

export const useAdminPreferences = () => {
    return useQuery({
        queryKey: ["admin-preferences"],
        queryFn: async () => {
            try {
                const response = await client.graphql({
                    query: listUserPreferences,
                });
                if ("data" in response && response.data) {
                    return response.data.listUserPreferences.items || [];
                }
                return [];
            } catch (error) {
                logger.error("Failed to fetch admin preferences:", error);
            }
        },
        staleTime: staleTimeMs,
    });
};
