
import { useQuery } from "@tanstack/react-query";
import { getFeedback } from "@/graph/customQueries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";

export const useAdminFeedback = () => {
    return useQuery({
        queryKey: ["admin-feedback"],
        queryFn: async () => {
            try {
                let allFeedback: any[] = [];
                let nextToken: string | null = null;

                do {
                    const response: any = await client.graphql({
                        query: getFeedback,
                        variables: {
                            limit: 999,
                            nextToken: nextToken
                        }
                    });

                    if ("data" in response && response.data?.listAnswers) {
                        const items = response.data.listAnswers.items || [];
                        allFeedback = [...allFeedback, ...items];
                        nextToken = response.data.listAnswers.nextToken;
                    } else {
                        nextToken = null;
                    }
                } while (nextToken);

                // Sort by createdAt descending (newest first)
                return allFeedback.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            } catch (error) {
                logger.error("Failed to fetch admin feedback:", error);
                throw error;
            }
        },
        staleTime: staleTimeMs,
    });
};
