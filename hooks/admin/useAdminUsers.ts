import { useQuery } from "@tanstack/react-query";
import { users, UsersSignupStatus } from "@/graph/API";
import { listUsers } from "@/graph/customQueries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";
import { staleTimeMs } from "@/utils/timeConstants";

interface AdminUsersResponse {
  users: users[];
  totalCount: number;
}

export const useAdminUsers = () => {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        let allUsers: users[] = [];
        let nextToken: string | null = null;
        let pageCount = 0;

        // Fetch all pages recursively
        do {
          pageCount++;
          logger.info(
            `Fetching admin users page ${pageCount}${nextToken ? ` with token` : ""}`
          );

          const response: any = await client.graphql({
            query: listUsers,
            variables: nextToken ? { nextToken } : undefined,
          });

          if ("data" in response && response.data) {
            const items = response.data.listUsers.items || [];
            allUsers = [
              ...allUsers,
              ...items.filter((item: any): item is users => item !== null),
            ];
            nextToken = response.data.listUsers.nextToken || null;

            logger.info(
              `Page ${pageCount}: Fetched ${items.length} users, Total so far: ${allUsers.length}`
            );
          } else {
            break;
          }
        } while (nextToken);

        // Calculate total count excluding deleted users
        const activeUsersCount = allUsers.filter(
          (user) => user.signupStatus !== UsersSignupStatus.DELETED
        ).length;

        logger.info(
          `✅ Completed fetching all users. Total: ${allUsers.length} (Active: ${activeUsersCount}) across ${pageCount} pages`
        );

        return {
          users: allUsers, // Return ALL users for the table
          totalCount: activeUsersCount, // Return ONLY active count for the dashboard card
        };
      } catch (error: any) {
        logger.error("Failed to fetch admin users:", error);

        // Propagate authentication errors instead of silently returning empty data
        if (error?.name === "NotAuthorizedException" || error?.name === "UnauthorizedException") {
          throw error;
        }

        // For other errors, also throw to show proper error message
        throw error;
      }
    },
    staleTime: staleTimeMs,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.name === "NotAuthorizedException") return false;
      if (error?.name === "UnauthorizedException") return false;
      return failureCount < 1;
    },
  });
};
