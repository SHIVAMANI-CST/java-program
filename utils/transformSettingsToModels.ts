/* eslint-disable @typescript-eslint/naming-convention */
// utils/transformSettingsToModels.ts
import { generateUniqueId, getCurrentISOString } from "./dateUtils";

interface ProviderConfig {
  userProviderConfigId: string;
  userId: string;
  providerId: string;
  apiKey: string | null;
}

interface ModelPriorityConfig {
  id: string;
  userId: string;
  feature: string;
  models: string[];
  rOwner: [string];
  rdOwner: [string];
  ruOwner: [string];
  rwOwner: [string];
  createdAt: string;
  updatedAt: string;
}

interface Model {
  modelId: string;
  priority: number;
  modelName: string;
  providerId: string;
}

interface SettingsItem {
  type: string;
  value: string[];
  id: string;
}

interface GraphQLDefaultSetting {
  __typename: "defaultSettings";
  id: string;
  type?: string | null;
  value?: (string | null)[] | null;
  createdAt: string;
  updatedAt: string;
  planId?: string | null;
  timestamp?: string | null;
}

export function transformSettingsToModels(
  data: (GraphQLDefaultSetting | null)[],
  userId: string
): {
  providerConfigs: ProviderConfig[];
  modelPriorityConfigs: ModelPriorityConfig[];
} {
  const providerConfigs: ProviderConfig[] = [];
  const modelPriorityConfigs: ModelPriorityConfig[] = [];

  const safeData: SettingsItem[] = data
    .filter((item): item is GraphQLDefaultSetting => item !== null)
    .map((item) => ({
      id: item.id,
      type: item.type ?? "",
      value: (item.value ?? []).filter((v): v is string => v !== null),
    }));

  const createOwnerTuple = (id: string): [string] => [id];

  safeData.forEach((item) => {
    const { type, value, id } = item;

    if (type === "FREE_PROVIDERS") {
      value.forEach((val) => {
        const parsed = JSON.parse(val) as { providerId: string };

        providerConfigs.push({
          userProviderConfigId: generateUniqueId(),
          userId,
          providerId: parsed.providerId,
          apiKey: null,
        });
      });
    } else if (type.startsWith("FREE_MODELS_")) {
      const models: Model[] = value.map((val) => JSON.parse(val) as Model);

      const formattedModels: string[] = [
        JSON.stringify(
          models.map((m) => ({
            modelId: m.modelId,
            priority: m.priority,
            modelName: m.modelName,
            providerId: m.providerId,
            rOwner: createOwnerTuple(userId),
            rdOwner: createOwnerTuple(userId),
            ruOwner: createOwnerTuple(userId),
            rwOwner: createOwnerTuple(userId),
          }))
        ),
      ];

      const feature = type.replace("FREE_MODELS_", "");

      modelPriorityConfigs.push({
        id,
        userId,
        feature,
        models: formattedModels,
        rOwner: createOwnerTuple(userId),
        rdOwner: createOwnerTuple(userId),
        ruOwner: createOwnerTuple(userId),
        rwOwner: createOwnerTuple(userId),
        createdAt: getCurrentISOString(),
        updatedAt: getCurrentISOString(),
      });
    }
  });

  return {
    providerConfigs,
    modelPriorityConfigs,
  };
}
