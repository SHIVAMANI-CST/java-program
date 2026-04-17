import type * as APITypes from "@/graph/API"; 
import { listDefaultSettings } from "@/graph/queries";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

export async function FetchDefaultSettings(
  variables?: APITypes.ListDefaultSettingsQueryVariables
) {
  try {
    const response = await client.graphql({
      query: listDefaultSettings,
      variables,
    });

    const typed = response as {
      data?: APITypes.ListDefaultSettingsQuery;
    };

    return typed?.data?.listDefaultSettings?.items ?? [];
  } catch (error) {
    logger.error("❌ Error fetching default settings:", error);
    throw error;
  }
}
