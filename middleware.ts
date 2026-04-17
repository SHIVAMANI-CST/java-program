/* eslint-disable @typescript-eslint/naming-convention */
import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "./constants/routes";
import logger from "./utils/logger/browserLogger";
import { runWithAmplifyServerContext } from "@/utils/amplifyutils";

const guestRoutes = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
  ROUTES.SIGN_UP_SUCCESS,
  ROUTES.SIGN_OUT,
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = new URL(request.url);
  const pathname = url.pathname;
  const skipAuthCheckRoutes = [
    ROUTES.SIGN_UP,
    ROUTES.SIGN_IN,
    ROUTES.SIGN_UP_SUCCESS,
  ];

  if (skipAuthCheckRoutes.includes(pathname)) {
    return response;
  }
  // Set security headers with all environment URLs
  const allowedOrigins = [
    "'self'",
    "http://localhost:3000",
    "https://www.dev-joingpt.dev-compileinfy.com",
    "https://www.uat-joingpt.dev-compileinfy.com",
  ].join(" ");

  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${allowedOrigins};`
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  if (!guestRoutes.includes(pathname)) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }
  // Check for OAuth callback parameters
  const hasOAuthParams =
    url.searchParams.has("code") ||
    url.searchParams.has("state") ||
    url.searchParams.has("error");

  // If we're on sign-in page with OAuth params, allow it to process
  if (pathname === ROUTES.SIGN_IN && hasOAuthParams) {
    logger.info("OAuth callback detected on sign-in page");
    return response;
  }

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        // Amplify automatically detects token expiration and refreshes when needed
        // No forceRefresh needed - it causes race conditions and excessive requests
        const session = await fetchAuthSession(contextSpec);

        if (!session || !session.tokens) {
          logger.warn("Session missing or expired — possible transition state");
          return { isAuthenticated: false, isAdmin: false };
        }

        const groups = session.tokens.accessToken.payload["cognito:groups"] as
          | string[]
          | undefined;
        const isAdmin = Array.isArray(groups) && groups.includes("ADMIN");

        return { isAuthenticated: true, isAdmin };
      } catch (error:any) {
        if (error?.name === "NotAuthorizedException") {
          logger.warn("Stale Cognito identity detected — allowing request");
          return { isAuthenticated: false, isAdmin: false };
        }
        logger.error("Auth error:", error);
        return { isAuthenticated: false, isAdmin: false };
      }
    },
  });

  const { isAuthenticated, isAdmin } = authenticated;

  // Handle redirect page - only allow if authenticated OR if it's an OAuth callback
  if (pathname === ROUTES.REDIRECT) {
    if (isAuthenticated || hasOAuthParams) {
      return response;
    } else {
      logger.info(
        "Unauthenticated user trying to access redirect page without OAuth params"
      );
      return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
    }
  }

  // Handle root path ('/') - redirect based on authentication status
  if (pathname === ROUTES.HOME) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(isAdmin ? ROUTES.ADMIN : ROUTES.SUBSCRIPTION, request.url)
      );
    } else {
      return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
    }
  }

  if (pathname === ROUTES.THANK_YOU) {
    if (isAuthenticated) {
      return response;
    } else {
      return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
    }
  }

  // Unauthenticated user trying to access protected routes
  if (!isAuthenticated && !guestRoutes.includes(pathname)) {
    logger.info(`Redirecting unauthenticated user from ${pathname} to sign-in`);
    return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
  }

  // If session is restoring (null), allow temporary access to avoid redirect loops
  if (!isAuthenticated) {
    logger.info("Allowing request during session restoration");
    return response;
  }

  // Authenticated user trying to access guest routes (sign-in page)
  if (isAuthenticated && guestRoutes.includes(pathname)) {
    if (pathname === ROUTES.SIGN_IN && hasOAuthParams) {
      return response;
    }
    // Allow authenticated users to access sign-out route
    if (pathname === ROUTES.SIGN_OUT) {
      return response;
    }
    logger.info(
      { pathname },
      "Authenticated user trying to access guest route"
    );
    return NextResponse.redirect(
      new URL(isAdmin ? ROUTES.ADMIN : ROUTES.SUBSCRIPTION, request.url)
    );
  }

  // 2. Admin trying to access User pages (non-admin routes)
  // We assume anything NOT starting with /admin and NOT /redirect is a user page
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdmin && !isAdminRoute && pathname !== ROUTES.REDIRECT) {
    logger.info(`Redirecting Admin from ${pathname} to Admin Dashboard`);
    return NextResponse.redirect(new URL(ROUTES.ADMIN, request.url));
  }

  // 3. Regular User trying to access Admin pages
  if (!isAdmin && isAdminRoute) {
    logger.info(`Redirecting User from ${pathname} to Subscription page`);
    return NextResponse.redirect(new URL(ROUTES.SUBSCRIPTION, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|\\.well-known).*)"],
};
