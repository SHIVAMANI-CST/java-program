// utils/mapBranchToEnv.ts
import { Branch } from "@/constants/constants";

export const getEnvironmentFromBranch = (branch: string): string => {
  switch (branch) {
    case Branch.DEV:
      return "development";
    case Branch.UAT:
      return "test";
    case Branch.PROD:
      return "production";
    default:
      return "development";
  }
};
