// update the user
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUsers } from "@/graphql/queries/queries";
import { UpdateUserParams } from "@/types/stepper";
import { client } from "@/utils/amplifyGenerateClient";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateUserParams) => {
      const {
        userId,
        firstName,
        lastName,
        phone,
        signupStatus,
        authenticationType,
        isNewUser,
        countryId,
      } = params;

      const response = await client.graphql({
        query: updateUsers,
        variables: {
          input: {
            userId,
            firstName,
            lastName,
            phone,
            signupStatus,
            authenticationType,
            isNewUser,
            countryId,
          },
        },
      });

      if ("data" in response && response.data) {
        return response.data.updateUsers;
      }
      return null;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};
