import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { createUserPreferences } from "@/graphql/queries/queries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

interface CreateUserPreferencesInput {
  interests?: string[] | null;
  role?: string | null;
  timestamp?: string | null;
  usecases?: string[] | null;
  userId: string;
}

interface UseCreatePreferencesReturn {
  createUserPreferences: (input: CreateUserPreferencesInput) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useCreatePreferences = (): UseCreatePreferencesReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CreateUserPreferencesInput) => {
      const response = await client.graphql({
        query: createUserPreferences,
        variables: {
          input: {
            userPreferencesId: uuidv4(),
            interests: input.interests,
            role: input.role,
            usecases: input.usecases,
            userId: input.userId,
            rOwner: [input.userId],
            rdOwner: [input.userId],
            ruOwner: [input.userId],
            rwOwner: [input.userId],
          },
        },
      });

      if ("data" in response && response.data) {
        return response.data;
      }
      throw new Error("No data returned from create mutation");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userPreferences", variables.userId],
      });
    },
    onError: (error) => {
      logger.error("Failed to create user preferences:", error);
    },
  });

  return {
    createUserPreferences: async (input: CreateUserPreferencesInput) => {
      await mutation.mutateAsync(input);
    },
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
