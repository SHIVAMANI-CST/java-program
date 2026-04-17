"use client";

import { resetPassword } from "@aws-amplify/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

import Button from "@/components/global-components/Button";
import { NewPassword } from "@/components/new-password/NewPassword";
import {
  AmplifyAuthErrorMessages,
  AmplifyAuthErrorName,
} from "@/constants/constants";
import { ROUTES } from "@/constants/routes";
import cinfy from "@/public/CinfyAIMainWhite.svg";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [username, setUsername] = useState("");

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  function isAmplifyAuthErrorName(name: string): name is AmplifyAuthErrorName {
    return name in AmplifyAuthErrorMessages;
  }

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await resetPassword({ username: data.email });
      setUsername(data.email);
      setEmailSent(true);
    } catch (err) {
      let errorMessage = "Password reset failed";

      if (typeof err === "object" && err !== null && "name" in err) {
        const errorName = (err as { name: string }).name;
        if (isAmplifyAuthErrorName(errorName)) {
          errorMessage = AmplifyAuthErrorMessages[errorName];
        }
      }

      setError("root", { message: errorMessage });
    }
  };

  if (emailSent) return <NewPassword username={username} />;

  return (
    <div className="min-h-dvh bg-[#1D2026] relative overflow-hidden auth-page">
      <div className="absolute -top-[100px] md:-top-[120px] lg:-top-[120px] xl:-top-[150px] -right-[100px] md:-right-[120px] lg:-right-[120px] xl:-right-[150px] w-[350px] h-[350px] md:w-[420px] md:h-[420px] lg:w-[420px] lg:h-[420px] xl:w-[531px] xl:h-[531px] rounded-full bg-[#8e5eff66] blur-[200px]" />
      <div className="absolute top-1/2 -left-[70px] md:-left-[80px] lg:-left-[80px] xl:-left-[100px] w-[200px] h-[200px] md:w-[240px] md:h-[240px] lg:w-[240px] lg:h-[240px] xl:w-[300px] xl:h-[300px] rounded-full bg-[#ff855e33] blur-[150px]" />
      <div className="flex flex-col items-center justify-start min-h-dvh px-4 md:px-3 lg:px-3 xl:px-4 py-3 md:py-6 lg:py-8 xl:py-8 relative z-10">
        <div
          onClick={() => router.push(ROUTES.SIGN_IN)}
          className="flex gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 justify-center items-center mb-1 md:mb-2 lg:mb-3 xl:mb-4 cursor-pointer"
        >
          <Image
            src={cinfy}
            alt="Cinfy Logo"
            width={55}
            height={55}
            priority
            fetchPriority="high"
            className="mt-1.5 md:mt-1.5 lg:mt-1.5 xl:mt-2 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2 drop-shadow-2xl w-[45px] h-[45px] md:w-[45px] md:h-[45px] lg:w-[55px] lg:h-[55px] xl:w-[65px] xl:h-[65px]"
          />
          <h1 className="text-[36px] md:text-[36px] lg:text-[46px] xl:text-[56px] font-bold drop-shadow-lg text-center">
            <span className="bg-gradient-to-r from-[#ff855e] via-[#ffa386] to-[#ad8cfa] bg-clip-text text-transparent">
              CinfyAI
            </span>
          </h1>
        </div>

        <div className="backdrop-blur-lg rounded-[16px] md:rounded-[16px] lg:rounded-[16px] xl:rounded-[20px] p-6 md:p-6 lg:p-6 xl:p-8 mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2 w-full max-w-[420px] md:max-w-[420px] lg:max-w-[420px] xl:max-w-[500px]">
          <div className="text-center mb-6 md:mb-8 lg:mb-8 xl:mb-10">
            <h2 className="text-[24px] md:text-[28px] lg:text-[28px] xl:text-[32px] font-semibold leading-[32px] md:leading-[34px] lg:leading-[34px] xl:leading-[40px] text-center mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2 text-white">
              Forgot your password?
            </h2>
            <p className="text-[14px] md:text-[16px] lg:text-[16px] xl:text-[18px] text-[#DEDEDE] text-center font-medium leading-[20px] md:leading-[22px] lg:leading-[22px] xl:leading-[26px]">
              Enter your email to reset your password
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-[16px] md:gap-[16px] lg:gap-[16px] xl:gap-[20px] w-full"
          >
            {errors.root && (
              <div className="text-red-400 text-xs md:text-xs lg:text-xs xl:text-sm text-center bg-red-500/10 p-1.5 md:p-1.5 lg:p-1.5 xl:p-2 rounded-md md:rounded-md lg:rounded-md xl:rounded-lg">
                {errors.root.message}
              </div>
            )}
            <div className="flex flex-col gap-0.5 md:gap-0.5 lg:gap-0.5 xl:gap-1">
              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <div className="flex w-full h-10 md:h-10 lg:h-10 xl:h-12 px-3 md:px-3 lg:px-3 xl:px-4 py-[14px] md:py-[14px] lg:py-[14px] xl:py-[17px] items-center gap-[8px] md:gap-[8px] lg:gap-[8px] xl:gap-[10px] rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
                    <input
                      ref={ref}
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      disabled={isSubmitting}
                      className="flex-1 bg-transparent outline-none text-[12px] md:text-[12px] lg:text-[12px] xl:text-[14px] leading-[20px] md:leading-[20px] lg:leading-[20px] xl:leading-[23px] font-normal text-white placeholder-white/40 disabled:opacity-50"
                    />
                  </div>
                )}
              />
              {errors.email && (
                <p className="text-red-400 ml-2.5 md:ml-2.5 lg:ml-2.5 xl:ml-4 text-[10px] md:text-[10px] lg:text-[10px] xl:text-xs mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex h-10 md:h-10 lg:h-10 xl:h-12 px-6 md:px-6 lg:px-6 xl:px-8 py-[10px] md:py-[10px] lg:py-[10px] xl:py-[13px] justify-center items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 w-full rounded-[10px] md:rounded-[10px] lg:rounded-[10px] xl:rounded-[12px] text-lg md:text-lg lg:text-lg xl:text-xl font-semibold text-white bg-gradient-to-r from-[#ff855e] to-[#453fca] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-none"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2">
                  <Loader2 className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 animate-spin text-white" />
                  Sending...
                </span>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
          <div className="text-center mt-4 md:mt-5 lg:mt-5 xl:mt-6">
            <p className="text-white/70 text-xs md:text-xs lg:text-xs xl:text-sm">
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
        <div className="mt-6 md:mt-6 lg:mt-6 xl:mt-8 text-center">
          <p className="text-white/40 text-xs md:text-xs lg:text-xs xl:text-sm">
            © Product Design & Develop by Compileinfy
          </p>
        </div>
      </div>
    </div>
  );
}
