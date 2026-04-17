"use client";
import { signOut } from "aws-amplify/auth";
import React from "react";

const page = () => {
  async function handleReload() {
    await signOut({ global: true });
    window.location.reload();
  }
  return (
    <>
      <main className="min-h-dvh flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Thank You for Signing Up!
          </h1>
          <p className="text-gray-600">
            Your application has been submitted successfully. Our team will
            review your information and contact you within 2–3 business days.
          </p>
          <p className="text-gray-500">
            In the meantime, feel free to check out our docs for new users.
          </p>

          <button
            onClick={handleReload}
            className="inline-block mt-4 px-5 py-2 border border-gray-400 rounded-md text-sm font-medium cursor-pointer text-gray-800 hover:bg-gray-50 transition"
          >
            Back to Sign In Page
          </button>
        </div>
      </main>
    </>
  );
};

export default page;
