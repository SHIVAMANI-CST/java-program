"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Header from "@/components/home/Header";
import Sidebar from "@/components/home/Sidebar";
import ProgressBar from "@/components/progress-bar/ProgressBar";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { ROUTES } from "@/constants/routes";
import { useSidebarStore } from "@/stores/sideBarStore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isOpen: sidebarOpen, setSidebarOpen } = useSidebarStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [routeLoading, setRouteLoading] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const getSidebarType = () => {
    if (pathname === ROUTES.CHAT || pathname.startsWith("/chat/")) {
      return "chat";
    } else if (
      pathname === ROUTES.SETTINGS ||
      pathname.startsWith("/settings/")
    ) {
      return "settings";
    }
    return null;
  };

  const sidebarType = getSidebarType();

  const renderSidebar = () => {
    switch (sidebarType) {
      case "chat":
        return <Sidebar ref={sidebarRef} />;
      case "settings":
        return (
          <SettingsSidebar
            ref={sidebarRef}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      const smallDevice = window.innerWidth >= 0 && window.innerWidth < 1024;

      // For small devices (mobile + tablet), set sidebar to closed; for laptops, set to open
      if (smallDevice) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }

      setIsInitialized(true);
    }
  }, [isInitialized, setSidebarOpen]);

  // Handle screen resize to adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      const smallDevice = window.innerWidth >= 0 && window.innerWidth < 1024;
      const isLaptop = window.innerWidth >= 1024;

      if (smallDevice && sidebarOpen) {
        setSidebarOpen(false);
      } else if (isLaptop && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    setRouteLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const smallDevice = window.innerWidth >= 0 && window.innerWidth < 1024;
      if (!smallDevice || !sidebarOpen || !sidebarType) return;

      const target = event.target as HTMLElement;

      if (target.closest("header")) {
        return;
      }
      if (target.closest("[data-sidebar-content]")) {
        return;
      }
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        if (!target.closest("[data-sidebar-toggle]")) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, sidebarType, setSidebarOpen]);

  return (
    <SubscriptionGuard>
      <div className="flex h-dvh flex-col">
        {/* Progress Bar - shows on all pages when chat is loading */}
        {pathname === ROUTES.CHAT && <ProgressBar isLoading={routeLoading} />}

        {/* Header appears everywhere */}
        <Header setRouteLoading={setRouteLoading} />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {sidebarType && renderSidebar()}

          {/* Page content */}
          <div
            className={`
              flex-1 flex flex-col transition-all duration-300 ease-in-out
              ${sidebarType ? "md:ml-14" : "md:ml-0"}
              ${sidebarType && sidebarOpen ? "ml-0 lg:ml-60 xl:ml-70" : "ml-0 lg:ml-16 xl:ml-20"}
            `}
          >
            {children}
          </div>
        </div>
      </div>
    </SubscriptionGuard>
  );
}
