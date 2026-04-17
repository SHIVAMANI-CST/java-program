// hooks/useAuthProtection.ts
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";

const guestRoutes = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
  ROUTES.SIGN_UP_SUCCESS,
];

export const useAuthProtection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      const isProtectedRoute = !guestRoutes.includes(pathname);

      if (isProtectedRoute) {
        // If on a protected route while unauthenticated, redirect immediately
        router.replace(ROUTES.SIGN_IN);
      }

      const handlePopState = (event: PopStateEvent) => {
        // Prevent back navigation to protected routes
        const currentPath = window.location.pathname;
        if (!guestRoutes.includes(currentPath)) {
          event.preventDefault();
          router.replace(ROUTES.SIGN_IN);
        }
      };

      window.addEventListener("popstate", handlePopState);

      // Push a new state to prevent going back
      window.history.pushState(null, "", window.location.href);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [authStatus, router, pathname]);
};
