import { useQuery } from "@tanstack/react-query";
import { userPreferences } from "@/graph/API";
import { listUserPreferencesByUserId } from "@/graph/queries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs, gcTimeMs } from "@/utils/timeConstants";

interface UseFetchUserPreferencesIdReturn {
  userPreferences: userPreferences[];
  isLoading: boolean;
  error: Error | null;
}

export const fetchUserPreferencesByUserId = (
  userId: string
): UseFetchUserPreferencesIdReturn => {
  const {
    data: userPreferences = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userPreferences", userId],
    queryFn: async (): Promise<userPreferences[]> => {
      try {
        const response = await client.graphql({
          query: listUserPreferencesByUserId,
          variables: { userId },
        });

        const items = response.data?.listUserPreferencesByUserId?.items ?? [];
        return items as userPreferences[];
      } catch (error) {
        logger.error(`Failed to fetch userPreferences for userId:`, error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: staleTimeMs,
    gcTime: gcTimeMs,
  });

  return {
    userPreferences,
    isLoading,
    error: error as Error | null,
  };
};
