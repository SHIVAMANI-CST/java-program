"use client";
import { signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ROUTES, AUTH_EVENTS } from "@/constants/routes";
import logger from "@/utils/logger/browserLogger";

const AuthListener = () => {
  const router = useRouter();
  const pathname = usePathname();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    const listener = Hub.listen("auth", async ({ payload }) => {
      logger.info("Auth event received:", payload.event);

      let redirectRoute: string | null = null;

      switch (payload.event) {
        case AUTH_EVENTS.SIGNED_IN:
          logger.info("User signed in successfully.");
          if (pathname === ROUTES.HOME || pathname === ROUTES.SIGN_IN) {
            redirectRoute = ROUTES.REDIRECT;
          }
          break;

        case AUTH_EVENTS.SIGNED_OUT:
          if (pathname === ROUTES.SIGN_UP || pathname === ROUTES.SIGN_IN) {
            logger.info("Signed out during public flow — skipping redirect");
            break;
          }
          logger.info("User signed out successfully.");
          // Always redirect to sign-in on logout
          redirectRoute = ROUTES.SIGN_IN;
          break;

        case AUTH_EVENTS.TOKEN_REFRESH:
          logger.info("Auth tokens have been refreshed.");
          // Don't redirect on token refresh - user should stay on current page
          break;

        case AUTH_EVENTS.TOKEN_REFRESH_FAILURE:
          logger.error("Failure while refreshing auth tokens.");

          try {
            logger.warn("Token refresh failed — signing user out...");
            await signOut();
          } catch (err) {
            logger.error("Error during sign-out after refresh failure:", err);
          }

          redirectRoute = ROUTES.SIGN_IN;
          break;

        case AUTH_EVENTS.SIGN_IN_WITH_REDIRECT:
          logger.info("SignInWithRedirect resolved successfully.");
          // Only redirect if on redirect page or sign-in page
          if (pathname === ROUTES.REDIRECT || pathname === ROUTES.SIGN_IN) {
            redirectRoute = ROUTES.REDIRECT;
          }
          break;

        case AUTH_EVENTS.SIGN_IN_WITH_REDIRECT_FAILURE:
          logger.error("Failure during signInWithRedirect.");
          if (pathname !== ROUTES.SIGN_IN) {
            redirectRoute = ROUTES.SIGN_IN;
          }
          break;

        default:
          logger.warn("Unhandled auth event:", payload);
      }

      if (
        redirectRoute &&
        redirectRoute !== lastRedirectRef.current &&
        redirectRoute !== pathname
      ) {
        lastRedirectRef.current = redirectRoute;

        // Add a small delay to prevent conflicts with middleware
        setTimeout(() => {
          logger.info(`Redirecting to: ${redirectRoute}`);
          router.replace(redirectRoute);
        }, 200);
      }
    });

    return () => listener();
  }, [router, pathname]);

  return null;
};

export default AuthListener;
