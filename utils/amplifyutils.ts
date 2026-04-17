import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth/server";
import { cookies } from "next/headers";

import outputs from "@/amplify_outputs.json";
import logger from "@/utils/logger/browserLogger";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export async function AuthGetCurrentUserServer() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    return currentUser;
  } catch (error) {
    logger.error(error);
  }
}

export const getAuthUser = async () => {
  try {
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
  } catch (err) {
    logger.info(err);
    return false;
  }
};

export const getFetchUserAttr = async () => {
  try {
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchUserAttributes(contextSpec),
    });
  } catch (err) {
    logger.info(err);
    return false;
  }
};
