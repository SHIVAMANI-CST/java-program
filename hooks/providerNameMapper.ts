import { useMemo } from "react";
import { useGptProviders } from "@/hooks/gptProviders";
import { GptProvider } from "@/types/global";
import { isValidArray } from "@/utils/arrayUtils";

export const useProviderNameMapper = () => {
  const { data: providers, isLoading, error } = useGptProviders();

  const providerMap = useMemo(() => {
    if (!isValidArray(providers)) {
      return new Map<string, string>();
    }

    return new Map(
      providers.map((provider: GptProvider) => [
        provider.providerId,
        provider.providerName,
      ])
    );
  }, [providers]);

  const getProviderName = (providerId: string): string => {
    return providerMap.get(providerId) || `Provider ${providerId}`;
  };

  return {
    getProviderName,
    providerMap,
    isLoading,
    error,
  };
};
