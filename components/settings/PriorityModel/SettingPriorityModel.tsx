/* eslint-disable @typescript-eslint/naming-convention */
// components/stepper/steps/StepPriorityModel.tsx
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Tooltip,
} from "@mui/material";
import { Info } from "lucide-react";
import { useMemo, useEffect, useState, useCallback } from "react";
import ResetPriorityModal from "./ResetPriorityModal";
import RestorePriorityModal from "./RestorePriorityModal";
import Button from "@/components/global-components/Button";
import CustomSelect from "@/components/global-components/Select";
import { featureMapping } from "@/constants/constants";
import { BUTTON_TEXT } from "@/constants/messages";
import { validatePriorityModels } from "@/constants/validations";
import { UserModelPrioritiesFeature } from "@/graph/API";
import { FetchDefaultSettings } from "@/hooks/defaultSettings";
import { useDeleteUserModelPriorities } from "@/hooks/deletePriority";
import { useUserModelPriorities } from "@/hooks/fetchPriorityModels";
import { useFetchUserProviderConfigs } from "@/hooks/fetchUserProviderConfigs";
import { useProviderModels } from "@/hooks/gptModels";
import { useAddUserModelPriorities } from "@/hooks/priorityModel";
import { useUpdateUserModelPriorities } from "@/hooks/updatePriorityModel";
import { useUserId } from "@/lib/getUserId";
import { usePriorityModelStore } from "@/stores/usePriorityModelStore";
import { ModelPriority } from "@/types/global";
import { UserModelPriority } from "@/types/settings";
import {
  PriorityModelData,
  StepContentProps,
  CreateUserModelPriorityInput,
  ModelPriorityItem,
} from "@/types/stepper";
import { COLORS } from "@/utils/colors";
import logger from "@/utils/logger/browserLogger";
import { getModelDisplayName } from "@/utils/modelUtils";
import {
  createPriorityOptions,
  getFilteredOptions,
  updatePriorityModels,
  getCurrentModelData,
  priorityConfig,
  getPriorityLabels,
  getPriorityKeys,
} from "@/utils/priorityModelUtils";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { transformSettingsToModels } from "@/utils/transformSettingsToModels";

interface StepPriorityModelProps extends Partial<StepContentProps> {
  step?: number;
  errors?: Record<string, string>;
  onSave?: () => void;
  onChange?: (data: { priorityModels?: PriorityModelData }) => void;
  enableStandaloneSave?: boolean;
}

const SettingStepPriorityModel = ({
  data = { apiKeys: [], priorityModels: {}, priorityKeyId: "" },
  errors = {},
  onChange,
  onSave,
  enableStandaloneSave = false,
}: StepPriorityModelProps) => {
  // Hooks
  const userId = useUserId();
  const { mutate, data: userConfigData } = useFetchUserProviderConfigs();
  const deleteUserModelPriorities = useDeleteUserModelPriorities();
  const addPriorityMutation = useAddUserModelPriorities();
  const updatePriorityMutation = useUpdateUserModelPriorities();

  const [isSaving, setIsSaving] = useState({
    isButtonsaved: false,
    isButtonReset: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDefalutPriorityOpen, setIsDefalutPriorityOpen] = useState(false);
  const [initialPriorityModels, setInitialPriorityModels] =
    useState<PriorityModelData>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [accordionStates, setAccordionStates] = useState({
    modelA: true,
    modelB: true,
    modelC: true,
    modelD: true,
  });

  // Zustand store
  const {
    priorityModels: storePriorityModels,
    errors: storeErrors,
    updatePriorityModel,
    setPriorityModels,
    setError,
    clearError,
    clearAllErrors,
    resetStore,
  } = usePriorityModelStore();

  // Derived state
  const priorityModels = data.priorityModels || storePriorityModels;
  const currentErrors = Object.keys(errors).length > 0 ? errors : storeErrors;

  // Fetch provider configs on mount
  useEffect(() => {
    if (userId) {
      mutate({ userId });
    }
  }, [mutate, userId]);

  // Get provider IDs and models
  const providerIds = useMemo(
    () => userConfigData?.data?.map((config) => config.providerId) ?? [],
    [userConfigData?.data]
  );

  const { data: providerModels } = useProviderModels(providerIds);
  const {
    data: userModelPriorities,
    isLoading: loading,
    refetch,
  } = useUserModelPriorities(userId ?? undefined);

  // Data transformation utilities
  const transformApiDataToPriorityModels = useCallback(
    (apiData: UserModelPriority[]): PriorityModelData => {
      const result: PriorityModelData = {};

      apiData.forEach((item) => {
        try {
          const models = parseModelsData(item.models);

          if (!Array.isArray(models)) {
            logger.warn(
              `Models is not an array for feature ${item.feature}:`,
              models
            );
            return;
          }

          const featureKey = findFeatureKey(item.feature);
          if (!featureKey) {
            logger.warn(
              `No feature mapping found for feature: ${item.feature}`
            );
            return;
          }

          result[featureKey] = transformModelsToModelPriority(models);
        } catch (error) {
          logger.error(
            `Error parsing models for feature ${item.feature}:`,
            error
          );
          logger.error("Raw item.models:", item.models);
        }
      });

      return result;
    },
    []
  );

  const parseModelsData = (models: unknown) => {
    if (Array.isArray(models) && models.length > 0) {
      const firstElement = models[0];
      if (typeof firstElement === "string") {
        try {
          return JSON.parse(firstElement);
        } catch {
          logger.error("Failed to parse JSON string:", firstElement);
          return null;
        }
      } else if (
        Array.isArray(firstElement) ||
        typeof firstElement === "object"
      ) {
        return firstElement;
      }
    } else if (typeof models === "string") {
      try {
        return JSON.parse(models);
      } catch {
        logger.error("Failed to parse models string:", models);
        return null;
      }
    }
    return models;
  };

  const findFeatureKey = (feature: string) => {
    return Object.entries(featureMapping).find(
      ([, value]) => value === feature
    )?.[0] as keyof PriorityModelData;
  };

  const transformModelsToModelPriority = (
    models: ModelPriorityItem[]
  ): ModelPriority => {
    const modelPriority: ModelPriority = {};
    models.forEach((model) => {
      if (model.priority === 1) modelPriority.first = model.modelId;
      if (model.priority === 2) modelPriority.second = model.modelId;
      if (model.priority === 3) modelPriority.third = model.modelId;
    });
    return modelPriority;
  };

  const transformPriorityDataForBatch = useCallback(
    (
      priorityModels: PriorityModelData,
      userId: string
    ): CreateUserModelPriorityInput[] => {
      const result: CreateUserModelPriorityInput[] = [];

      Object.entries(priorityModels).forEach(([modelKey, priorities]) => {
        const feature = featureMapping[modelKey as keyof typeof featureMapping];
        const modelPriorities: ModelPriorityItem[] = [];

        if (priorities?.first) {
          modelPriorities.push({ modelId: priorities.first, priority: 1 });
        }
        if (priorities?.second) {
          modelPriorities.push({ modelId: priorities.second, priority: 2 });
        }
        if (priorities?.third) {
          modelPriorities.push({ modelId: priorities.third, priority: 3 });
        }

        if (modelPriorities.length > 0) {
          result.push({
            feature,
            models: JSON.stringify(modelPriorities),
            userId,
          });
        }
      });

      return result;
    },
    []
  );

  const transformPriorityDataForUpdate = useCallback(
    (
      priorityModels: PriorityModelData,
      userId: string,
      existingPriorities: UserModelPriority[]
    ) => {
      const result: Array<{
        id: string;
        models: string[];
        userId: string;
        feature: UserModelPrioritiesFeature;
      }> = [];

      Object.entries(priorityModels).forEach(([modelKey, priorities]) => {
        const feature = featureMapping[
          modelKey as keyof typeof featureMapping
        ] as UserModelPrioritiesFeature;
        const modelPriorities: ModelPriorityItem[] = [];

        if (priorities?.first) {
          modelPriorities.push({ modelId: priorities.first, priority: 1 });
        }
        if (priorities?.second) {
          modelPriorities.push({ modelId: priorities.second, priority: 2 });
        }
        if (priorities?.third) {
          modelPriorities.push({ modelId: priorities.third, priority: 3 });
        }

        if (modelPriorities.length > 0) {
          // Find existing priority for this feature
          const existingPriority = existingPriorities.find(
            (p) => p.feature === feature
          );

          if (existingPriority) {
            result.push({
              id: existingPriority.id,
              models: [JSON.stringify(modelPriorities)],
              userId,
              feature,
            });
          }
        }
      });

      return result;
    },
    []
  );

  // Effect handlers
  const handleProviderConfigReset = useCallback(() => {
    if (userConfigData?.data && userConfigData.data.length === 0) {
      logger.info("🧹 No provider configs found, resetting priority models");
      resetStore();
      setPriorityModels({});
      setIsInitialized(false);
      onChange?.({ priorityModels: {} });
    }
  }, [userConfigData?.data, resetStore, setPriorityModels, onChange]);

  const handleInitialDataLoad = useCallback(() => {
    if (userModelPriorities && !loading && !isInitialized) {
      logger.info("📥 Processing API data...");

      if (
        Array.isArray(userModelPriorities) &&
        userModelPriorities.length > 0
      ) {
        const transformedData =
          transformApiDataToPriorityModels(userModelPriorities);

        if (Object.keys(transformedData).length > 0) {
          setPriorityModels(transformedData);
          setInitialPriorityModels(transformedData);
          onChange?.({ priorityModels: transformedData });
        }
      } else {
        setInitialPriorityModels({});
      }
      setIsInitialized(true);
      setHasUnsavedChanges(false);
    }
  }, [
    userModelPriorities,
    loading,
    isInitialized,
    transformApiDataToPriorityModels,
    setPriorityModels,
    onChange,
  ]);

  const handleProviderModelsReset = useCallback(() => {
    if (isInitialized && providerModels && providerModels.length === 0) {
      resetStore();
      setPriorityModels({});
      onChange?.({ priorityModels: {} });
    }
  }, [providerModels, isInitialized, resetStore, setPriorityModels, onChange]);

  const checkForChanges = useCallback(
    (currentModels: PriorityModelData) => {
      const hasChanges =
        JSON.stringify(currentModels) !== JSON.stringify(initialPriorityModels);
      setHasUnsavedChanges(hasChanges);
      return hasChanges;
    },
    [initialPriorityModels]
  );

  const handleAccordionChange = useCallback(
    (modelType: keyof PriorityModelData) => {
      return (event: React.SyntheticEvent, isExpanded: boolean) => {
        setAccordionStates((prev) => ({
          ...prev,
          [modelType]: isExpanded,
        }));
      };
    },
    []
  );

  const allAccordionsClosed = useMemo(() => {
    return Object.values(accordionStates).every((state) => state === false);
  }, [accordionStates]);

  const handlePropsDataSync = useCallback(() => {
    if (
      data.priorityModels &&
      Object.keys(data.priorityModels).length > 0 &&
      JSON.stringify(data.priorityModels) !==
        JSON.stringify(storePriorityModels)
    ) {
      setPriorityModels(data.priorityModels);
    }
  }, [data.priorityModels, storePriorityModels, setPriorityModels]);

  const handleErrorsSync = useCallback(() => {
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, error]) => {
        if (error && error !== storeErrors[key]) {
          setError(key, error);
        } else if (!error && storeErrors[key]) {
          clearError(key);
        }
      });
    }
  }, [errors, storeErrors, setError, clearError]);

  // Effects
  useEffect(handleProviderConfigReset, [handleProviderConfigReset]);
  useEffect(handleInitialDataLoad, [handleInitialDataLoad]);
  useEffect(handleProviderModelsReset, [handleProviderModelsReset]);
  useEffect(handlePropsDataSync, [handlePropsDataSync]);
  useEffect(handleErrorsSync, [handleErrorsSync]);

  // Cleanup effect to reset initialization state when component unmounts
  useEffect(() => {
    return () => {
      setIsInitialized(false);
      setHasUnsavedChanges(false);
      setInitialPriorityModels({});
    };
  }, []);

  // Event handlers
  const handleStandaloneSave = useCallback(async () => {
    if (!enableStandaloneSave || !userId) {
      logger.warn("Standalone save not enabled or userId not available");
      showErrorToast("Cannot save: missing user ID.");
      return;
    }

    if (isSaving.isButtonsaved) {
      logger.info("Save button temporarily locked to prevent spamming");
      return; // ignore extra clicks during cooldown
    }

    setIsSaving((prev) => ({ ...prev, isButtonsaved: true }));
    clearAllErrors();

    try {
      const validationErrors = validatePriorityModels(priorityModels);

      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([key, error]) => {
          setError(key, error);
        });
        showErrorToast(
          validationErrors.priorityKeyId ||
            "Please resolve the validation errors before saving."
        );
        return;
      }

      // Check if priorities already exist
      const hasExistingPriorities =
        userModelPriorities && userModelPriorities.length > 0;

      if (hasExistingPriorities) {
        // Separate priorities into updates and new creations
        const updateData = transformPriorityDataForUpdate(
          priorityModels,
          userId,
          userModelPriorities
        );

        // Find which features need to be created (not in existing priorities)
        const existingFeatures = userModelPriorities.map((p) => p.feature);
        const newPriorities: CreateUserModelPriorityInput[] = [];

        Object.entries(priorityModels).forEach(([modelKey, priorities]) => {
          const feature = featureMapping[
            modelKey as keyof typeof featureMapping
          ] as UserModelPrioritiesFeature;

          // Check if this feature doesn't exist yet
          if (!existingFeatures.includes(feature)) {
            const modelPriorities: ModelPriorityItem[] = [];

            if (priorities?.first) {
              modelPriorities.push({ modelId: priorities.first, priority: 1 });
            }
            if (priorities?.second) {
              modelPriorities.push({ modelId: priorities.second, priority: 2 });
            }
            if (priorities?.third) {
              modelPriorities.push({ modelId: priorities.third, priority: 3 });
            }

            if (modelPriorities.length > 0) {
              newPriorities.push({
                feature,
                models: JSON.stringify(modelPriorities),
                userId,
              });
            }
          }
        });

        // Update existing priorities
        if (updateData.length > 0) {
          await updatePriorityMutation.mutateAsync({ input: updateData });
        }

        // Create new priorities
        if (newPriorities.length > 0) {
          await addPriorityMutation.mutateAsync({ input: newPriorities });
        }

        setInitialPriorityModels(priorityModels);
        setHasUnsavedChanges(false);

        logger.info("✅ Priority models updated successfully");
        showSuccessToast("Priority models updated successfully.");
      } else {
        // Create new priorities
        const priorityData = transformPriorityDataForBatch(
          priorityModels,
          userId
        );

        if (priorityData.length > 0) {
          await addPriorityMutation.mutateAsync({ input: priorityData });
          setInitialPriorityModels(priorityModels);
          setHasUnsavedChanges(false);

          logger.info("✅ Priority models saved successfully");
          showSuccessToast("Priority models saved successfully.");
        }
      }
    } catch (error) {
      logger.error("❌ Error saving priority models:", error);
      showErrorToast("Failed to save priority models. Please try again.");
      setError("priorityKeyId", "Failed to save priority models.");
    } finally {
      setTimeout(() => {
        setIsSaving((prev) => ({ ...prev, isButtonsaved: false }));
      }, 4000);
    }
  }, [
    enableStandaloneSave,
    userId,
    isSaving.isButtonsaved,
    clearAllErrors,
    priorityModels,
    transformPriorityDataForBatch,
    transformPriorityDataForUpdate,
    addPriorityMutation,
    updatePriorityMutation,
    userModelPriorities,
    setError,
  ]);

  useEffect(() => {
    if (isInitialized) {
      checkForChanges(priorityModels);
    }
  }, [priorityModels, isInitialized, checkForChanges]);

  const handleResetPriorities = useCallback(async () => {
    if (!userId) return;

    setIsSaving((prev) => ({ ...prev, isButtonReset: true }));

    try {
      // Clear UI state first
      resetStore();
      setPriorityModels({});
      clearAllErrors();
      // Delete from backend if there are any priorities
      if (userModelPriorities && userModelPriorities.length > 0) {
        await deleteUserModelPriorities.mutateAsync({ userId });
      }

      // Set everything to empty state - DON'T refetch
      setInitialPriorityModels({});
      setHasUnsavedChanges(false);
      onChange?.({ priorityModels: {} });

      showSuccessToast("Priority models reset successfully.");
    } catch (err) {
      logger.error("Error resetting priority models", err);
      showErrorToast("Failed to reset priority models.");

      // Ensure clean state even on error
      resetStore();
      setPriorityModels({});
      setInitialPriorityModels({});
      clearAllErrors();
      setHasUnsavedChanges(false);
      onChange?.({ priorityModels: {} });
    } finally {
      setIsSaving((prev) => ({ ...prev, isButtonReset: false }));
    }
  }, [
    userId,
    userModelPriorities,
    resetStore,
    setPriorityModels,
    clearAllErrors,
    onChange,
    deleteUserModelPriorities,
  ]);

  const handleSave = useCallback(() => {
    if (enableStandaloneSave) {
      handleStandaloneSave();
    } else if (onSave) {
      onSave();
    } else {
      logger.warn("No save handler available");
    }
  }, [enableStandaloneSave, handleStandaloneSave, onSave]);

  const handleResetConfirm = useCallback(async () => {
    setIsResetModalOpen(false);
    await handleResetPriorities();
  }, [handleResetPriorities]);

  const handlePriorityChange = useCallback(
    (
      modelType: keyof PriorityModelData,
      priorityKey: keyof ModelPriority,
      value: string
    ) => {
      updatePriorityModel(modelType, priorityKey, value);

      if (onChange) {
        const updatedModels = updatePriorityModels(
          priorityModels,
          modelType,
          priorityKey,
          value
        );
        onChange({ priorityModels: updatedModels });
        checkForChanges(updatedModels);
      }
    },
    [updatePriorityModel, onChange, priorityModels, checkForChanges]
  );

  // Computed values
  const priorityOptions = useMemo(() => {
    if (!providerModels || providerModels.length === 0) {
      return [];
    }

    return createPriorityOptions(
      providerModels.map((model) => {
        return {
          providerId: model.modelId,
          providerName: getModelDisplayName(model),
        };
      })
    );
  }, [providerModels]);

  const hasSelectedModels = useMemo(() => {
    if (!priorityModels || Object.keys(priorityModels).length === 0) {
      return false;
    }

    return Object.values(priorityModels).some((modelPriority) => {
      return (
        modelPriority?.first || modelPriority?.second || modelPriority?.third
      );
    });
  }, [priorityModels]);

  const handleRestoreDefault = useCallback(async () => {
    if (!userId) return;

    setIsSaving((prev) => ({ ...prev, isButtonReset: true }));

    try {
      resetStore();
      clearAllErrors();
      setIsInitialized(false);
      setIsDefalutPriorityOpen(false);
      // Fetch default settings
      const settings = await FetchDefaultSettings();
      const results = transformSettingsToModels(settings, userId);

      // Get the model priority configs
      const modelPriorityConfigs = results.modelPriorityConfigs || [];

      // Transform to backend format for saving
      const priorityData = modelPriorityConfigs.map((priority) => ({
        id: priority.id,
        userId: priority.userId,
        feature: priority.feature,
        models: priority.models[0], // This is the JSON string
      }));

      // Delete existing priorities
      if (userModelPriorities && userModelPriorities.length > 0) {
        await deleteUserModelPriorities.mutateAsync({ userId });
      }

      // Create new default priorities in backend
      if (priorityData.length > 0) {
        await addPriorityMutation.mutateAsync({ input: priorityData });
      }

      // Refetch the data from backend to get the proper format
      const updatedResponse = await refetch();
      const updatedData = updatedResponse.data;

      // Transform the fresh backend data to UI format
      if (updatedData && Array.isArray(updatedData) && updatedData.length > 0) {
        const uiFormatData = transformApiDataToPriorityModels(updatedData);

        // Update UI state with properly formatted data
        setPriorityModels(uiFormatData);
        setInitialPriorityModels(uiFormatData);
        onChange?.({ priorityModels: uiFormatData });
      } else {
        // If no data returned, set empty state
        setPriorityModels({});
        setInitialPriorityModels({});
        onChange?.({ priorityModels: {} });
      }

      setIsInitialized(true);
      setHasUnsavedChanges(false);

      showSuccessToast("Priority models restored to default successfully.");
    } catch (err) {
      logger.error("Error restoring default priority models", err);
      showErrorToast("Failed to restore default priority models.");

      // Clean state on error
      resetStore();
      setPriorityModels({});
      setInitialPriorityModels({});
      clearAllErrors();
      setHasUnsavedChanges(false);
      onChange?.({ priorityModels: {} });
    } finally {
      setIsSaving((prev) => ({ ...prev, isButtonReset: false }));
    }
  }, [
    userId,
    userModelPriorities,
    resetStore,
    setPriorityModels,
    clearAllErrors,
    onChange,
    deleteUserModelPriorities,
    addPriorityMutation,
    transformApiDataToPriorityModels,
    refetch,
  ]);

  const renderSelectsForModel = (
    modelType: keyof PriorityModelData,
    isLastAccordion: boolean
  ) => {
    const config = priorityConfig[modelType as keyof typeof priorityConfig];
    //const modelIndex = Object.keys(priorityConfig).indexOf(modelType as string);
    const hasMultiplePriorities =
      config.hasMultiplePriorities && !isLastAccordion;
    const priorityLabels = getPriorityLabels(hasMultiplePriorities);
    const priorityKeys = getPriorityKeys(hasMultiplePriorities);
    const currentModelData = getCurrentModelData(priorityModels, modelType);
    const dropdownMaxHeight = isLastAccordion
      ? "max-h-30 md:max-h-26 lg:max-h-26 xl:max-h-30"
      : "max-h-60 md:max-h-52 lg:max-h-52 xl:max-h-60";

    return (
      <div className="flex flex-col md:flex-row gap-3 md:gap-3 lg:gap-3 xl:gap-4">
        {priorityKeys.map((priorityKey) => {
          const filteredOptions = getFilteredOptions(
            priorityOptions,
            priorityModels,
            modelType,
            priorityKey
          );
          return (
            <div key={priorityKey} className="min-w-0 flex-1">
              <CustomSelect
                label={priorityLabels[priorityKey]}
                options={filteredOptions}
                value={currentModelData[priorityKey] || ""}
                onChange={(val) =>
                  handlePriorityChange(modelType, priorityKey, val.toString())
                }
                maxHeight={dropdownMaxHeight}
                loading={(loading && !isInitialized) || isSaving.isButtonReset}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderAccordion = (
    modelType: keyof PriorityModelData,
    isLastAccordion: boolean = false
  ) => {
    const config = priorityConfig[modelType as keyof typeof priorityConfig];
    const error = currentErrors[modelType];

    return (
      <div
        className="rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[12px] w-full"
        style={{
          background: "rgba(206, 209, 217, 0.10)",
          border: "1px solid #E9EAF0",
          borderRadius: "0.625rem",
        }}
      >
        <Accordion
          defaultExpanded={true}
          disableGutters
          elevation={0}
          square
          sx={{
            background: "transparent !important",
            backgroundColor: "transparent !important",
            borderRadius: "0.625rem",
            padding: "0 12px",
            "@media (min-width: 768px)": {
              padding: "0 12px",
            },
            "@media (min-width: 1024px)": {
              padding: "0 12px",
            },
            "@media (min-width: 1280px)": {
              padding: "0 16px",
            },
            "&:before": {
              display: "none",
            },
            "&.Mui-expanded": {
              margin: 0,
            },
          }}
          onChange={handleAccordionChange(modelType)}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls={`panel-${modelType}-content`}
            id={`panel-${modelType}-header`}
            sx={{
              background: "transparent !important",
              backgroundColor: "transparent !important",
              padding: 0,
              minHeight: "auto",
              "&.Mui-expanded": {
                minHeight: "auto",
              },
              "& .MuiAccordionSummary-content": {
                margin: "10px 0",
                "@media (min-width: 768px)": {
                  margin: "10px 0",
                },
                "@media (min-width: 1024px)": {
                  margin: "10px 0",
                },
                "@media (min-width: 1280px)": {
                  margin: "12px 0",
                },
                "&.Mui-expanded": {
                  margin: "10px 0",
                  "@media (min-width: 768px)": {
                    margin: "10px 0",
                  },
                  "@media (min-width: 1024px)": {
                    margin: "10px 0",
                  },
                  "@media (min-width: 1280px)": {
                    margin: "12px 0",
                  },
                },
              },
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2">
              <h3 className="font-semibold text-black py-1.5 md:py-1.5 lg:py-1.5 xl:py-2 text-sm md:text-[14px] lg:text-[14px] xl:text-[16px] leading-[20px] md:leading-[20px] lg:leading-[20px] xl:leading-[24px]">
                {config.title}
              </h3>
            </div>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              background: "transparent !important",
              backgroundColor: "transparent !important",
              padding: "0 0 12px 0",
              "@media (min-width: 768px)": {
                padding: "0 0 12px 0",
              },
              "@media (min-width: 1024px)": {
                padding: "0 0 12px 0",
              },
              "@media (min-width: 1280px)": {
                padding: "0 0 16px 0",
              },
            }}
          >
            {renderSelectsForModel(modelType, isLastAccordion)}
            {error && (
              <p
                className={`${COLORS.errorText} text-xs md:text-xs lg:text-xs xl:text-sm mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1`}
              >
                {error}
              </p>
            )}
          </AccordionDetails>
        </Accordion>
      </div>
    );
  };

  const renderBackgroundElements = () => (
    <>
      <div
        className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(142, 94, 255, 0.35)",
          filter: "blur(120px)",
          transform: "translate(50%, -50%)",
        }}
      />
      <div
        className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(255, 133, 94, 0.2)",
          filter: "blur(180px)",
          transform: "translate(-100px, -80px)",
        }}
      />
    </>
  );

  const renderActionButtons = () => {
    const isSaveDisabled =
      !hasUnsavedChanges ||
      allAccordionsClosed ||
      isSaving.isButtonsaved ||
      addPriorityMutation.isPending ||
      updatePriorityMutation.isPending;

    const isResetDisabled =
      !hasSelectedModels || allAccordionsClosed || isSaving.isButtonReset;

    return (
      <div className="mt-4 md:mt-4 lg:mt-4 xl:mt-6 flex flex-col gap-2 md:flex-row md:justify-end md:gap-3 lg:gap-3 xl:gap-4">
        <Button
          onClick={() => setIsResetModalOpen(true)}
          disabled={isResetDisabled || isResetModalOpen}
          variant="secondary"
          buttonWidth="md"
        >
          {BUTTON_TEXT.RESET ?? "Reset"}
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaveDisabled}
          buttonWidth="md"
          variant="gradient"
        >
          {addPriorityMutation.isPending || updatePriorityMutation.isPending
            ? BUTTON_TEXT.SAVING
            : BUTTON_TEXT.SAVE}
        </Button>
        <Button
          onClick={() => setIsDefalutPriorityOpen(true)}
          disabled={isDefalutPriorityOpen}
          buttonWidth="lg"
          variant="primary"
        >
          Restore Defaults
        </Button>
      </div>
    );
  };

  // Main render
  return (
    <div className="w-full min-h-[calc(100vh-44px)] md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-56px)] p-4 md:p-5 lg:p-6 xl:p-8 bg-white relative overflow-hidden">
      {renderBackgroundElements()}
      <div className="relative z-10">
        {/* Heading + Tooltip */}
        <div className="flex items-center gap-1 mb-3 md:mb-3 lg:mb-3 xl:mb-4">
          <h2 className="text-xl md:text-xl lg:text-xl xl:text-2xl font-semibold">
            Set Up Priority Models
          </h2>

          <Tooltip
            title="Choose which AI models you want the app to use first."
            placement="right"
          >
            <Info className="text-black w-3 h-3 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3" />
          </Tooltip>
        </div>

        <div className="space-y-3 md:space-y-3 lg:space-y-3 xl:space-y-4">
          {renderAccordion("modelD")}
          {renderAccordion("modelB")}
          {renderAccordion("modelA")}
          {renderAccordion("modelC", true)}
        </div>

        {/* {currentErrors.priorityKeyId && (
          <p className="text-red-500 text-xs md:text-xs lg:text-xs xl:text-sm mt-1.5 md:mt-1.5 lg:mt-1.5 xl:mt-2">
            {currentErrors.priorityKeyId}
          </p>
        )} */}

        {renderActionButtons()}

        <ResetPriorityModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onReset={handleResetConfirm}
        />
        <RestorePriorityModal
          isOpen={isDefalutPriorityOpen}
          onClose={() => setIsDefalutPriorityOpen(false)}
          handleSetDefaultPriority={handleRestoreDefault}
        />
      </div>
    </div>
  );
};

export default SettingStepPriorityModel;
