// app/providers.tsx
"use client";

import React from "react";
import { Toaster, ToastBar } from "react-hot-toast";
import toast from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#374151",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "0",
            maxWidth: "400px",
          },
          success: {
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            style: {
              border: "1px solid #ef4444",
            },
          },
        }}
      >
        {(t) => (
          <ToastBar
            toast={t}
            style={{
              padding: "0",
              background: "transparent",
              boxShadow: "none",
            }}
          >
            {({ icon, message }) => (
              <div className="flex items-start justify-between w-full p-4 ">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{icon}</div>
                  <div className="text-sm font-medium text-gray-900 leading-5">
                    {message}
                  </div>
                </div>
                {t.type !== "loading" && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                    aria-label="Close notification"
                  >
                    <svg
                      className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors duration-200"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
      {children}
    </>
  );
}
