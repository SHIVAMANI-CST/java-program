// initially setup user data
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUsersQuery } from "@/graphql/queries/queries";
import { UpdateUserParams } from "@/types/stepper";
import { client } from "@/utils/amplifyGenerateClient";

export const onboardUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateUserParams) => {
      const { userId, firstName, lastName, phone } = params;

      const response = await client.graphql({
        query: updateUsersQuery,
        variables: {
          userId,
          firstName,
          lastName,
          phone,
        },
      });

      if ("data" in response && response.data) {
        return response.data.updateUsers;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};
