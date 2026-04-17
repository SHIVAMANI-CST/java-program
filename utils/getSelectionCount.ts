import { ModelPriority } from "@/types/global";

export const getSelectionCount = (model?: ModelPriority): number => {
  return Object.values(model || {}).filter(
    (v) => typeof v === "string" && v.length > 0
  ).length;
};
