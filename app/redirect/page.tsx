// app/redirect/page.tsx
"use client";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingFallback } from "@/components/global-components/LoadingFallback";
import MaintenancePage from "@/components/global-components/Maintainance";
import { ROUTES } from "@/constants/routes";
import { useGetUser } from "@/hooks/useGetUser";
import { useListUserSubscriptions } from "@/hooks/useListUserSubscriptions";
import { useUserId } from "@/lib/getUserId";
import logger from "@/utils/logger/browserLogger";

const Page = () => {
  const router = useRouter();
  const userId = useUserId();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUser(userId ?? "", {
    enabled: !!userId,
  });

  const { data: userSubscription, isLoading: isSubscriptionLoading } =
    useListUserSubscriptions(userId);

  // Check if user already has FREE subscription
  const hasFreePlan = userSubscription?.some(
    (subscription) =>
      subscription.status === "ACTIVE" && subscription.plan?.planType === "FREE"
  );

  const hasActivePaidPlan = userSubscription?.some(
    (subscription) =>
      subscription.status === "ACTIVE" && subscription.plan?.planType === "PAID"
  );

  const isUpgradeClicked =
    typeof window !== "undefined" &&
    localStorage.getItem("isUpgradeClicked") === "true";

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!userId || isUserLoading || isSubscriptionLoading) return;

      if (isUserError || !userData) {
        setIsCheckingAccess(false);
        return;
      }

      const { signupStatus } = userData;

      if (signupStatus !== "APPROVED" && signupStatus !== "COMPLETED") {
        router.replace(ROUTES.THANK_YOU);
        return;
      }

      if (!userSubscription) return;

      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload["cognito:groups"] as string[] | undefined;

        if (Array.isArray(groups) && groups.includes("ADMIN")) {
          logger.info("Redirecting to Admin Dashboard");
          router.replace(ROUTES.ADMIN);
          return;
        }

        const currentUser = await getCurrentUser();
        const isGoogle = currentUser?.username?.startsWith("google_") || false;
        const isUserCountrySet = Boolean(userData?.countryId);
        const userHasValidCountry = Boolean(userData?.country?.isValid);

        const hasAnyActivePlan =
          hasActivePaidPlan || (hasFreePlan && !isUpgradeClicked);

        // ✅ CASE 1: User has country info or Google login + active plan -> redirect to chat
        if (
          (userHasValidCountry || isGoogle || isUserCountrySet) &&
          hasAnyActivePlan
        ) {
          logger.info(
            "Redirecting to chat - valid country or Google user with active plan"
          );
          router.replace(ROUTES.CHAT);
          return;
        }

        // ✅ CASE 2: Country not set OR no active plan -> show subscription page
        logger.info("Redirecting to subscription page");
        router.replace(ROUTES.SUBSCRIPTION);
      } catch (error) {
        logger.error("Could not get current user", error);
        router.replace(ROUTES.SUBSCRIPTION);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkUserAccess();
  }, [
    userId,
    userData,
    userSubscription,
    isUserLoading,
    isSubscriptionLoading,
    isUserError,
    hasActivePaidPlan,
    hasFreePlan,
    router,
  ]);

  if ((isUserError && !userData) || (!isCheckingAccess && isUserError)) {
    return <MaintenancePage />;
  }

  return <LoadingFallback />;
};

export default Page;
