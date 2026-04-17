// Used custom queries which are missing some type definitions for the plans
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ServerLog } from "../actions/ServerLog";
import { LoadingFallback } from "@/components/global-components/LoadingFallback";
import {
  RazorpayScript,
  RazorpayPayment,
} from "@/components/subscription/RazorpayPayment";
import SubscriptionPhoneForm, {
  PhoneValidationSchema,
} from "@/components/subscription/SubscriptionPhoneForm";
import { planIcons } from "@/constants/constants";
import { ROUTES } from "@/constants/routes";
import { useAddProviderConfig } from "@/hooks/addProviderConfig";
import { FetchDefaultSettings } from "@/hooks/defaultSettings";
import { useDeleteUserModelPriorities } from "@/hooks/deletePriority";
import { useUserModelPriorities } from "@/hooks/fetchPriorityModels";
import { useFetchUserProviderConfigs } from "@/hooks/fetchUserProviderConfigs";
import { useAddUserModelPriorities } from "@/hooks/priorityModel";
import { useCreateUserSubscription } from "@/hooks/useCreateUserSubscription";
import { useGenerateOrder } from "@/hooks/useGenerateOrder";
import { useGetUser } from "@/hooks/useGetUser";
import { useListCountries } from "@/hooks/useListCountries";
import { useListUserSubscriptions } from "@/hooks/useListUserSubscriptions";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useVerifyOrder } from "@/hooks/useVerifyOrder";
import { useUserId } from "@/lib/getUserId";
import cinfy from "@/public/CinfyAIMainWhite.svg";
import { subscriptionStore } from "@/stores/subscriptionStore";
import { SubscriptionPlanProps } from "@/types/home";
import { generateUniqueId } from "@/utils/dateUtils";
import { debounce } from "@/utils/debounce";
import logger from "@/utils/logger/browserLogger";
import {
  addPaymentUnloadListener,
  getLatestActivePlan,
  mapPlanTag,
} from "@/utils/subscriptionUtils";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
import { transformSettingsToModels } from "@/utils/transformSettingsToModels";
import { getPlanStyles } from "@/utils/uiStyles";

export default function SubscriptionPage() {
  const router = useRouter();
  const userId = useUserId();
  const { data: userData, isLoading:userDataIsLoading, isFetching:userDataIsFetching, isRefetching, refetch: refetchUserData } = useGetUser(userId ?? "");
  const createUserSubscription = useCreateUserSubscription();
  const userSubscriptionId = generateUniqueId();
  const addPriorityMutation = useAddUserModelPriorities();
  const addProviderConfig = useAddProviderConfig();
  const deleteUserModelPriorities = useDeleteUserModelPriorities();
  const { mutateAsync: fetchProviderConfigs } = useFetchUserProviderConfigs();
  const { data: userModelPriorities } = useUserModelPriorities(
    userId ?? undefined
  );
  const { data: userSubscription, refetch } = useListUserSubscriptions(userId);
  const { mutateAsync: generateOrder } = useGenerateOrder();
  const { mutateAsync: verifyOrder } = useVerifyOrder();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [isPostPaymentLoading, setIsPostPaymentLoading] = useState(false);
  const setSubscription = subscriptionStore((s) => s.setSubscription);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const {
    data: plans,
    isLoading,
    isError,
  } = useSubscriptionPlans(userData?.countryId);

  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(true);

  const { data: countriesData, error: countriesError } = useListCountries();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const latestPlan = getLatestActivePlan(userSubscription);

  useEffect(() => {
    if (latestPlan) {
      setSubscription(latestPlan.planName, latestPlan?.planType);
    }
  }, [latestPlan, setSubscription]);
  const [isProcessingUserUpdate, setIsProcessingUserUpdate] = useState(false);
  const hasRedirectedRef = useRef(false);

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

  const handlePostSubscriptionRedirect = () => {
    // Prevent multiple redirects
    if (hasRedirectedRef.current) {
      return;
    }

    const cameFromBilling =
      typeof window !== "undefined" &&
      localStorage.getItem("isUpgradeClicked") === "true";

    // Mark as redirected before async operations
    hasRedirectedRef.current = true;

    if (cameFromBilling) {
      localStorage.removeItem("isUpgradeClicked");
      router.push(`${ROUTES.SETTINGS}?section=billings`);
    } else {
      router.push(ROUTES.CHAT);
    }
  };

  // Group plans by type and find monthly/yearly plans
  const groupedPlans = useMemo(() => {
    if (!plans) return { free: null, paid: { monthly: null, yearly: null } };

    const freePlan = plans.find(
      (p: SubscriptionPlanProps) => p.planType === "FREE"
    );
    const paidPlans = plans.filter(
      (p: SubscriptionPlanProps) => p.planType === "PAID"
    );

    // Find monthly plan (parent plan with isSubPlan: false or planDuration: 1)
    const monthlyPlan = paidPlans.find(
      (p: SubscriptionPlanProps) => !p.isSubPlan && p.planDuration === 1
    );

    // Find yearly plan (sub plan with isSubPlan: true or planDuration: 12)
    const yearlyPlan = paidPlans.find(
      (p: SubscriptionPlanProps) => p.isSubPlan && p.planDuration === 12
    );

    return {
      free: freePlan,
      paid: { monthly: monthlyPlan, yearly: yearlyPlan },
    };
  }, [plans]);

  // Get the currently selected paid plan based on billing cycle
  const selectedPaidPlan =
    billingCycle === "monthly"
      ? groupedPlans.paid.monthly
      : groupedPlans.paid.yearly;

  useEffect(() => {
    if (!plans || plans.length === 0) return;

    const hasOnlyFreePlan = plans.every(
      (plan: SubscriptionPlanProps) => plan.planType === "FREE"
    );

    if (hasOnlyFreePlan) {
      localStorage.setItem("onlyFreePlan", "true");
    } else {
      localStorage.removeItem("onlyFreePlan");
    }
  }, [plans]);

  const handlePlanButtons = async (
    plan: SubscriptionPlanProps,
    options?: { skipPayment?: boolean }
  ) => {
    const skipPayment = options?.skipPayment ?? false;

    if (plan.planType === "FREE") {
      if (hasFreePlan) {
        showSuccessToast("You're already on the Free Plan!");
        setTimeout(() => {
          handlePostSubscriptionRedirect();
        }, 1500);
      } else {
        await debouncedHandlePlanClick(plan, skipPayment);
      }
    } else if (plan.planType === "PAID") {
      debouncedHandlePlanClick(plan, skipPayment);
    }
  };

  useEffect(() => {
    if (plans && !activePlanId) {
      const recommendedPlan = plans.find(
        (plan: { displayTag: string }) => plan.displayTag === "RECOMMENDED"
      );
      if (recommendedPlan) {
        setActivePlanId(recommendedPlan.planId);
      }
    }
  }, [plans, activePlanId]);

  useEffect(() => {
    if (loadingPlanId) {
      const cleanup = addPaymentUnloadListener();
      return () => cleanup();
    }
  }, [loadingPlanId]);

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!userId || !userSubscription) return;

      try {
        // const currentUser = await getCurrentUser();
        // const isGoogle = currentUser?.username?.startsWith("google_") || false;
        const isUserCountrySet = Boolean(userData?.countryId);
        const userHasValidCountry = Boolean(userData?.country?.isValid);

        const hasAnyActivePlan =
          hasActivePaidPlan || (hasFreePlan && !isUpgradeClicked);

        // ✅ CASE 1: User has active plan + valid country -> redirect to chat
        if (hasAnyActivePlan && (userHasValidCountry || isUserCountrySet)) {
          logger.info(
            "Redirecting to chat - has active plan and country is set"
          );
          handlePostSubscriptionRedirect();
          return;
        }

        // ✅ CASE 2: Country IS set -> show plans
        if (isUserCountrySet && userHasValidCountry) {
          logger.info("Showing plans - country is set");
          setShowPlans(true);
          return;
        }

        // ✅ CASE 3: Country NOT set -> show phone form
        logger.info("Showing phone form - no country set");
        setShowPlans(false);
      } catch (error) {
        logger.error("Could not get current user", error);
        setShowPlans(true);
      } finally {
        setIsCheckingSubscription(false);
        setIsCheckingUser(false);
      }
    };

    checkUserAccess();
  }, [
    userId,
    userSubscription,
    userData,
    hasActivePaidPlan,
    hasFreePlan,
    router,
    isUpgradeClicked,
  ]);

  const processPaidPlan = async (
    plan: SubscriptionPlanProps,
    userId: string
  ) => {
    try {
      if (!userData) {
        logger.error("User data is not available");
        showErrorToast("User information is not available. Please try again.");
        return false;
      }
      logger.info("Generating Razorpay order");
      await ServerLog(userId, "Generating Razorpay order");
      const result = await generateOrder({
        planId: plan.planId,
        userId: userId,
      });
      const userForPayment = {
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        email: userData.email || undefined,
        phone: userData.phone || undefined,
      };

      if (!result?.orderId) {
        logger.error("No order ID received from generateOrder");
        await ServerLog(userId, "No order ID received from generateOrder");
        showErrorToast(
          "We're unable to process the payment right now. Please try again later."
        );
        return false;
      }

      logger.info("Opening Razorpay checkout");
      await ServerLog(userId, "Opening Razorpay checkout");
      const paymentResult = await RazorpayPayment(
        plan?.price ?? 0,
        plan?.country?.currency,
        plan?.planName ?? "",
        result.orderId,
        verifyOrder,
        userForPayment
      );

      if (!paymentResult?.ok || paymentResult?.code !== "VERIFIED") {
        logger.error("Order verification failed");
        await ServerLog(userId, "Order verification failed");
        showErrorToast(
          "We couldn't complete your payment. Please try again later."
        );
        return false;
      }
      logger.info("Payment verification successful");
      await ServerLog(userId, "Payment verification successful");
      return true;
    } catch (error) {
      logger.error("Error generating order:", error);
      await ServerLog(userId, "Error generating order");
      return false;
    }
  };

  const handlePlanClick = async (
    plan: SubscriptionPlanProps,
    skipPayment = false
  ) => {
    if (!userId) {
      logger.error("User ID is missing, cannot create subscription.");
      return;
    }

    setLoadingPlanId(plan.planId ?? "");

    const shouldSkipPayment =
      plan.planType === "PAID" && userData?.isDemoUser && skipPayment;

    if (plan.planType === "PAID" && !shouldSkipPayment) {
      const paymentSuccess = await processPaidPlan(plan, userId);
      if (!paymentSuccess) {
        setLoadingPlanId(null);
        return;
      }
      setIsPostPaymentLoading(true);
    } else if (shouldSkipPayment) {
      setIsPostPaymentLoading(true);
    }

    try {
      const response = await fetchProviderConfigs({ userId });
      const hasApiKeys = response?.data?.length >= 1;
      const hasPriorityModels =
        userModelPriorities && userModelPriorities.length > 0;

      if (plan.planType === "PAID") {
        if (shouldSkipPayment) {
          showSuccessToast(
            "Demo Plan activated! Enjoy all the benefits of your subscription plan."
          );
        } else {
          showSuccessToast(
            "Payment successful! Enjoy all the benefits of your subscription plan."
          );
        }
      } else {
        showSuccessToast("Free Plan activated — start exploring today!");
      }

      // Step 1: create subscription
      if ((plan.planType === "FREE" && !hasFreePlan) || shouldSkipPayment) {
        await createUserSubscription.mutateAsync({
          userSubscriptionId,
          planId: plan.planId,
          status: plan.status,
          userId,
        });
      }

      if (hasApiKeys && hasPriorityModels) {
        await refetch({ cancelRefetch: false });
        handlePostSubscriptionRedirect();
        return;
      }

      const settings = await FetchDefaultSettings();
      const results = transformSettingsToModels(settings, userId);

      // Step 2: reset old priorities
      await deleteUserModelPriorities.mutateAsync({ userId });

      // Step 3: add provider configs
      const providerConfigs = results.providerConfigs || [];
      for (const config of providerConfigs) {
        await addProviderConfig.mutateAsync({
          apiKey: config.apiKey ?? "",
          providerId: config.providerId,
          userId: config.userId,
          isDefaultProvider: true,
        });
      }

      // Step 4: add model priorities
      const modelPriorityConfigs = results.modelPriorityConfigs || [];
      const makeOwnerTuple = (id: string): [string] => [id];
      const priorityData = modelPriorityConfigs.map((priority) => ({
        id: priority.id,
        userId: priority.userId,
        feature: priority.feature,
        models: priority.models[0],
        rOwner: makeOwnerTuple(userId),
        rdOwner: makeOwnerTuple(userId),
        ruOwner: makeOwnerTuple(userId),
        rwOwner: makeOwnerTuple(userId),
      }));

      if (priorityData.length > 0) {
        await addPriorityMutation.mutateAsync({ input: priorityData });
      }
      await refetch({ cancelRefetch: false });
      handlePostSubscriptionRedirect();
    } catch (error) {
      logger.error("Error in handlePlanClick:", error);
      setIsPostPaymentLoading(false);
    } finally {
      setLoadingPlanId(null);
    }
  };

  // debounce handlePlanClick
  const debouncedHandlePlanClick = useMemo(
    () => debounce(handlePlanClick, 300),
    [userId, userModelPriorities, userData]
  );

  const handleSubmitPhoneNumber = async (data: PhoneValidationSchema) => {
    if (!userId) {
      showErrorToast("User not found. Please log in again.");
      return;
    }
    const country = countriesData?.find((c) => c.isoCode === data.country);
    if (!country) {
      showErrorToast("Please select a valid country.");
      return;
    }

    const formattedPhoneNumber =
      data.phone && data.phone.trim()
        ? `+${country.dialCode}${data.phone}`
        : null;

    try {
      const updateData: {
        userId: string;
        countryId: string;
        phone?: string;
      } = {
        userId,
        countryId: country.countryId,
      };

      // Only include phone if it was provided
      if (formattedPhoneNumber) {
        updateData.phone = formattedPhoneNumber;
      }

      await updateUser(updateData);

      const successMessage = formattedPhoneNumber
        ? "Country and phone number updated successfully!"
        : "Country updated successfully!";

      showSuccessToast(successMessage);
      setShowPlans(true);
      await refetchUserData();
    } catch (error) {
      logger.error("Failed to update user information", error);
      showErrorToast("Could not update your information. Please try again.");
    } finally {
      setIsProcessingUserUpdate(false);
    }
  };

  if (isCheckingUser || isCheckingSubscription || isProcessingUserUpdate || userDataIsLoading || userDataIsFetching || isRefetching || addProviderConfig.isPending) {
    return <LoadingFallback />;
  }

  if (hasActivePaidPlan || isLoading) {
    return <LoadingFallback />;
  }

  if (isError || countriesError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          Failed to load plans. Please try again.
        </div>
      </div>
    );
  }

  // Display plans array for rendering
  const displayPlans = [groupedPlans.free, selectedPaidPlan].filter(
    Boolean
  ) as SubscriptionPlanProps[];

  return (
    <>
      {isPostPaymentLoading ? (
        <LoadingFallback />
      ) : (
        <div className="min-h-dvh">
          {/* Mobile & Tablet: Top heading only (hidden on desktop) */}
          <div className="block lg:hidden bg-gray-100 px-4 md:px-6 py-4 md:py-5">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              Choose the Plan That Works for You
            </h1>
          </div>

          {/* Desktop: Two-column layout */}
          <div className="lg:min-h-dvh grid grid-cols-1 lg:grid-cols-[35%_65%] xl:grid-cols-[40%_60%]">
            {/* Left Panel – Desktop Only (35%/40%) */}
            <div className="hidden lg:flex bg-[#1D2026] text-white p-8 lg:p-8 xl:p-10 items-start relative overflow-hidden">
              {/* Background Blur Effects */}
              <div className="absolute -top-[120px] lg:-top-[120px] xl:-top-[150px] -right-[120px] lg:-right-[120px] xl:-right-[150px] w-[420px] h-[420px] lg:w-[420px] lg:h-[420px] xl:w-[531px] xl:h-[531px] rounded-full bg-[#8e5eff66] blur-[200px]" />
              <div className="absolute top-1/2 -left-[80px] lg:-left-[80px] xl:-left-[100px] w-[240px] h-[240px] lg:w-[240px] lg:h-[240px] xl:w-[300px] xl:h-[300px] rounded-full bg-[#ff855e33] blur-[150px]" />

              <div className="z-10 sticky top-0 pt-8 lg:pt-8 xl:pt-10">
                <div className="flex gap-1.5 lg:gap-1.5 xl:gap-2 mb-12 lg:mb-12 xl:mb-15">
                  <Image
                    src={cinfy}
                    alt="Cinfy Logo"
                    width={55}
                    height={55}
                    className="mt-1.5 lg:mt-1.5 xl:mt-2 mr-1.5 lg:mr-1.5 xl:mr-2 drop-shadow-2xl w-[55px] h-[55px] lg:w-[55px] lg:h-[55px] xl:w-[65px] xl:h-[65px]"
                  />
                  <h1 className="text-[46px] lg:text-[46px] xl:text-[56px] font-bold drop-shadow-lg text-center">
                    <span className="bg-gradient-to-r from-[#ff855e] via-[#ffa386] to-[#ad8cfa] bg-clip-text text-transparent">
                      CinfyAI
                    </span>
                  </h1>
                </div>
                <h1 className="text-3xl lg:text-3xl xl:text-4xl font-bold mb-5 lg:mb-5 xl:mb-6 text-white">
                  Choose
                  <br />
                  the Plan That Works for You
                </h1>
                <p className="font-normal text-lg lg:text-lg xl:text-xl mb-5 lg:mb-5 xl:mb-6 text-[#DEDEDE]">
                  Whether you're exploring or scaling, we've got you covered.
                </p>
                <ul className="font-normal text-sm lg:text-sm xl:text-base space-y-1.5 lg:space-y-1.5 xl:space-y-2 text-[#DEDEDE] list-none">
                  <li>- Start free with core features</li>
                  <li>- Upgrade anytime for more power</li>
                  <li>- 14-day trial included with paid plans</li>
                  <li>- Cancel anytime — no commitment</li>
                </ul>
              </div>
            </div>

            {/* Right Panel – All Screens (100% on mobile, 65%/60% on desktop) */}
            <div className="bg-gray-100 p-4 md:p-6 lg:p-6 xl:p-8 flex items-center justify-center">
              {showPlans ? (
                <div className="w-full max-w-full lg:max-w-full xl:max-w-full">
                  {/* Unified Plans Container - Responsive Layout */}
                  <div className="flex flex-col md:flex-row md:justify-center md:overflow-x-auto gap-4 md:gap-5 lg:gap-6 xl:gap-8 w-full max-w-md md:max-w-full mx-auto md:mx-0 md:pt-8 md:pb-4">
                    {displayPlans.map(
                      (plan: SubscriptionPlanProps, index: number) => {
                        const planStyles = getPlanStyles(mapPlanTag(plan));
                        const isRecommended = plan.displayTag === "RECOMMENDED";
                        const Icon =
                          planIcons[isRecommended ? "recommended" : "default"];
                        const isLoadingThisPlan = loadingPlanId === plan.planId;
                        const isDisabled =
                          loadingPlanId !== null || hasActivePaidPlan;
                        const showBorder = activePlanId === plan.planId;
                        const getBorderStyle = () =>
                          getPlanStyles("RECOMMENDED").border;
                        const isPaidPlan = plan.planType === "PAID";
                        const showSkipButton =
                          userData?.isDemoUser &&
                          isPaidPlan &&
                          !hasActivePaidPlan;

                        return (
                          <div
                            key={plan.planId ?? index}
                            onMouseEnter={() => {
                              // Only set active on hover for non-mobile devices
                              if (window.innerWidth >= 768) {
                                setActivePlanId(plan.planId);
                              }
                            }}
                            className="relative pt-4 md:pt-0 md:flex-shrink-0 md:w-[300px] lg:w-[320px] xl:w-[350px]"
                          >
                            {isRecommended && (
                              <div className="absolute -top-0 md:-top-3 left-1/2 -translate-x-1/2 z-10">
                                <div className="bg-gradient-to-r from-[#ff855e] to-[#453fca] text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-md uppercase whitespace-nowrap">
                                  Recommended
                                </div>
                              </div>
                            )}

                            <div
                              className={`group bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-5 lg:p-6 xl:p-8 text-center flex flex-col justify-between transition-all duration-300 h-full ${
                                showBorder
                                ? getBorderStyle()
                                : "border-2 border-transparent"
                              }`}
                            >
                              <div>
                                <div className="flex justify-center mb-3 md:mb-3 lg:mb-3 xl:mb-4 mt-3 md:mt-3 lg:mt-3 xl:mt-4">
                                  <div
                                    className={`${planStyles.iconBg} p-3 md:p-3 lg:p-3 xl:p-4 rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl`}
                                  >
                                    <span className="text-4xl md:text-4xl lg:text-4xl xl:text-5xl">
                                      <Icon className={planStyles.iconUI} />
                                    </span>
                                  </div>
                                </div>
                                <h2 className="text-lg md:text-lg lg:text-lg xl:text-xl font-bold mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2">
                                  {plan.planName}
                                </h2>

                                {/* Billing Cycle Toggle - Only for Paid Plans */}
                                {isPaidPlan &&
                                  groupedPlans.paid.monthly &&
                                  groupedPlans.paid.yearly && (
                                    <div className="flex justify-center mb-4">
                                      <div className="bg-gray-100 rounded-full p-1 inline-flex">
                                        <button
                                          onClick={() =>
                                            setBillingCycle("monthly")
                                          }
                                          className={` cursor-pointer px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200  ${
                                            billingCycle === "monthly"
                                            ? "bg-gradient-to-r from-[#ff855e] to-[#453fca] text-white shadow-sm cursor-pointer"
                                            : "text-gray-600 hover:text-gray-900"
                                          }`}
                                        >
                                          Monthly
                                        </button>
                                        <button
                                          onClick={() =>
                                            setBillingCycle("yearly")
                                          }
                                          className={`px-4 cursor-pointer py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                            billingCycle === "yearly"
                                            ? "bg-gradient-to-r from-[#ff855e] to-[#453fca] text-white shadow-sm "
                                            : "text-gray-600 hover:text-gray-900"
                                          }`}
                                        >
                                          Yearly
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                <p className="text-2xl md:text-2xl lg:text-2xl xl:text-3xl font-bold mb-0.5 md:mb-0.5 lg:mb-0.5 xl:mb-1">
                                  {plan?.country?.currency} {plan.price ?? 0}
                                  <span className="text-sm md:text-sm lg:text-sm xl:text-base font-medium">
                                    /month
                                  </span>
                                </p>
                                <p className="text-gray-500 text-xs md:text-xs lg:text-xs xl:text-sm mb-4 md:mb-4 lg:mb-5 xl:mb-6">
                                  {plan.description ??
                                    "No description available."}
                                </p>
                                <ul
                                  className={`text-left text-gray-700 text-xs md:text-xs lg:text-xs xl:text-sm list-disc list-inside marker:text-sm md:marker:text-sm lg:marker:text-sm xl:marker:text-base ${planStyles.iconColor} overflow-y-auto max-h-24 md:max-h-24 lg:max-h-24 xl:max-h-30 pr-1.5 md:pr-1.5 lg:pr-1.5 xl:pr-2`}
                                >
                                  {(plan?.features ?? []).map(
                                    (feature, key) => (
                                      <li key={key}>{feature}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                              <RazorpayScript />
                              {showSkipButton ? (
                                <div className="mt-5 md:mt-5 lg:mt-6 xl:mt-8 flex gap-3">
                                  <button
                                    disabled={isDisabled}
                                    className={`basis-[80%] w-full py-2.5 md:py-2.5 lg:py-2.5 xl:py-3 text-sm md:text-sm lg:text-sm xl:text-base font-medium rounded-md md:rounded-md lg:rounded-md xl:rounded-lg transition flex items-center justify-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 ${
                                      planStyles.buttonBg
                                    } ${planStyles.cursor} ${
                                      isRecommended ? "shadow-lg" : ""
                                    } ${
                                      isDisabled
                                        ? "opacity-60 cursor-not-allowed hover:cursor-not-allowed"
                                        : ""
                                    }
                ${
                  !hasFreePlan
                    ? "group-hover:bg-gradient-to-r group-hover:from-[#ff855e] group-hover:to-[#453fca] group-hover:text-white"
                    : ""
                }`}
                                    onClick={() => handlePlanButtons(plan)}
                                  >
                                    {isLoadingThisPlan ? (
                                      <>
                                        <span className="h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-5 xl:w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                                        <span className="text-xs md:text-xs lg:text-xs xl:text-sm">
                                          Processing...
                                        </span>
                                      </>
                                    ) : plan.planType === "FREE" &&
                                      hasFreePlan ? (
                                      "Current Plan"
                                    ) : (
                                      planStyles.buttonText
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isDisabled}
                                    className="basis-[20%] py-2.5 md:py-2.5 lg:py-2.5 xl:py-3 text-xs md:text-sm font-medium rounded-md border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    onClick={() =>
                                      handlePlanButtons(plan, {
                                        skipPayment: true,
                                      })
                                    }
                                  >
                                    Skip
                                  </button>
                                </div>
                              ) : (
                                <button
                                  disabled={isDisabled}
                                  className={`mt-5 md:mt-5 lg:mt-6 xl:mt-8 w-full py-2.5 md:py-2.5 lg:py-2.5 xl:py-3 text-sm md:text-sm lg:text-sm xl:text-base font-medium rounded-md md:rounded-md lg:rounded-md xl:rounded-lg transition flex items-center justify-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 ${
                                    planStyles.buttonBg
                                  } ${planStyles.cursor} ${
                                    isRecommended ? "shadow-lg" : ""
                                  } ${
                                    isDisabled
                                      ? "opacity-60 cursor-not-allowed hover:cursor-not-allowed"
                                      : ""
                                  }
                ${
                  !hasFreePlan
                    ? "group-hover:bg-gradient-to-r group-hover:from-[#ff855e] group-hover:to-[#453fca] group-hover:text-white"
                    : ""
                }`}
                                  onClick={() => handlePlanButtons(plan)}
                                >
                                  {isLoadingThisPlan ? (
                                    <>
                                      <span className="h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-5 xl:w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                                      <span className="text-xs md:text-xs lg:text-xs xl:text-sm">
                                        Processing...
                                      </span>
                                    </>
                                  ) : plan.planType === "FREE" &&
                                    hasFreePlan ? (
                                    "Current Plan"
                                  ) : (
                                    planStyles.buttonText
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <SubscriptionPhoneForm
                  countries={countriesData ?? []}
                  isUpdating={isUpdating}
                  onSubmit={handleSubmitPhoneNumber}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
