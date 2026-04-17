"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import Button from "../global-components/Button";
import { formFields, otpSchema } from "../sign-up/signUpFormFields";
import { removeSpaces } from "@/utils/regexUtils";

type OtpVerificationFormProps = {
  control: Control<OtpSchema>;
  errors: FieldErrors<OtpSchema>;
  isSubmitting: boolean;
  isValid: boolean;
  isPending: boolean;
  showOtpField: boolean;
  onSubmit: ReturnType<UseFormHandleSubmit<OtpSchema>>;
  onBack: () => void;
  onResend?: () => void;
};
export type OtpSchema = z.infer<typeof otpSchema>;

export function UseOtpForm() {
  return useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });
}

const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  control,
  errors,
  isSubmitting,
  isValid,
  isPending,
  showOtpField,
  onSubmit,
  onResend,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-[16px] md:gap-[16px] lg:gap-[16px] xl:gap-[20px] w-full"
    >
      {errors.root && (
        <div className="text-red-400 text-xs md:text-xs lg:text-xs xl:text-sm text-center bg-red-500/10 p-1.5 md:p-1.5 lg:p-1.5 xl:p-2 rounded-md md:rounded-md lg:rounded-md xl:rounded-lg">
          {errors.root.message}
        </div>
      )}

      {showOtpField && (
        <div className="flex flex-col gap-0.5 md:gap-0.5 lg:gap-0.5 xl:gap-1">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <div className="flex h-10 md:h-10 lg:h-10 xl:h-12 px-3 md:px-3 lg:px-3 xl:px-4 py-[14px] md:py-[14px] lg:py-[14px] xl:py-[17px] items-center gap-[8px] md:gap-[8px] lg:gap-[8px] xl:gap-[10px] rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
                <input
                  ref={field.ref}
                  type={formFields.otp.type}
                  placeholder={formFields.otp.placeholder}
                  autoComplete={formFields.otp.autoComplete}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(removeSpaces(e.target.value));
                  }}
                  onBlur={field.onBlur}
                  disabled={isSubmitting}
                  maxLength={6}
                  className="flex-1 bg-transparent outline-none text-[12px] md:text-[12px] lg:text-[12px] xl:text-[14px] leading-[20px] md:leading-[20px] lg:leading-[20px] xl:leading-[23px] font-normal text-white placeholder-white/60 disabled:opacity-50 text-center tracking-widest"
                />
              </div>
            )}
          />
          {errors.otp && (
            <p className="text-red-400 text-[10px] md:text-[10px] lg:text-[10px] xl:text-xs mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1">
              {errors.otp.message}
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || isSubmitting || isPending}
        className="flex h-10 md:h-10 lg:h-10 xl:h-12 px-6 md:px-6 lg:px-6 xl:px-8 py-[10px] md:py-[10px] lg:py-[10px] xl:py-[13px] justify-center items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 w-full rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[12px] text-md md:text-lg lg:text-lg xl:text-xl font-semibold text-white bg-gradient-to-r from-[#ff855e] to-[#453fca] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-none"
      >
        {isSubmitting || isPending ? (
          <span className="flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2">
            <Loader2 className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 animate-spin text-white" />
            Verifying...
          </span>
        ) : (
          "Verify & Complete Signup"
        )}
      </Button>

      {onResend && (
        <div className="text-center mt-2">
          <p className="text-white/70 text-xs md:text-xs lg:text-xs xl:text-sm">
            Didn't receive code?{" "}
            <button
              type="button"
              onClick={onResend}
              disabled={isSubmitting || isPending}
              className="text-[#ff855e] hover:text-[#ffa386] font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </p>
        </div>
      )}
    </form>
  );
};

export default OtpVerificationForm;
