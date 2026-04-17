"use client";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import HeaderDropdown from "../global-components/HeaderDropdown";
import { chatActions, headerLabels } from "@/constants/constants";
import { UserModelPrioritiesFeature } from "@/graph/API";
import { useUserModelPriorities } from "@/hooks/fetchPriorityModels";
import { useFetchUserProviderConfigs } from "@/hooks/fetchUserProviderConfigs";
import { useProviderModels } from "@/hooks/gptModels";
import { useAddUserModelPriorities } from "@/hooks/priorityModel";
import { useUpdateUserModelPriorities } from "@/hooks/updatePriorityModel";
import { useUserId } from "@/lib/getUserId";
import {
  CreateUserModelPriorityInput,
  ModelPriorityItems,
} from "@/types/stepper";
import logger from "@/utils/logger/browserLogger";
import { getModelDisplayName } from "@/utils/modelUtils";
import {
  getFilteredOptions,
  getPriorityKeys,
} from "@/utils/priorityModelUtils";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";

const TopBarProviderOptions = ({
  activeFeature,
  showLabelInComponent = true,
}: {
  activeFeature: string;
  showLabelInComponent?: boolean;
}) => {
  const userId = useUserId();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeFeatureLabel =
    chatActions.find((action) => action.id === activeFeature)?.label ?? "";

  const { data: userModelPriorities, refetch: refetchPriorities } =
    useUserModelPriorities(userId ?? undefined);
  const { mutate: fetchUserConfigs, data: userConfigData } =
    useFetchUserProviderConfigs();
  const addPriorityMutation = useAddUserModelPriorities();
  const updatePriorityMutation = useUpdateUserModelPriorities();

  // Get provider configs on mount
  useEffect(() => {
    if (userId) {
      fetchUserConfigs({ userId });
    }
  }, [userId, fetchUserConfigs]);

  // Get provider IDs from user configs
  const providerIds =
    userConfigData?.data?.map((config) => config.providerId) ?? [];
  const { data: allProviderModels = [] } = useProviderModels(providerIds);

  // Filter models based on user's configured providers
  const availableModels = allProviderModels.filter((model) =>
    providerIds.includes(model.providerId)
  );

  // Parse saved models for active feature
  const priorityForActiveFeature = userModelPriorities?.find(
    (item) => item.feature === activeFeature.toUpperCase()
  );

  let parsedModels: { modelId: string; priority: number }[] = [];
  if (priorityForActiveFeature?.models?.length) {
    try {
      parsedModels = JSON.parse(priorityForActiveFeature.models[0]);
    } catch (error) {
      logger.error("Failed to parse priority models:", error);
    }
  }

  // Feature type checks
  const isGeneralOrSummarization =
    activeFeature === "GENERAL" || activeFeature === "SUMMARIZATION";
  const isOptimizationOrComparison =
    activeFeature === "OPTIMIZATION" || activeFeature === "COMPARISON";

  // State management
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [originalModels, setOriginalModels] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected models from saved data
  useEffect(() => {
    let initialModels: string[] = [];

    if (isGeneralOrSummarization) {
      initialModels = [parsedModels[0]?.modelId || ""];
    } else if (isOptimizationOrComparison) {
      // Initialize 3 slots for optimization/comparison
      const initial = parsedModels.map((m) => m.modelId).slice(0, 3);
      while (initial.length < 3) initial.push("");
      initialModels = initial;
    }

    setSelectedModels(initialModels);
    setOriginalModels([...initialModels]);
    setHasChanges(false);
  }, [activeFeature, parsedModels.length]);

  // Check for changes whenever selectedModels updates
  useEffect(() => {
    const hasModelChanges =
      JSON.stringify(selectedModels) !== JSON.stringify(originalModels);
    setHasChanges(hasModelChanges);
  }, [selectedModels, originalModels]);

  const handleSelect = async (idx: number, value: string) => {
    const updated = [...selectedModels];
    updated[idx] = value;
    setSelectedModels(updated);

    // Auto-save on mobile
    if (isMobile) {
      await handleSave(updated);
    }
  };

  const handleSave = async (modelsToSave?: string[]) => {
    if (!userId) return;

    const models = modelsToSave || selectedModels;

    setIsSaving(true);
    try {
      const modelPriorities: ModelPriorityItems[] = models
        .map((modelId, index) => {
          if (!modelId) return null;
          const model = allProviderModels.find((m) => m.modelId === modelId);
          if (!model) return null;
          return {
            modelId: model.modelId,
            modelName: model.modelName,
            providerId: model.providerId,
            priority: index + 1,
          };
        })
        .filter(Boolean) as ModelPriorityItems[];

      if (modelPriorities.length === 0) {
        if (!isMobile) showErrorToast("Please select at least one model");
        return;
      }

      // Validate minimum requirements based on feature type
      if (isOptimizationOrComparison && modelPriorities.length < 2) {
        if (!isMobile)
          showErrorToast(
            "Please select at least 2 models for optimization/comparison"
          );
        return;
      }

      if (priorityForActiveFeature) {
        const updateData = {
          id: priorityForActiveFeature.id,
          models: [JSON.stringify(modelPriorities)],
          userId,
          feature: activeFeature.toUpperCase() as UserModelPrioritiesFeature,
        };

        await updatePriorityMutation.mutateAsync({ input: [updateData] });
      } else {
        const priorityData: CreateUserModelPriorityInput = {
          feature: activeFeature.toUpperCase() as UserModelPrioritiesFeature,
          models: JSON.stringify(modelPriorities),
          userId,
        };

        await addPriorityMutation.mutateAsync({ input: [priorityData] });
      }

      // Update original models and reset change state
      setOriginalModels([...models]);
      setHasChanges(false);

      // Refetch to ensure UI is in sync
      await refetchPriorities();

      if (!isMobile) showSuccessToast("Priority models saved successfully");
      logger.info("✅ Priority models saved successfully");
    } catch (error) {
      logger.error("❌ Error saving priority models:", error);
      if (!isMobile)
        showErrorToast("Failed to save priority models. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedModels([...originalModels]);
    setHasChanges(false);
  };

  const renderDropdowns = () => {
    if (!availableModels.length) {
      return (
        <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2">
          {[...Array(isOptimizationOrComparison ? 3 : 1)].map((_, idx) => (
            <div
              key={idx}
              className="w-32 md:w-40 lg:w-40 xl:w-48 h-7 md:h-7 lg:h-7 xl:h-8 rounded-full shadow-sm px-1.5 md:px-1.5 lg:px-1.5 xl:px-2 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      );
    }

    const priorityKeys = getPriorityKeys(isOptimizationOrComparison);

    return (
      <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2">
        {priorityKeys.map((priorityKey, idx) => {
          const filteredOptions = getFilteredOptions(
            availableModels.map((m) => {
              return {
                label: getModelDisplayName(m),
                value: m.modelId,
              };
            }),
            {
              modelA: {
                first: selectedModels[0],
                second: selectedModels[1],
                third: selectedModels[2],
              },
            },
            "modelA",
            priorityKey
          );

          return (
            <HeaderDropdown
              key={priorityKey}
              idx={idx}
              priorityKey={priorityKey}
              labels={headerLabels}
              filteredOptions={filteredOptions}
              selectedModels={selectedModels}
              handleSelect={handleSelect}
            />
          );
        })}

        {/* Show action buttons only when there are changes (NOT on mobile) */}
        {hasChanges && !isMobile && (
          <>
            <button
              disabled={
                (isOptimizationOrComparison &&
                  selectedModels.filter((m) => m).length < 2) ||
                isSaving
              }
              className={`p-1 md:p-0.5 lg:p-0.5 xl:p-1 rounded-full text-white hover:opacity-90 cursor-pointer transition-all ${
                (isOptimizationOrComparison &&
                  selectedModels.filter((m) => m).length < 2) ||
                  isSaving
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-500"
                }`}
              onClick={() => handleSave()}
              title={
                isOptimizationOrComparison
                  ? "Select at least 2 models"
                  : "Save changes"
              }
            >
              <Check
                size={16}
                className="md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4"
              />
            </button>
            <button
              className="p-1 md:p-0.5 lg:p-0.5 xl:p-1 rounded-full bg-red-500 cursor-pointer text-white hover:opacity-90"
              onClick={handleCancel}
              disabled={isSaving}
              title="Cancel changes"
            >
              <X
                size={16}
                className="md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4"
              />
            </button>
          </>
        )}

        {/* Saving indicator - Hidden on mobile */}
        {isSaving && !isMobile && (
          <div className="text-xs md:text-[10px] lg:text-xs xl:text-xs text-gray-500">
            Saving...
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={
        showLabelInComponent
          ? "px-3 md:px-3 lg:px-3 xl:px-4 py-2 md:py-2.5 lg:py-2.5 xl:py-3"
          : "px-1 md:px-0"
      }
    >
      <div
        className={`flex items-center gap-2 md:gap-4 lg:gap-5 xl:gap-6 ${showLabelInComponent ? "mx-auto" : ""}`}
      >
        {/* Only show label if showLabelInComponent is true (for standalone usage) */}
        {showLabelInComponent && (
          <div className="font-sans text-base md:text-lg lg:text-lg xl:text-xl font-semibold text-black">
            {activeFeatureLabel}
          </div>
        )}
        {renderDropdowns()}
      </div>
    </div>
  );
};

export default TopBarProviderOptions;
