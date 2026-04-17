// components/CustomGoogleAnalytics.tsx
"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect } from "react";
import { sendEnvironment } from "@/lib/gtag";
import { getEnvironmentFromBranch } from "@/utils/mapBranchToEnv";

export type GAParams = {
  gaId: string;
  branch: string;
};

export const CustomGoogleAnalytics = ({ gaId, branch }: GAParams) => {
  const env = getEnvironmentFromBranch(branch);

  useEffect(() => {
    sendEnvironment(env);
  }, [env]);

  return <GoogleAnalytics gaId={gaId} />;
};
