// components/MaintenanceWrapper.tsx
"use client";
import { ReactNode } from "react";
import { LoadingFallback } from "../global-components/LoadingFallback";
import MaintenanceScreen from "@/components/global-components/Maintainance";
import { useAppStatus } from "@/hooks/useAppStatus";
import logger from "@/utils/logger/browserLogger";

interface MaintenanceWrapperProps {
  children: ReactNode;
}

const useIsAppUnderMaintenance = () => {
  const { data, isLoading, error } = useAppStatus();

  const isUnderMaintenance = data ? data[0]?.appStatus !== "ACTIVE" : false;

  return {
    isUnderMaintenance,
    isLoading,
    error,
  };
};

export default function MaintenanceWrapper({
  children,
}: MaintenanceWrapperProps) {
  const {
    isUnderMaintenance,
    isLoading: isLoadingMaintenanceStatus,
    error: maintenanceError,
  } = useIsAppUnderMaintenance();

  if (isLoadingMaintenanceStatus) {
    return (
      <div className="bg-[#1D2026]">
        <LoadingFallback textColor="text-white" />
      </div>
    );
  }

  if (maintenanceError) {
    logger.error("Error checking maintenance status:", maintenanceError);
    return <>{children}</>;
  }

  if (isUnderMaintenance) {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
}
