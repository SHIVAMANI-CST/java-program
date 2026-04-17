/* eslint-disable @typescript-eslint/naming-convention */
"use client";

import {
  User,
  Briefcase,
  Code,
  BookOpen,
  PenTool,
  MoreHorizontal,
  BarChart2,
  Wrench,
  Check,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import Button from "@/components/global-components/Button";
import ProgressBar from "@/components/progress-bar/ProgressBar";
import { PreferencesType } from "@/graph/API";
import { fetchUserPreferencesByUserId } from "@/hooks/fetchUserPreferencesByUserId";
import { useCreatePreferences } from "@/hooks/useCreatePreferences";
import { usePreferences } from "@/hooks/usePreferences";
import { useUpdatePreferences } from "@/hooks/useUpdatePreferences";
import { useUserId } from "@/lib/getUserId";
import logger from "@/utils/logger/browserLogger";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

const roleIconMap: Record<string, JSX.Element> = {
  business_professional: <Briefcase className="w-5 h-5" />,
  developer: <Code className="w-5 h-5" />,
  researcher: <BookOpen className="w-5 h-5" />,
  designer_architect: <PenTool className="w-5 h-5" />,
  student: <User className="w-5 h-5" />,
  other: <MoreHorizontal className="w-5 h-5" />,
};

const usageIconMap: Record<string, JSX.Element> = {
  learning_education: <BookOpen className="w-5 h-5" />,
  creative_projects: <PenTool className="w-5 h-5" />,
  research_analysis: <BarChart2 className="w-5 h-5" />,
  work_productivity: <Briefcase className="w-5 h-5" />,
  technical_support: <Wrench className="w-5 h-5" />,
  personal_assistant: <User className="w-5 h-5" />,
};

const PreferencesSettings: React.FC = () => {
  const userId = useUserId();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errorInterestId, setErrorInterestId] = useState<string | null>(null);

  const { userPreferences, isLoading: loadingUserPrefs } =
    fetchUserPreferencesByUserId(userId ?? "");

  const {
    data: userTypes,
    isLoading: loadingUserTypes,
    error: userTypesError,
  } = usePreferences(PreferencesType.USER_TYPE);

  const {
    data: usageOptions,
    isLoading: loadingUsageOptions,
    error: usageOptionsError,
  } = usePreferences(PreferencesType.APP_USAGE);

  const {
    data: interests,
    isLoading: loadingInterests,
    error: interestsError,
  } = usePreferences(PreferencesType.INTERESTS);

  const { updateUserPreferences, isLoading: updatingPreferences } =
    useUpdatePreferences();

  const { createUserPreferences, isLoading: creatingPreferences } =
    useCreatePreferences();

  // Load existing preferences
  useEffect(() => {
    if (userPreferences && userPreferences.length > 0) {
      const prefs = userPreferences[0];
      if (prefs.role) setSelectedRole(prefs.role);
      if (prefs.usecases && prefs.usecases.length > 0) {
        const parsedUseCases = prefs.usecases
          .filter((uc): uc is string => uc !== null)
          .map((uc) => {
            try {
              return JSON.parse(uc);
            } catch {
              return uc;
            }
          });
        setSelectedUseCases(parsedUseCases);
      }
      if (prefs.interests && prefs.interests.length > 0) {
        const filteredInterests = prefs.interests.filter(
          (interest): interest is string => interest !== null
        );
        setSelectedInterests(filteredInterests);
      }
    }
  }, [userPreferences]);

  const toggleUseCase = (useCaseId: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(useCaseId)
        ? prev.filter((id) => id !== useCaseId)
        : [...prev, useCaseId]
    );
  };

  const toggleInterest = (interestId: string) => {
    if (interestId === errorInterestId) {
      setErrorInterestId(null);
      return;
    }

    if (selectedInterests.includes(interestId)) {
      setSelectedInterests((prev) => prev.filter((id) => id !== interestId));
      setErrorInterestId(null);
    } else {
      if (selectedInterests.length >= 5) {
        setErrorInterestId(interestId);
        return;
      }
      setErrorInterestId(null);
      setSelectedInterests((prev) => [...prev, interestId]);
    }
  };

  const handleSaveStep = async (step: number) => {
    if (!userId) {
      showErrorToast("User ID is required");
      return;
    }

    try {
      const userPreferencesId = userPreferences?.[0]?.userPreferencesId;

      if (step === 0) {
        // Save role
        if (!selectedRole) {
          showErrorToast("Please select a role");
          return;
        }

        if (userPreferencesId) {
          await updateUserPreferences({
            userPreferencesId,
            role: selectedRole,
            userId,
          });
        } else {
          await createUserPreferences({
            role: selectedRole,
            userId,
          });
        }
        showSuccessToast("Role saved successfully!");
      } else if (step === 1) {
        // Save use cases
        if (selectedUseCases.length === 0) {
          showErrorToast("Please select at least one use case");
          return;
        }
        const stringifiedUsecases = selectedUseCases.map((usecase) =>
          JSON.stringify(usecase)
        );

        if (userPreferencesId) {
          await updateUserPreferences({
            userPreferencesId,
            usecases: stringifiedUsecases,
            userId,
          });
        } else {
          await createUserPreferences({
            usecases: stringifiedUsecases,
            userId,
          });
        }
        showSuccessToast("Use cases saved successfully!");
      } else if (step === 2) {
        // Save interests
        if (selectedInterests.length === 0) {
          showErrorToast("Please select at least one interest");
          return;
        }

        if (userPreferencesId) {
          await updateUserPreferences({
            userPreferencesId,
            interests: selectedInterests.length > 0 ? selectedInterests : null,
            userId,
          });
        } else {
          await createUserPreferences({
            interests: selectedInterests.length > 0 ? selectedInterests : null,
            userId,
          });
        }
        showSuccessToast("Interests saved successfully!");
      }
    } catch (error) {
      logger.error("Failed to save preferences:", error);
      showErrorToast("Failed to save preferences. Please try again.");
    }
  };

  const steps = [
    {
      title: "Role",
      description: "What describes you best?",
      completed: !!selectedRole,
    },
    {
      title: "Use Cases",
      description: "How do you want to use this app?",
      completed: selectedUseCases.length > 0,
    },
    {
      title: "Interests",
      description: "What are your main interests?",
      completed: selectedInterests.length > 0,
    },
  ];

  const isLoading =
    loadingUserPrefs ||
    loadingUserTypes ||
    loadingUsageOptions ||
    loadingInterests;
  const isSaving = updatingPreferences || creatingPreferences;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-10">
        <ProgressBar isLoading={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-56px)] p-4 md:p-5 lg:p-6 xl:p-8 bg-white flex items-start overflow-x-hidden">
      {/* Background gradient blobs */}
      <div
        className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(142, 94, 255, 0.35)",
          filter: "blur(180px)",
        }}
      />
      <div
        className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(255, 133, 94, 0.2)",
          filter: "blur(180px)",
        }}
      />

      <div className="relative w-full max-w-6xl">
        <div className="mb-6 md:mb-6 lg:mb-6 xl:mb-8 relative z-10">
          <h1 className="text-xl md:text-xl lg:text-xl xl:text-2xl font-semibold mb-2">
            Preferences
          </h1>
          <p className="text-sm md:text-sm lg:text-sm xl:text-base text-gray-600">
            Customize your experience by setting your preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 md:gap-5 lg:gap-6 xl:gap-8 relative z-10">
          {/* Vertical Stepper */}
          <div className="space-y-3 md:space-y-3 lg:space-y-3 xl:space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                onClick={() => setActiveStep(index)}
                className={`flex items-start gap-3 md:gap-3 lg:gap-3 xl:gap-4 p-3 md:p-3 lg:p-3 xl:p-4 rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-[10px] cursor-pointer transition-all ${
                  activeStep === index
                    ? "bg-gradient-to-r from-[#ff855e]/10 to-[#6A2AFFF2]/10 border-2 border-[#6A2AFFF2]"
                    : "bg-white border-2 border-gray-200 hover:border-[#FF855E]"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 md:w-7 md:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full flex items-center justify-center text-xs md:text-xs lg:text-xs xl:text-sm font-semibold ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : activeStep === index
                        ? "bg-[#6A2AFFF2] text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.completed ? (
                    <Check className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-sm lg:text-sm xl:text-base font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-xs lg:text-xs xl:text-sm text-gray-500 truncate">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-[10px] border-2 border-gray-200 p-4 md:p-4 lg:p-4 xl:p-6">
            {activeStep === 0 && (
              <div>
                <h2 className="text-lg md:text-lg lg:text-lg xl:text-xl font-semibold mb-2">
                  What describes you best?
                </h2>
                <p className="text-sm md:text-sm lg:text-sm xl:text-base text-gray-600 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                  Help us understand your background so we can tailor your
                  experience.
                </p>

                {userTypesError ? (
                  <div className="text-sm md:text-sm lg:text-sm xl:text-base text-red-500">
                    Failed to load options. Please try again.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3 lg:gap-3 xl:gap-4 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                    {userTypes?.map((userType) => (
                      <button
                        key={userType.id}
                        onClick={() => setSelectedRole(userType.id)}
                        className={`flex items-start p-3 md:p-3 lg:p-3 xl:p-4 rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-[10px] border-2 transition-all text-left ${
                          selectedRole === userType.id
                            ? "border-[#6A2AFFF2] bg-[#6A2AFFF2]/5"
                            : "border-gray-200 hover:border-[#FF855E]"
                        }`}
                      >
                        <div className="p-2 bg-black text-white rounded-full mr-4 flex-shrink-0">
                          {roleIconMap[userType.id] || (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm md:text-sm lg:text-sm xl:text-base font-semibold text-black">
                            {userType.title}
                          </div>
                          <div className="text-xs md:text-xs lg:text-xs xl:text-sm text-gray-500 mt-1">
                            {userType.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleSaveStep(0)}
                  disabled={!selectedRole || isSaving}
                  className="w-full"
                  variant="gradient"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}

            {activeStep === 1 && (
              <div>
                <h2 className="text-lg md:text-lg lg:text-lg xl:text-xl font-semibold mb-2">
                  How do you want to use this app?
                </h2>
                <p className="text-sm md:text-sm lg:text-sm xl:text-base text-gray-600 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                  Select all that apply to personalize your experience.
                </p>

                {usageOptionsError ? (
                  <div className="text-sm md:text-sm lg:text-sm xl:text-base text-red-500">
                    Failed to load options. Please try again.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3 lg:gap-3 xl:gap-4 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                    {usageOptions?.map((usage) => (
                      <button
                        key={usage.id}
                        onClick={() => toggleUseCase(usage.id)}
                        className={`flex items-start p-3 md:p-3 lg:p-3 xl:p-4 rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-[10px] border-2 transition-all text-left ${
                          selectedUseCases.includes(usage.id)
                            ? "border-[#6A2AFFF2] bg-[#6A2AFFF2]/5"
                            : "border-gray-200 hover:border-[#FF855E]"
                        }`}
                      >
                        <div className="p-2 bg-black text-white rounded-full mr-4 flex-shrink-0">
                          {usageIconMap[usage.id] || (
                            <Briefcase className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm md:text-sm lg:text-sm xl:text-base font-semibold text-black">
                            {usage.title}
                          </div>
                          <div className="text-xs md:text-xs lg:text-xs xl:text-sm text-gray-500 mt-1">
                            {usage.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleSaveStep(1)}
                  disabled={selectedUseCases.length === 0 || isSaving}
                  className="w-full"
                  variant="gradient"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <h2 className="text-lg md:text-lg lg:text-lg xl:text-xl font-semibold mb-2">
                  What are your main interests?
                </h2>
                <p className="text-sm md:text-sm lg:text-sm xl:text-base text-gray-600 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                  Choose topics you&apos;re interested in to get better
                  recommendations.
                </p>

                {interestsError ? (
                  <div className="text-sm md:text-sm lg:text-sm xl:text-base text-red-500">
                    Failed to load options. Please try again.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-2 lg:gap-2 xl:gap-3 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                    {interests?.map((interest) => (
                      <div key={interest.id} className="flex flex-col">
                        <button
                          onClick={() => toggleInterest(interest.id)}
                          className={`w-full p-2 md:p-2 lg:p-2 xl:p-3 rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-[10px] border-2 transition-all text-xs md:text-xs lg:text-xs xl:text-sm font-medium cursor-pointer ${
                            selectedInterests.includes(interest.id)
                              ? "border-[#6A2AFFF2] bg-[#6A2AFFF2]/5 text-[#6A2AFFF2]"
                              : errorInterestId === interest.id
                                ? "border-red-500 bg-red-50 text-red-700"
                                : "border-gray-200 text-gray-700 hover:border-[#FF855E]"
                          }`}
                        >
                          {interest.title}
                        </button>
                        <div
                          className={`text-red-500 text-[10px] mt-1 text-center leading-tight transition-opacity duration-200 ${
                            errorInterestId === interest.id
                              ? "opacity-100"
                              : "opacity-0 select-none"
                          }`}
                        >
                          You can only select up to 5 interests.
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleSaveStep(2)}
                  disabled={selectedInterests.length === 0 || isSaving}
                  className="w-full"
                  variant="gradient"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;
