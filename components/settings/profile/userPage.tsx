"use client";

import { Tooltip } from "@mui/material";
import { Info } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { formConfig } from "./profileData";
import Button from "../../global-components/Button";
import ErrorAlert from "@/components/global-components/ErrorAlert";
import Input from "@/components/global-components/Input";
import CustomSelect from "@/components/global-components/Select";
import { BUTTON_TEXT } from "@/constants/messages";
import { useGetUser } from "@/hooks/useGetUser";
import { useListCountries } from "@/hooks/useListCountries";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useUserId } from "@/lib/getUserId";
import { FormData } from "@/types/settings";
import logger from "@/utils/logger/browserLogger";
import { getGroupIndex } from "@/utils/mathUtils";
import { combineFullName, splitFullName } from "@/utils/nameUtils";
import { removeNonDigits } from "@/utils/regexUtils";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";

type FormField = (typeof formConfig.fields)[0];

const UserInfoCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const userId = useUserId();

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useGetUser(userId ?? "");

  const { data: countriesData, isLoading: isLoadingCountries } =
    useListCountries();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      country: "",
    },
  });

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const countryOptions = useMemo(() => {
    if (!countriesData) return [];
    return countriesData
      .filter((c) => c.isValid)
      .map((country) => ({
        value: country.countryId,
        label: country.countryName,
      }));
  }, [countriesData]);

  const removeCountryCodeFromPhone = (
    phoneNumber: string,
    countryId: string
  ) => {
    if (!phoneNumber || !countriesData) return "";

    const country = countriesData.find((c) => c.countryId === countryId);

    if (country && phoneNumber.startsWith(`+${country.dialCode}`)) {
      return phoneNumber.substring(`+${country.dialCode}`.length);
    }

    return "";
  };

  useEffect(() => {
    if (userData && typeof userData === "object" && countriesData) {
      const fullName = combineFullName(
        userData.firstName || "",
        userData.lastName || ""
      );
      const displayPhone =
        userData.phone && userData.countryId
          ? removeCountryCodeFromPhone(userData.phone, userData.countryId)
          : "";

      reset({
        fullName,
        phone: displayPhone,
        email: userData.email || "",
        country: userData.countryId || "",
      });
    }
  }, [userData, reset, countriesData]);

  const handleSave = handleSubmit((data) => {
    if (!userId) {
      showErrorToast("User not found. Please log in again.");
      return;
    }

    const country = countriesData?.find((c) => c.countryId === data.country);

    if (!country) {
      showErrorToast("Please select a valid country.");
      return;
    }

    const { firstName, lastName } = splitFullName(data.fullName);

    const formattedPhoneNumber =
      data.phone && data.phone.trim()
        ? `+${country.dialCode}${removeNonDigits(data.phone)}`
        : null;

    const updateData: {
      userId: string;
      firstName: string;
      lastName: string;
      countryId: string;
      phone?: string;
    } = {
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      countryId: data.country,
    };

    if (formattedPhoneNumber) {
      updateData.phone = formattedPhoneNumber;
    }

    updateUser(updateData, {
      onSuccess: () => {
        showSuccessToast("User info updated successfully");
        refetch();
        setIsEditing(false);
      },
      onError: (error: unknown) => {
        logger.error("Update error:", error);
        showErrorToast("Something went wrong");
      },
    });
  });

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCountryChange = (
    onChange: (value: string | number) => void,
    onBlur: () => void
  ) => {
    return (selectedValue: string | number) => {
      onChange(selectedValue);
      onBlur();
    };
  };

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/\D/g, "");
  };

  if (isLoading || isLoadingCountries) {
    // return <LoadingFallback />;
  }

  if (error) {
    return <ErrorAlert message={"Error loading user data"} />;
  }

  // Group fields into rows of two with proper typing
  const groupedFields: FormField[][] = formConfig.fields
    .sort((a, b) => a.fieldSortOrder - b.fieldSortOrder)
    .reduce<FormField[][]>((acc, field, index) => {
      const groupIndex = getGroupIndex(index, 2);
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex].push(field);
      return acc;
    }, []);

  return (
    <div className="min-h-[calc(100vh-44px)] md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-56px)] p-4 md:p-5 lg:p-6 xl:p-8 bg-white flex items-start overflow-x-hidden transition-all duration-300 ease-in-out">
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

      <div className="relative w-full flex flex-col justify-between items-start gap-4 md:gap-4 lg:gap-4 xl:gap-6 overflow-hidden">
        {/* Header with title and buttons */}
        <div className="w-full flex flex-col gap-3 md:flex-row md:justify-between md:items-center md:gap-3 lg:gap-3 xl:gap-4 relative z-10">
          {/* LEFT SIDE: Title + Tooltip */}
          <div className="flex items-center gap-1">
            <h1 className="text-xl md:text-xl lg:text-xl xl:text-2xl font-semibold">
              {formConfig.sectionName}
            </h1>

            <Tooltip
              title="Update your details so the app can personalize your experience."
              placement="right"
            >
              <Info className="text-black w-3 h-3 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3" />
            </Tooltip>
          </div>

          {/* RIGHT SIDE: Buttons */}
          <div className="flex justify-start items-center gap-3 md:gap-3 lg:gap-3 xl:gap-4">
            {!isEditing ? (
              <Button
                onClick={handleEditClick}
                variant="gradient"
                buttonWidth="md"
              >
                {BUTTON_TEXT.EDIT}
              </Button>
            ) : (
              <div className="flex gap-3 md:gap-3 lg:gap-3 xl:gap-4">
                <Button
                  variant="secondary"
                  className="hover:bg-gray-200 hover:border-gray-200 !text-black !font-medium"
                  onClick={handleCancel}
                  buttonWidth="md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="gradient"
                  disabled={isUpdating || !isDirty}
                  buttonWidth="md"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Card with gradient background */}
        <div className="w-full rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[12px] relative z-10">
          <div className="p-4 md:p-4 lg:p-4 xl:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 md:gap-x-3 lg:gap-x-3 xl:gap-x-4 gap-y-3 md:gap-y-2 lg:gap-y-2 xl:gap-y-3 max-w-full md:max-w-xl lg:max-w-xl xl:max-w-2xl">
              {groupedFields.flat().map((field) => {
                const fieldName = field.fieldName as keyof FormData;
                const fieldValue = watch(fieldName);

                return field.fieldType === "SELECT" ? (
                  <Controller
                    key={field.fieldKey}
                    name="country"
                    control={control}
                    rules={{ required: "Country is required" }}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <CustomSelect
                        label={field.fieldLabel}
                        options={countryOptions}
                        value={value}
                        className="max-w-full md:max-w-80 lg:max-w-80 xl:max-w-96"
                        onChange={handleCountryChange(onChange, onBlur)}
                        placeholder={field.fieldPlaceholder}
                        disabled={
                          !isEditing || isUpdating || field.fieldDisabled
                        }
                        error={errors.country?.message}
                      />
                    )}
                  />
                ) : (
                  <Input
                    key={field.fieldKey}
                    label={field.fieldLabel}
                    type={
                      field.fieldType === "TEL"
                        ? "text"
                        : field.fieldType.toLowerCase()
                    }
                    placeholder={field.fieldPlaceholder}
                    value={fieldValue}
                    {...register(fieldName, field.validation)}
                    onInput={
                      field.fieldType === "TEL" ? handlePhoneInput : undefined
                    }
                    inputMode={
                      field.fieldType === "TEL" ? "numeric" : undefined
                    }
                    className={`w-full rounded p-2 md:p-1.5 lg:p-1.5 xl:p-2 border ${
                      field.fieldDisabled ? "bg-gray-100" : "bg-white"
                    }`}
                    error={errors[fieldName]?.message}
                    disabled={!isEditing || isUpdating || field.fieldDisabled}
                    maxLength={field.fieldType === "TEL" ? 10 : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
