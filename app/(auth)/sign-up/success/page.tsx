"use client";

import { autoSignIn } from "@aws-amplify/auth";
import { fetchAuthSession } from "aws-amplify/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Button from "../../../../components/global-components/Button";
import { ROUTES } from "@/constants/routes";
import cinfy from "@/public/CinfyAIMainWhite.svg";
import verifiedBadge from "@/public/verifiedBadge.svg";
import logger from "@/utils/logger/browserLogger";

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  const handleSignInClick = async () => {
    try {
      await autoSignIn();
      router.replace(ROUTES.SUBSCRIPTION);
    } catch (error) {
      logger.error("Auto sign-in error:", error);
      router.push(ROUTES.SIGN_IN);
    }
  };
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          router.replace(ROUTES.SUBSCRIPTION);
          return;
        }
      } catch (error) {
        logger.error("Auth check error:", error);
      }
    };

    checkAuthStatus();
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#1D2026] text-white px-4 md:px-3 lg:px-3 xl:px-4 relative overflow-hidden">
      <div className="absolute -top-[100px] md:-top-[120px] lg:-top-[120px] xl:-top-[150px] -right-[100px] md:-right-[120px] lg:-right-[120px] xl:-right-[150px] w-[350px] h-[350px] md:w-[420px] md:h-[420px] lg:w-[420px] lg:h-[420px] xl:w-[531px] xl:h-[531px] rounded-full bg-[#8e5eff66] blur-[200px]" />
      <div className="absolute top-1/2 -left-[70px] md:-left-[80px] lg:-left-[80px] xl:-left-[100px] w-[200px] h-[200px] md:w-[240px] md:h-[240px] lg:w-[240px] lg:h-[240px] xl:w-[300px] xl:h-[300px] rounded-full bg-[#ff855e33] blur-[150px]" />
      <div className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[500px] xl:max-w-[563px] flex flex-col items-center text-center space-y-4 md:space-y-5 lg:space-y-5 xl:space-y-6 relative z-10">
        {/* Logo + Title */}
        <div className="flex gap-1.5 md:gap-2 lg:gap-2 xl:gap-3 justify-center items-center mb-6 md:mb-8 lg:mb-8 xl:mb-10 cursor-pointer">
          <Image
            src={cinfy}
            alt="Cinfy Logo"
            width={45}
            height={45}
            className="mt-1.5 md:mt-1.5 lg:mt-1.5 xl:mt-2 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2 drop-shadow-2xl w-[45px] h-[45px] md:w-[50px] md:h-[50px] lg:w-[55px] lg:h-[55px] xl:w-[65px] xl:h-[65px]"
          />
          <h1 className="text-[36px] md:text-[40px] lg:text-[44px] xl:text-5xl font-bold drop-shadow-lg">
            <span className="bg-gradient-to-r from-[#ff855e] via-[#ffa386] to-[#ad8cfa] bg-clip-text text-transparent">
              CinfyAI
            </span>
          </h1>
        </div>

        {/* Verified Badge */}
        <Image
          src={verifiedBadge}
          alt="verified"
          width={70}
          height={70}
          className="mb-6 md:mb-8 lg:mb-8 xl:mb-10 w-[70px] h-[70px] md:w-[75px] md:h-[75px] lg:w-[80px] lg:h-[80px] xl:w-[90px] xl:h-[90px]"
        />

        <h1 className="text-[24px] md:text-[26px] lg:text-[28px] xl:text-3xl font-bold mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2">
          Your Account Has Been Created!
        </h1>
        <p className="text-[14px] md:text-[14px] lg:text-[15px] xl:text-base font-medium mb-8 md:mb-10 lg:mb-10 xl:mb-12">
          You're all set to start exploring.
        </p>

        {/* Sign In Button */}
        <Button
          type="button"
          className="flex h-10 md:h-10 lg:h-11 xl:h-12 px-6 md:px-7 lg:px-7 xl:px-8 py-[10px] md:py-[11px] lg:py-[12px] xl:py-[13px] justify-center items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 w-full rounded-[10px] md:rounded-[11px] lg:rounded-[11px] xl:rounded-[12px] text-lg md:text-lg lg:text-lg xl:text-xl border-none font-medium text-white bg-gradient-to-r from-[#ff855e] to-[#453fca] hover:opacity-90 disabled:opacity-50"
          onClick={handleSignInClick}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
