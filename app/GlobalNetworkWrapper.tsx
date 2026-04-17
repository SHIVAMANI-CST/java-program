"use client";

import { WifiOff, RotateCcw } from "lucide-react";
import React, { ReactNode, useEffect } from "react";
import { useNetworkStore } from "@/stores/networkStore";

interface GlobalNetworkWrapperProps {
  children: ReactNode;
}

const GlobalNetworkWrapper: React.FC<GlobalNetworkWrapperProps> = ({
  children,
}) => {
  const {
    isOffline,
    setOffline,
    isRetrying,
    startRetry,
    stopRetry,
    iconKey,
    incrementIconKey,
  } = useNetworkStore();

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOffline]);

  const handleRetry = () => {
    startRetry();
    setTimeout(() => {
      stopRetry();
      incrementIconKey();
    }, 1000);
  };

  return (
    <>
      {children}
      {isOffline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white text-center py-2.5 px-4 rounded-lg text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            No internet connection - Please connect to the internet
            <button
              onClick={handleRetry}
              className="ml-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors border border-white/30 cursor-pointer"
              aria-label="Retry connection"
              disabled={isRetrying}
            >
              <RotateCcw
                key={iconKey}
                className={`w-3.5 h-3.5 transition-transform duration-1000 ease-linear ${
                  isRetrying ? "-rotate-[360deg]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalNetworkWrapper;
