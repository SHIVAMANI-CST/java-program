// app/providers-wrapper.tsx
"use client";
import "./globals.css";
import { Authenticator } from "@aws-amplify/ui-react";
import Clarity from "@microsoft/clarity";
import { Amplify } from "aws-amplify";

import type { ReactNode } from "react";
import AuthListener from "./AuthListner";
import GlobalNetworkWrapper from "./GlobalNetworkWrapper";
import { Providers } from "./providers";
import { QueryProviders } from "./queryClientProviders";
import outputs from "@/amplify_outputs.json";
import Auth from "@/components/auth/Auth";
import { CustomGoogleAnalytics } from "@/components/google-analytics/CustomGoogleAnalytics";
import { useAuthProtection } from "@/components/ProtectedRouteGuard/ProtectedRouteGuard";
import {
  BRANCH_ENV,
  CLARITY_PROJECT_ID,
  isClarityEnabled,
} from "@/constants/constants";
import ConfigureAmplifyClientSide from "@/lib/ConfigureAmplifyClientSide";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

// Configure Amplify once at the root level with SSR support
Amplify.configure(outputs, { ssr: true });

if (isClarityEnabled && CLARITY_PROJECT_ID) {
  Clarity.init(CLARITY_PROJECT_ID);
}

export default function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <Authenticator.Provider>
      <InnerProviders>{children}</InnerProviders>
    </Authenticator.Provider>
  );
}
// eslint-disable-next-line @typescript-eslint/naming-convention
function InnerProviders({ children }: { children: ReactNode }) {
  useAuthProtection();

  return (
    <Auth>
      <CustomGoogleAnalytics gaId={GA_MEASUREMENT_ID!} branch={BRANCH_ENV!} />
      <QueryProviders>
        <AuthListener />
        <ConfigureAmplifyClientSide />
        <GlobalNetworkWrapper>
          <Providers>{children}</Providers>
        </GlobalNetworkWrapper>
      </QueryProviders>
    </Auth>
  );
}
