"use client";

import { confirmResetPassword } from "@aws-amplify/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/global-components/Button";
import {
  AmplifyAuthErrorMessages,
  AmplifyAuthErrorName,
  AmplifyAuthErrorNames,
} from "@/constants/constants";
import cinfy from "@/public/CinfyAIMainWhite.svg";

const resetPasswordSchema = z.object({
  code: z
    .string()
    .min(4, "Confirmation code is required")
    .max(6, "Confirmation code must be at most 6 characters")
    .regex(/^\d+$/, "Code must contain only numbers"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

interface NewPasswordProps {
  username: string;
}

export const NewPassword: React.FC<NewPasswordProps> = ({ username }) => {
  const router = useRouter();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPass: false,
    confirmPass: false,
  });
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      newPassword: "",
    },
  });

  const { code, newPassword } = watch();
  const isFormIncomplete = !code || !newPassword;

  const onSubmit = async (data: ResetPasswordSchema): Promise<void> => {
    setIsRedirecting(true);
    confirmResetPassword({
      username,
      confirmationCode: data.code,
      newPassword: data.newPassword,
    })
      .then(() => {
        setResetSuccess(true);
        setIsRedirecting(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      })
      .catch((err) => {
        let message = "Password reset failed";
        setIsRedirecting(false);

        if (typeof err === "object" && err !== null && "name" in err) {
          const errorName = (err as { name: string }).name;

          if (
            Object.values(AmplifyAuthErrorNames).includes(
              errorName as AmplifyAuthErrorName
            )
          ) {
            message =
              AmplifyAuthErrorMessages[errorName as AmplifyAuthErrorName];
          }
        }

        setError("root", { message });
      });
  };

  return (
    <div className="min-h-dvh bg-[#1D2026] relative overflow-hidden auth-page">
      <div className="absolute -top-[150px] -right-[150px] w-[531px] h-[531px] rounded-full bg-[#8e5eff66] blur-[200px]" />
      <div className="absolute top-1/2 -left-[100px] w-[300px] h-[300px] rounded-full bg-[#ff855e33] blur-[150px]" />

      <div className="flex flex-col items-center justify-center min-h-dvh px-4 relative z-10">
        <div className="flex gap-2 justify-center items-center mb-4">
          <Image
            src={cinfy}
            alt="Cinfy Logo"
            width={65}
            height={65}
            className="mt-2 mr-2 drop-shadow-2xl"
          />
          <h1 className="text-[56px] md:text-5xl font-bold drop-shadow-lg text-center">
            <span className="bg-gradient-to-r from-[#ff855e] via-[#ffa386] to-[#ad8cfa] bg-clip-text text-transparent">
              CinfyAI
            </span>
          </h1>
        </div>

        <div className="backdrop-blur-lg rounded-[20px] p-8 mb-2 w-full max-w-[500px]">
          <div className="text-center mb-10">
            <h2 className="text-[32px] font-semibold leading-[40px] text-center mb-2 text-white">
              Reset Your Password
            </h2>
            <p className="text-[18px] text-[#DEDEDE] text-center font-medium leading-[26px]">
              Enter the verification code and your new password
            </p>
          </div>

          {resetSuccess && (
            <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-lg mb-6">
              Password reset successfully. Redirecting to sign-in...
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-[20px] w-full"
          >
            {errors?.root && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">
                {errors.root.message}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <div className="flex w-full h-12 px-4 py-[17px] items-center gap-[10px] rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
                    <input
                      {...field}
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter confirmation code"
                      disabled={isSubmitting}
                      className="flex-1 bg-transparent outline-none text-[14px] leading-[23px] font-normal text-white placeholder-white/40 disabled:opacity-50"
                    />
                  </div>
                )}
              />
              {errors.code && (
                <p className="text-red-400 ml-4 text-xs mt-1">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 relative">
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <div className="flex w-full h-12 px-4 py-[17px] items-center gap-[10px] rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
                    <input
                      {...field}
                      type={showPassword.newPass ? "text" : "password"}
                      placeholder="Enter new password"
                      disabled={isSubmitting}
                      className="flex-1 bg-transparent outline-none text-[14px] leading-[23px] font-normal text-white placeholder-white/40 disabled:opacity-50"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          newPass: !prev.newPass,
                        }))
                      }
                      className="text-white/40 hover:text-white/60 transition-colors"
                      disabled={isSubmitting}
                    >
                      {showPassword.newPass ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                )}
              />
              {errors.newPassword && (
                <p className="text-red-400 ml-4 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                resetSuccess ||
                isFormIncomplete ||
                isSubmitting ||
                isRedirecting
              }
              className="flex h-12 px-8 py-[13px] justify-center items-center gap-2 w-full rounded-[12px] text-xl font-semibold text-white bg-gradient-to-r from-[#ff855e] to-[#453fca] hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed border-none"
            >
              {isSubmitting || isRedirecting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  {isRedirecting ? "Redirecting..." : "Resetting..."}
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-white/70 text-sm">
              Back to{" "}
              <Link
                href="/sign-in"
                className="text-[#ff855e] hover:text-[#ffa386] font-medium underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            © Product Design & Develop by Compileinfy
          </p>
        </div>
      </div>
    </div>
  );
};
