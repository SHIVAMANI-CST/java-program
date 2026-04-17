// app/maintenance/page.tsx
"use client";

import { signOut } from "aws-amplify/auth";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

const MaintenancePage = () => {
  const pathname = usePathname();

  return (
    <main className="min-h-dvh bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="relative p-[1px] rounded-[12px] border-none">
          <div className="rounded-[11px] p-12">
            <div className="text-6xl mb-6 animate-pulse">🛠️</div>

            <h1 className="text-3xl font-semibold text-gray-800 mb-4">
              Under Maintenance
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Our AI platform is currently undergoing scheduled maintenance to
              enhance performance and user experience. We'll be back shortly.
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Systems updating...</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="h-2 rounded-full animate-pulse"
                style={{
                  width: "65%",
                  background:
                    "linear-gradient(92deg, rgba(255, 133, 94, 0.8) 0%, rgba(142, 94, 255, 0.8) 100%)",
                }}
              ></div>
            </div>
            {pathname == ROUTES.THANK_YOU ||
              (pathname == ROUTES.REDIRECT && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <button
                    onClick={() => signOut({ global: true })}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MaintenancePage;
