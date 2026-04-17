import { useQuery } from "@tanstack/react-query";
import { PreferencesType } from "@/graph/API";
import { listPreferences } from "@/graph/queries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs, gcTimeMs } from "@/utils/timeConstants";

interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
}

interface UsePreferencesReturn {
  data: PreferenceItem[];
  isLoading: boolean;
  error: Error | null;
}

export const usePreferences = (type: PreferencesType): UsePreferencesReturn => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["preferences", type],
    queryFn: async (): Promise<PreferenceItem[]> => {
      const response = await client.graphql({
        query: listPreferences,
        variables: {
          filter: {
            type: {
              eq: type,
            },
          },
        },
      });

      if ("data" in response && response.data?.listPreferences?.items) {
        const items = response.data.listPreferences.items ?? [];
        const parsedData: PreferenceItem[] = [];

        items.forEach((item) => {
          if (item?.value && Array.isArray(item.value)) {
            item.value.forEach((valueString) => {
              try {
                if (typeof valueString === "string") {
                  const parsed = JSON.parse(valueString);
                  parsedData.push({
                    id: parsed.id,
                    title: parsed.title,
                    description: parsed.description,
                  });
                }
              } catch (parseError) {
                logger.error("Failed to parse preference value:", parseError);
              }
            });
          }
        });

        return parsedData;
      }

      return [];
    },
    enabled: !!type,
    staleTime: staleTimeMs,
    gcTime: gcTimeMs,
    meta: {
      errorMessage: `Failed to fetch preferences for type ${type}`,
    },
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
  };
};
