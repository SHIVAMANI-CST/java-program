import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserPreferences } from "@/graphql/queries/queries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface UpdateUserPreferencesInput {
  interests?: string[] | null;
  role?: string | null;
  usecases?: string[] | null;
  userId?: string | null;
  userPreferencesId: string;
}

interface UseUpdatePreferencesReturn {
  updateUserPreferences: (input: UpdateUserPreferencesInput) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useUpdatePreferences = (): UseUpdatePreferencesReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: UpdateUserPreferencesInput) => {
      try {
        const response = await client.graphql({
          query: updateUserPreferences,
          variables: {
            input: {
              interests: input.interests,
              role: input.role,
              usecases: input.usecases,
              userId: input.userId,
              userPreferencesId: input.userPreferencesId,
            },
          },
        });

        if ("data" in response && response.data) {
          return response.data;
        }
        throw new Error("No data returned from update mutation");
      } catch (error) {
        logger.error("Failed to update user preferences:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userPreferences", variables.userId],
      });
    },
  });

  return {
    updateUserPreferences: async (input: UpdateUserPreferencesInput) => {
      await mutation.mutateAsync(input);
      return;
    },
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
