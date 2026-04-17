import Image from "next/image";
import React from "react";
import CinfyLogo from "@/public/CinfyAIMain.svg";
import { useChatStore } from "@/stores/useChatStore";

interface AIResponseLoaderProps {
  feature: string;
}

const LoaderDemo: React.FC<AIResponseLoaderProps> = ({ feature }) => {
  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getLoaderText = () => {
    switch (feature) {
      case "COMPARISON":
        const comparisonMessages = [
          "Take a breath, we're weighing your options...",
          "Hang tight, comparing all the details...",
          "Just a moment, analyzing the differences...",
          "Almost there, evaluating pros and cons...",
          "Give me a sec, finding the best match...",
        ];
        return getRandomMessage(comparisonMessages);

      case "OPTIMIZATION":
        const optimizationMessages = [
          "Take a deep breath, we're making this better...",
          "Hold on, fine-tuning everything for you...",
          "Just a moment, optimizing performance...",
          "Almost ready, polishing the details...",
          "Bear with me, perfecting the solution...",
        ];
        return getRandomMessage(optimizationMessages);

      case "SUMMARIZATION":
        const summarizationMessages = [
          "Take a breath, we're condensing the key points...",
          "One moment, distilling the main ideas...",
          "Just a sec, extracting what matters most...",
          "Almost done, crafting your summary...",
          "Hang tight, pulling it all together...",
        ];
        return getRandomMessage(summarizationMessages);

      case "GENERAL":
      default:
        const generalMessages = [
          "Take a breath, we're generating something great...",
          "Just a moment, thinking through this...",
          "Hang tight, crafting your response...",
          "Almost there, putting the pieces together...",
          "One sec, working on this for you...",
          "Bear with me, creating something helpful...",
        ];
        return getRandomMessage(generalMessages);
    }
  };

  return (
    <div className="flex justify-start mb-4 lg:mb-3 xl:mb-4 ml-1.5 md:ml-4.5 lg:ml-4.5 xl:ml-22">
      <div className="flex items-center space-x-3 lg:space-x-2.5 xl:space-x-3">
        <div className="relative">
          <div className="absolute inset-0 w-10 h-10 md:w-10 md:h-10 lg:w-10 lg:h-10 xl:w-12 xl:h-12 border-2 border-[#6A2AFFF2] border-t-[#FF855E] rounded-full animate-spin"></div>
          <div className="w-10 h-10 md:w-10 md:h-10 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center shadow-sm">
            <Image
              src={CinfyLogo}
              alt="Cinfy Logo"
              width={28}
              height={28}
              className="rounded-full flex items-center justify-center w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7"
              priority
              fetchPriority="high"
            />
          </div>
        </div>
        <span className="text-sm lg:text-xs xl:text-sm text-gray-600">
          {getLoaderText()}
        </span>
      </div>
    </div>
  );

};

// Demo component to showcase all loaders
export const AIResponseLoader: React.FC<{ show: boolean }> = ({ show }) => {
  const { activeFeature } = useChatStore();
  if (!show) return null;
  return <LoaderDemo feature={activeFeature} />;
};

export default LoaderDemo;
