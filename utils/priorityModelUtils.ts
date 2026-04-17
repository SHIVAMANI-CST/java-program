// priorityModelUtils.ts

import { ModelPriority } from "@/types/global";
import { GptProvider, SelectOption, PriorityModelData } from "@/types/stepper";
import { isValidArray, sortByLabel } from "@/utils/arrayUtils";

/**
 * Transforms provider data into select options
 */
export const createPriorityOptions = (
  providerOptions: GptProvider[]
): SelectOption[] => {
  if (!isValidArray<SelectOption>(providerOptions)) return [];

  const mapped = providerOptions.map((item: GptProvider) => ({
    label: item.providerName,
    value: item.providerId,
  }));

  return sortByLabel(mapped);
};

/**
 * Gets the default priority models structure
 */
export const getDefaultPriorityModels = (): PriorityModelData => ({
  modelA: {},
  modelB: {},
  modelC: {},
  modelD: {},
});

/**
 * Gets the current model data for a specific model type
 */
export const getCurrentModelData = (
  priorityModels: PriorityModelData | undefined,
  modelType: keyof PriorityModelData
): ModelPriority => {
  const currentModels = priorityModels || getDefaultPriorityModels();
  return currentModels[modelType as string] || {};
};

/**
 * Gets selected values for a model, excluding the current priority key
 */
export const getSelectedValues = (
  modelData: ModelPriority,
  excludeKey: keyof ModelPriority
): string[] => {
  return Object.values(modelData).filter((value, index) => {
    const keys = Object.keys(modelData) as (keyof ModelPriority)[];
    const currentKey = keys[index];
    return value && value !== "" && currentKey !== excludeKey;
  }) as string[];
};

/**
 * Filters options to exclude already selected values
 */
export const getFilteredOptions = (
  allOptions: SelectOption[],
  priorityModels: PriorityModelData | undefined,
  modelType: keyof PriorityModelData,
  priorityKey: keyof ModelPriority
): SelectOption[] => {
  const currentModelData = getCurrentModelData(priorityModels, modelType);
  const selectedValues = getSelectedValues(currentModelData, priorityKey);

  return allOptions.filter(
    (option) => !selectedValues.includes(option.value as string)
  );
};

/**
 * Creates updated priority models with new value
 */
export const updatePriorityModels = (
  currentPriorityModels: PriorityModelData | undefined,
  modelType: keyof PriorityModelData,
  priorityKey: keyof ModelPriority,
  value: string
): PriorityModelData => {
  const currentModels = currentPriorityModels || getDefaultPriorityModels();
  const currentModelData = getCurrentModelData(currentModels, modelType);

  return {
    ...currentModels,
    [modelType]: {
      ...currentModelData,
      [priorityKey]: value,
    },
  };
};

/**
 * Priority configuration for different model types
 */
export const priorityConfig = {
  modelA: {
    title: "Optimize",
    tooltip: "Optimization",
    hasMultiplePriorities: true,
  },
  modelB: {
    title: "Compare",
    tooltip: "Comparison",
    hasMultiplePriorities: true,
  },
  modelC: {
    title: "Summarize",
    tooltip: "Summarization",
    hasMultiplePriorities: false,
  },
  modelD: {
    title: "General",
    tooltip: "General",
    hasMultiplePriorities: false,
  },
} as const;

/**
 * Gets priority labels based on whether model supports multiple priorities
 */
export const getPriorityLabels = (hasMultiplePriorities: boolean) => {
  if (!hasMultiplePriorities) {
    return { first: "Select Model" };
  }

  return {
    first: "1st Priority",
    second: "2nd Priority",
    third: "3rd Priority",
  };
};

/**
 * Validates if a model type is valid
 */
export const isValidModelType = (
  modelType: string
): modelType is "modelA" | "modelB" | "modelC" => {
  return ["modelA", "modelB", "modelC"].includes(modelType);
};

/**
 * Gets all priority keys for a model type
 */
export const getPriorityKeys = (
  hasMultiplePriorities: boolean
): (keyof ModelPriority)[] => {
  if (!hasMultiplePriorities) {
    return ["first"];
  }
  return ["first", "second", "third"];
};
