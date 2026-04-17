"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import Button from "@/components/global-components/Button";
import { LoadingFallback } from "@/components/global-components/LoadingFallback";
import StepContent from "@/components/stepper/StepContent";
import Stepper from "@/components/stepper/Stepper";
import {
  featureMapping,
  STEP_API_KEYS,
  STEP_PRIORITY_MODELS,
  steps,
  STEP_USER_INFO,
  HAS_SKIPPED_WELCOME_KEY,
} from "@/constants/constants";
import { ROUTES } from "@/constants/routes";
import { validatePriorityModels } from "@/constants/validations";
import { useFetchUserProviderConfigs } from "@/hooks/fetchUserProviderConfigs";
import { onboardUser } from "@/hooks/onboardUser";
import { useAddUserModelPriorities } from "@/hooks/priorityModel";
import { useUserId } from "@/lib/getUserId";
import {
  CreateUserModelPriorityInput,
  ModelPriorityItem,
  PriorityModelData,
} from "@/types/stepper";
import localStorageUtils from "@/utils/localStorageUtils";
import logger from "@/utils/logger/browserLogger";
import { splitFullName } from "@/utils/nameUtils";
import { showErrorToast } from "@/utils/toastUtils";
import { flex } from "@/utils/uiStyles";

const phoneRegex = /^\+\d{1,4}[- ]?\d{10}$/;

const stepSchemas = [
  z.object({
    apiKeys: z
      .array(
        z.object({
          id: z.string(),
          key: z.string().optional().or(z.literal("")),
          model: z.string().min(1, "Model is required"),
        })
      )
      .min(1, "At least One API keys are required"),
  }),
  z.object({
    priorityModels: z.object({
      modelA: z.object({
        first: z
          .string()
          .optional()
          .refine((val) => val && val.length > 0, {
            message: "Select the model",
          }),
        second: z
          .string()
          .optional()
          .refine((val) => val && val.length > 0, {
            message: "Select the model",
          }),
        third: z.string().optional(),
      }),
      modelB: z.object({
        first: z
          .string()
          .optional()
          .refine((val) => val && val.length > 0, {
            message: "Select the model",
          }),
        second: z
          .string()
          .optional()
          .refine((val) => val && val.length > 0, {
            message: "Select the model",
          }),
        third: z.string().optional(),
      }),
      modelC: z.object({
        first: z
          .string()
          .optional()
          .refine((val) => val && val.length > 0, {
            message: "Select the model",
          }),
        second: z.string().optional(),
        third: z.string().optional(),
      }),
      modelD: z.object({
        first: z
          .string()
          .optional()
          .refine((val) => val && val.length > 0, {
            message: "Select the model",
          }),
        second: z.string().optional(),
        third: z.string().optional(),
      }),
    }),
  }),
  z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || phoneRegex.test(val), {
        message:
          "Phone number should start with (+,+1,+91 etc) e.g. (+1234567890)",
      }),
  }),
];

export default function GetStarted() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const userId = useUserId();
  const router = useRouter();

  const [formData, setFormData] = useState({
    apiKeys: [] as { id: string; key: string; model: string }[],
    priorityModels: {
      modelA: {},
      modelB: {},
      modelC: {},
      modelD: {},
    } as PriorityModelData,
    priorityKeyId: "",
    name: "",
    email: "",
    userId: userId,
    fullName: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const addPriorityMutation = useAddUserModelPriorities();
  const updateUserMutation = onboardUser();
  const { isPending: isFetchingProviderConfigs } =
    useFetchUserProviderConfigs();

  useEffect(() => {
    if (userId) {
      router.push(ROUTES.CHAT);
    }
  }, [userId, router]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || currentStep !== STEP_USER_INFO) {
        return;
      }
      event.preventDefault();
      if (!isLoading) {
        handleNext();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentStep, formData]);

  if (isFetchingProviderConfigs) {
    return <LoadingFallback />;
  }

  const transformPriorityDataForBatch = (
    priorityModels: PriorityModelData,
    userId: string
  ): CreateUserModelPriorityInput[] => {
    const result: CreateUserModelPriorityInput[] = [];

    Object.entries(priorityModels).forEach(([modelKey, priorities]) => {
      const feature = featureMapping[modelKey as keyof typeof featureMapping];
      const modelPriorities: ModelPriorityItem[] = [];

      if (priorities && priorities.first) {
        modelPriorities.push({ modelId: priorities.first, priority: 1 });
      }
      if (priorities && priorities.second) {
        modelPriorities.push({ modelId: priorities.second, priority: 2 });
      }
      if (priorities && priorities.third) {
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
  };

  const handleNext = async () => {
    if (isButtonDisabled) {
      return;
    }
    setIsButtonDisabled(true);
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1000);

    const currentSchema = stepSchemas[currentStep];
    const stepData = getCurrentStepData();

    if (currentStep === STEP_PRIORITY_MODELS) {
      const result = currentSchema.safeParse(stepData);

      if (!result.success) {
        const nestedErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fullPath = issue.path.join(".");
            nestedErrors[fullPath] = issue.message;
          }
        });

        setErrors(nestedErrors);
        return;
      }

      try {
        const priorityData = transformPriorityDataForBatch(
          formData.priorityModels,
          userId || ""
        );

        if (priorityData.length > 0) {
          await addPriorityMutation.mutateAsync({ input: priorityData });
        }

        setErrors({});
        setCurrentStep((prev) => prev + 1);
        return;
      } catch (error) {
        logger.error("❌ Error saving priority models:", error);
        setErrors({
          priorityKeyId: "Failed to save priority models. Please try again.",
        });
        return;
      }
    }

    if (currentStep === STEP_USER_INFO) {
      const result = currentSchema.safeParse(stepData);

      if (!result.success) {
        const formatted = result.error.flatten().fieldErrors;
        setErrors(
          Object.fromEntries(
            Object.entries(formatted).map(([key, value]) => [
              key,
              value?.[0] ?? "",
            ])
          )
        );
        return;
      }

      try {
        const { firstName, lastName } = splitFullName(formData.fullName);

        await updateUserMutation.mutateAsync({
          userId: userId || "",
          firstName,
          lastName,
          phone: formData.phone,
        });

        setErrors({});
        setIsNavigating(true);

        setTimeout(() => {
          router.push(ROUTES.CHAT);
        }, 500);

        return;
      } catch (error) {
        logger.error("❌ Error updating user:", error);
        setErrors({
          firstName: "Failed to save user information. Please try again.",
        });
        return;
      }
    }

    const result = currentSchema.safeParse(stepData);

    if (!result.success) {
      const formatted = result.error.flatten().fieldErrors;

      if (currentStep === STEP_API_KEYS && formData.apiKeys.length >= 1) {
        if ("apiKeys" in formatted) {
          delete formatted.apiKeys;
        }
      }

      const newErrors = Object.fromEntries(
        Object.entries(formatted).map(([key, value]) => [key, value?.[0] ?? ""])
      );
      setErrors(newErrors);
      if (newErrors.apiKeys) {
        showErrorToast(newErrors.apiKeys);
      }
    } else {
      setErrors({});
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorageUtils.setItem<boolean>(HAS_SKIPPED_WELCOME_KEY, true);
    router.push(`${ROUTES.CHAT}?showWelcome=true`);
  };

  const updateForm = (values: Partial<typeof formData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...values };

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };

        if (
          currentStep === STEP_API_KEYS &&
          updated.apiKeys?.length >= 1 &&
          newErrors.apiKeys
        ) {
          delete newErrors.apiKeys;
        }

        if (currentStep === STEP_PRIORITY_MODELS && values.priorityModels) {
          Object.entries(values.priorityModels).forEach(
            ([modelType, priorities]) => {
              if (priorities && typeof priorities === "object") {
                Object.entries(priorities).forEach(([priorityKey, value]) => {
                  if (typeof value === "string" && value.length > 0) {
                    const fieldErrorKey = `priorityModels.${modelType}.${priorityKey}`;
                    if (newErrors[fieldErrorKey]) {
                      delete newErrors[fieldErrorKey];
                    }
                  }
                });
              }
            }
          );
        }

        if (
          currentStep === STEP_USER_INFO &&
          (values.fullName || values.phone)
        ) {
          newErrors.fullName = "";
          newErrors.phone = "";
        }

        return newErrors;
      });

      return updated;
    });
  };

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 0:
        return {
          apiKeys: formData.apiKeys,
        };
      case 1:
        return {
          priorityModels: formData.priorityModels,
        };
      case 2:
        return {
          fullName: formData.fullName,
          phone: formData.phone,
        };
      default:
        return {};
    }
  };

  const isLoading =
    addPriorityMutation.isPending ||
    updateUserMutation.isPending ||
    isNavigating;

  return (
    <div
      className={`min-h-dvh px-4 py-10 ${flex} relative overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 133, 94, 0.08) 0%, rgba(142, 94, 255, 0.15) 100%)",
      }}
    >
      {/* Top Right Gradient Blur */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "531px",
          height: "531px",
          borderRadius: "531px",
          background: "rgba(142, 94, 255, 0.04)",
          filter: "blur(200px)",
          transform: "translate(60%, -60%)",
          flexShrink: 0,
        }}
      />

      {/* Bottom Left Gradient Blur */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: "531px",
          height: "531px",
          borderRadius: "531px",
          background: "rgba(255, 133, 94, 0.05)",
          filter: "blur(200px)",
          transform: "translate(-60%, 60%)",
          flexShrink: 0,
        }}
      />

      <div className="w-[54rem] max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <div className="mb-6 px-2 sm:px-0">
          <div className="flex flex-col justify-center h-[30px]">
            <h1 className="text-[32px] font-bold leading-[20px] tracking-[0px] text-[#1D2026] ">
              Get Started
            </h1>
          </div>
          <p className="mt-6 text-[16px] font-normal leading-[20px] text-[#1D2026] ">
            Configure your API keys, set model priorities, and manage your user
            profile to begin using CinfyAI.
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div
            className="relative p-[1px] rounded-[12px] w-[54rem] border-none z-10"
            style={{
              background:
                "linear-gradient(92deg, rgba(255, 133, 94, 0.05) 0%, rgba(142, 94, 255, 0.08) 100%)",
            }}
          >
            <div className="flex flex-col items-start gap-4 self-stretch rounded-[10px] bg-white px-[36px] py-[30px] shadow-md">
              {/* Stepper */}
              <div className="w-full">
                <Stepper steps={steps} currentStep={currentStep} />
              </div>

              <div className="w-full border-b border-gray-200" />

              {/* Content */}
              <div className="w-full">
                <StepContent
                  step={currentStep}
                  data={{
                    apiKeys: formData.apiKeys.map((key) => ({
                      ...key,
                      model: key.model || "",
                    })),
                    priorityModels: formData.priorityModels,
                    priorityKeyId: formData.priorityKeyId,
                    fullName: formData.fullName,
                    phone: formData.phone,
                  }}
                  errors={errors}
                  onChange={updateForm}
                  onSave={async () => {
                    const priorityErrors = validatePriorityModels(
                      formData.priorityModels
                    );

                    if (Object.keys(priorityErrors).length > 0) {
                      setErrors(priorityErrors);
                      return;
                    }

                    try {
                      const priorityData = transformPriorityDataForBatch(
                        formData.priorityModels,
                        userId || ""
                      );

                      if (priorityData.length > 0) {
                        await addPriorityMutation.mutateAsync({
                          input: priorityData,
                        });
                      }

                      setErrors({});
                    } catch (error) {
                      logger.error("❌ Error saving priority models:", error);
                      setErrors({
                        priorityKeyId:
                          "Failed to save priority models. Please try again.",
                      });
                    }
                  }}
                />
              </div>

              <div className="flex justify-between w-full mt-4">
                <Button
                  onClick={handleSkip}
                  className="bg-white! text-black! font-medium py-2 px-4 rounded flex items-center"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-black! font-medium py-2 px-4 rounded flex items-center"
                >
                  {isLoading
                    ? currentStep === STEP_PRIORITY_MODELS
                      ? "Saving..."
                      : isNavigating
                        ? "Redirecting..."
                        : "Updating..."
                    : currentStep === steps.length - 1
                      ? "Complete Setup"
                      : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
