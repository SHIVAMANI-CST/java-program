import { useAuthenticator } from "@aws-amplify/ui-react";
import { useQuery } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

// Amplify is configured in app/providers-wrapper.tsx
const client = generateClient<any>();

export const useGuestListCountries = () => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const authMode = "identityPool";

      const result = await client.models.country.list({ authMode });

      if (!result.data) {
        throw new Error("Invalid response structure for countries list");
      }
      return result.data;
    },
    enabled: authStatus !== "configuring",
  });
};
