// get the user data
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/graph/queries";
import { useUserId } from "@/lib/getUserId";
import { client } from "@/utils/amplifyGenerateClient";
import { staleTimeMs } from "@/utils/timeConstants";

export const useGetUser = (userId: string, options = {}) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const actualUserId = userId ?? useUserId();
      const response = await client.graphql({
        query: getUsers,
        variables: { userId: actualUserId },
      });

      if ("data" in response && response.data) {
        return response.data.getUsers;
      }

      return null;
    },
    enabled: !!userId, // only runs if userId is truthy
    staleTime: staleTimeMs, // ✅ cache for 5 minutes
    refetchOnMount: false, // ✅ prevents refetching on every remount
    refetchOnWindowFocus: false, // ✅ prevents refetch on window/tab switch
    retry: false, // optional: disables retry logic if userId is unreliable
    ...options,
  });
};
