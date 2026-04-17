import Image from "next/image";
import React from "react";
import CinfyLogo from "@/public/CinfyAIMain.svg";

interface LoadingFallbackProps {
  text?: string;
  textColor?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  text = "Loading",
  textColor = "text-gray-600",
}) => (
  <div className="min-h-dvh flex items-center justify-center px-3 md:px-3 lg:px-3 xl:px-4">
    <div className="text-center">
      {/* Logo Loader */}
      <div className="flex flex-col items-center justify-center mb-1.5 md:mb-1.5 lg:mb-1 xl:mb-2">
        <div className="relative">
          <div className="absolute inset-0 w-12 h-12 md:w-12 md:h-12 lg:w-12 lg:h-12 xl:w-14 xl:h-14 border-2 border-[#6A2AFFF2] border-t-[#FF855E] rounded-full animate-spin"></div>
          <div className="w-12 h-12 md:w-12 md:h-12 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full flex items-center justify-center shadow-sm">
            <Image
              src={CinfyLogo}
              alt="Cinfy Logo"
              width={32}
              height={32}
              className="rounded-full flex items-center justify-center w-8 h-8 md:w-8 md:h-8 lg:w-8 lg:h-8 xl:w-10 xl:h-10"
              priority
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="mt-1.5 md:mt-1.5 lg:mt-1 xl:mt-2">
          <p
            className={`${textColor} text-xs md:text-xs lg:text-xs xl:text-sm font-medium animate-pulse`}
          >
            {text}
          </p>
        </div>
      )}
    </div>
  </div>
);
