import { useAuthenticator } from "@aws-amplify/ui-react";
import { useQuery } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

// Amplify is configured in app/providers-wrapper.tsx
const client = generateClient<any>();

export const useAppStatus = () => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  return useQuery({
    queryKey: ["appStatus"],
    queryFn: async () => {
      // Amplify client automatically handles authentication
      const result = await client.models.appConfigStatus.list({});

      if (!result.data) {
        throw new Error("Invalid response structure for app config list");
      }
      return result.data;
    },
    enabled: authStatus !== "configuring",
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.name === "NotAuthorizedException") return false;
      if (error?.name === "UnauthorizedException") return false;
      return failureCount < 1;
    },
  });
};
