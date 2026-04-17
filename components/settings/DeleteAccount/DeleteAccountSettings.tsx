"use client";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import React, { useState, useCallback } from "react";
import Button from "@/components/global-components/Button";
import { LoadingFallback } from "@/components/global-components/LoadingFallback";
import { ROUTES } from "@/constants/routes";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useGetUser } from "@/hooks/useGetUser";
import { useUserId } from "@/lib/getUserId";
import { useChatStore } from "@/stores/useChatStore";
import { COLORS } from "@/utils/colors";
import logger from "@/utils/logger/browserLogger";
import { showSuccessToast } from "@/utils/toastUtils";

const DeleteAccountSettings = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const userId = useUserId();
  const router = useRouter();
  const { data: userData } = useGetUser(userId ?? "");
  const deleteAccountMutation = useDeleteAccount();
  const handleDelete = useCallback(async () => {
    setError("");
    if (!userId) {
      setError(
        "User ID not found. Please sign in again before deleting your account."
      );
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccountMutation.mutateAsync({ userId });
      await signOut();
      useChatStore.getState().resetChat?.();
      router.replace(ROUTES.SIGN_IN);
      window.location.replace(ROUTES.SIGN_IN);
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", ROUTES.SIGN_IN);
        window.history.replaceState(null, "", ROUTES.SIGN_IN);
      }
      showSuccessToast(
        "Account deleted successfully and all settings cleared."
      );
    } catch (err) {
      logger.error("Account deletion failed:", err);
      setError("Something went wrong while deleting your account.");
    } finally {
      setIsDeleting(false);
    }
  }, [userId, deleteAccountMutation]);

  return (
    <div className="min-h-[calc(100vh-44px)] md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-56px)] p-4 md:p-5 lg:p-6 xl:p-8 bg-white flex items-start overflow-x-hidden transition-all duration-300 ease-in-out relative">
      {/* Background gradient blobs */}
      <div
        className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(142, 94, 255, 0.35)",
          filter: "blur(180px)",
          transform: "translate(100px, -80px)",
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
      <div className="relative w-full flex flex-col justify-between items-start gap-4 md:gap-4 lg:gap-4 xl:gap-6 overflow-hidden z-10">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-xl lg:text-xl xl:text-2xl font-semibold text-gray-800">
              Delete Account
            </h2>
          </div>

          <p className="text-gray-600">
            Deleting your account (<strong>{userData?.email}</strong>) is{" "}
            <strong>permanent</strong> and cannot be undone. All your data, API
            keys, and preferences will be lost.
          </p>

          {!showConfirm ? (
            <Button
              variant="danger"
              onClick={() => setShowConfirm(true)}
              buttonWidth="lg"
            >
              Delete My Account
            </Button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-700">
                Are you sure you want to delete your account ? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p
              className={`${COLORS.errorText} text-xs md:text-xs lg:text-xs xl:text-sm mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1`}
            >
              {error}
            </p>
          )}
        </div>
      </div>
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <LoadingFallback text="Deleting your account..." />
        </div>
      )}
    </div>
  );
};

export default DeleteAccountSettings;
