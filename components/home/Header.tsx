import { signOut } from "@aws-amplify/auth";
import { LogOut, Menu, PanelLeft, Rows3, X } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import TopBarProviderOptions from "./TopBarProviderOptions";
import ProgressBar from "../progress-bar/ProgressBar";
import Button from "@/components/global-components/Button";
import {
  gradientTextClass,
} from "@/constants/constants";
import { chatActions } from "@/constants/constants";
import { ROUTES } from "@/constants/routes";
import { useGetUser } from "@/hooks/useGetUser";
import { useListUserSubscriptions } from "@/hooks/useListUserSubscriptions";
import { useUserId } from "@/lib/getUserId";
import Exclude from "@/public/CinfyAIMain.svg";
import PencilSimpleLine from "@/public/PencilSimpleLine.svg";
import settings from "@/public/settings.svg";
import { useSidebarStore } from "@/stores/sideBarStore";
import { subscriptionStore } from "@/stores/subscriptionStore";
import { useChatStore } from "@/stores/useChatStore";
import { FONT_SANS_FAMILY } from "@/styles/fonts";
import localStorageUtils from "@/utils/localStorageUtils";
import logger from "@/utils/logger/browserLogger";
import { clearAllBrowserData } from "@/utils/logoutUtils";
import { getLatestActivePlan } from "@/utils/subscriptionUtils";

export default function Header({
  setRouteLoading,
  isLoading = false,
  isGenerating = false,
  isLoadingMore = false,
  isAdmin = false,
}: {
  setRouteLoading: (val: boolean) => void;
  isLoading?: boolean;
  isGenerating?: boolean;
  isLoadingMore?: boolean;
  isAdmin?: boolean;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  const { isOpen: sidebarOpen, isHovered, toggleSidebar } = useSidebarStore();
  const sidebarIsVisible = sidebarOpen || isHovered;

  const router = useRouter();
  const pathname = usePathname();
  const { activeFeature } = useChatStore();
  const validFeatures = chatActions.map((a) => a.id);

  const userId = useUserId();
  const { data: userSubscription } = useListUserSubscriptions(userId);
  const { data: userData } = useGetUser(userId ?? "");
  const [displayName, setDisplayName] = useState("");
  const { planName, setSubscription } = subscriptionStore();
  const latestPlan = getLatestActivePlan(userSubscription);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (latestPlan) setSubscription(latestPlan.planName, latestPlan.planType);
  }, [latestPlan, setSubscription]);

  const activeFeatureLabel =
    chatActions.find((a) => a.id === activeFeature)?.label ?? "";

  const handleKeyActivate = useCallback(
    (e: React.KeyboardEvent, callback: () => void) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    },
    []
  );

  // Compute user initials
  useEffect(() => {
    if (!userData || !userId) return setDisplayName("");
    const initials = userData.lastName
      ? `${userData.firstName?.[0] ?? ""}${userData.lastName?.[0] ?? ""}`
      : (userData.firstName?.slice(0, 2) ?? "");
    setDisplayName(initials.toUpperCase());
  }, [userData, userId]);

  // Close avatar menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSettingsClick = useCallback(() => {
    if (pathname === ROUTES.SETTINGS) return;
    setRouteLoading(true);
    router.push(`${ROUTES.SETTINGS}?section=profile`);
  }, [pathname, router, setRouteLoading]);

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      try {
        await signOut({ global: true });
        await clearAllBrowserData();
        localStorageUtils.removeItem("priorityModelsSet");
      } catch (authError) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const err = authError as Error & { __type?: string };
        if (err.__type === "NotAuthorizedException") {
          logger.info("Session already invalid, continuing with logout");
        } else {
          logger.error("Error during signOut:", err);
        }
      }

      useChatStore.getState().resetChat?.();

      router.replace(ROUTES.SIGN_IN);
    } catch (error) {
      logger.error("Logout error:", error);
      router.replace(ROUTES.SIGN_IN);
    } finally {
      setIsLoggingOut(false);
    }
  };
  const handleLogoClick = useCallback(() => {
    router.push(ROUTES.CHAT);
  }, [router]);

  const handleNewChat = useCallback(() => {
    const { resetChat, setHistoryChatFeature, setActiveFeature } =
      useChatStore.getState();
    setHistoryChatFeature(null);
    setActiveFeature("GENERAL");
    resetChat();
    router.push(ROUTES.CHAT);
  }, [router]);

  const showProviderOptions =
    pathname === ROUTES.CHAT && validFeatures.includes(activeFeature);

  const isValidating = useChatStore((state) => state.isValidating);

  return (
    <header className="relative z-30">
      <ProgressBar
        isLoading={isLoading || isGenerating || isLoadingMore || isValidating}
      />
      <div className="h-11 md:h-12 xl:h-14 flex border-b border-gray-300">
        {/* Sidebar / Logo */}
        <div
          className={`${
            sidebarIsVisible
            ? "w-60 md:w-60 xl:w-70 px-3 xl:px-4 justify-between"
            : "w-0 md:w-14 xl:w-20 px-0 md:px-2 justify-center"
          } bg-[#F5F7FA] flex items-center h-11 md:h-12 xl:h-14 border-b border-gray-300 transition-all duration-300 fixed md:static left-0 top-0 z-40 ${
            sidebarIsVisible ? "shadow-lg md:shadow-none" : ""
            }`}
        >
          {sidebarIsVisible && (
            <button
              className="flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
              onClick={handleLogoClick}
              onKeyDown={(e) => handleKeyActivate(e, handleLogoClick)}
              aria-label="Go to home"
            >
              <Image
                src={Exclude}
                alt="CinfyAI logo"
                width={28}
                height={28}
                priority
                fetchPriority="high"
                className="w-7 h-7 md:w-[30px] md:h-[30px] xl:w-[35px] xl:h-[35px]"
              />
              <p
                className={`${FONT_SANS_FAMILY} text-lg xl:text-2xl font-bold`}
                style={{
                  background:
                    "linear-gradient(275deg, rgba(173,140,250,0.95) 15%, #FFA386 60%, #FF855E 81%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFeatureSettings: "'ss01' on, 'cv01' on",
                }}
              >
                CinfyAI
              </p>
            </button>
          )}

          {/* New Chat */}
          {pathname === ROUTES.SETTINGS && sidebarIsVisible && (
            <div className="p-4 md:p-2 lg:p-2 xl:p-4 flex-shrink-0 border-gray-700">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-[#FFA386]/50 text-gray-800 rounded-lg p-0.5 md:p-0.5 lg:p-0.5 xl:p-1 font-semibold hover:bg-[#FFA386]/70 flex items-center shadow-md transition"
                onClick={handleNewChat}
                title="New Chat"
                aria-label="Start a new chat"
              >
                <Image
                  src={PencilSimpleLine}
                  alt=""
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 md:w-[14px] md:h-[14px] lg:w-[14px] lg:h-[14px] xl:w-4 xl:h-4"
                />
              </Button>
            </div>
          )}

          {/* Sidebar toggle */}
          <button
            onClick={toggleSidebar}
            onKeyDown={(e) => handleKeyActivate(e, toggleSidebar)}
            className="cursor-pointer p-1.5 md:p-1.5 lg:p-1.5 xl:p-2 rounded-md hover:bg-gray-200"
            aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            aria-pressed={sidebarOpen}
            type="button"
          >
            {sidebarIsVisible ? (
              <>
                {/* X icon for mobile when open */}
                <X
                  size={18}
                  className="w-[18px] h-[18px] text-gray-600 hover:text-gray-800 transition-colors md:hidden"
                />
                {/* PanelLeft icon for tablet/laptop/desktop when open */}
                <PanelLeft
                  size={18}
                  className="hidden md:block w-[17px] h-[17px] lg:w-[18px] lg:h-[18px] xl:w-5 xl:h-5 text-gray-600 hover:text-gray-800 transition-colors"
                />
              </>
            ) : (
              /* Rows3 icon when sidebar is collapsed (tablet/laptop/desktop only) */
              <Rows3
                size={18}
                className="hidden md:block w-[17px] h-[17px] lg:w-[18px] lg:h-[18px] xl:w-5 xl:h-5 text-gray-600 hover:text-gray-800 transition-colors"
              />
            )}
          </button>
        </div>

        {/* Hamburger - Mobile Only */}
        {!sidebarIsVisible && (
          <div className="md:hidden flex items-center h-11 px-2">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-200 bg-[#F5F7FA]"
              aria-label="Open Sidebar"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>
        )}

        {/* Right section */}
        <div className="flex-1 bg-white flex items-center justify-between px-3 md:px-3 lg:px-3 xl:px-4 overflow-visible">
          {/* Feature Label and Options */}
          <div className="flex items-center min-w-0 gap-2 md:gap-3 lg:gap-4 xl:gap-6">
            {/* Feature Label */}
            {showProviderOptions && (
              <div className="font-sans text-sm md:text-lg lg:text-lg xl:text-xl font-semibold text-black flex-shrink-0">
                {activeFeatureLabel}
              </div>
            )}
            {showProviderOptions && (
              <div className="hidden lg:flex">
                <TopBarProviderOptions
                  activeFeature={activeFeature}
                  showLabelInComponent={false}
                />
              </div>
            )}
          </div>

          {/* Plan, Settings, Avatar */}
          <div className="relative flex items-center gap-2 md:gap-3 lg:gap-3 xl:gap-4 flex-shrink-0">
            {isAdmin ? (
              <div className="hidden sm:block font-sans text-base font-bold text-gray-900">
                Admin Panel
              </div>
            ) : (
              <>
                <div className="hidden sm:block font-sans text-xs md:text-sm lg:text-sm xl:text-base font-semibold text-black">
                  <span className="hidden md:inline">Current Plan: </span>
                  <span
                    className={`text-xs md:text-sm lg:text-sm xl:text-base font-bold ${gradientTextClass}`}
                  >
                    {planName ? planName : ""}
                  </span>
                </div>
                <button
                  onClick={handleSettingsClick}
                  onKeyDown={(e) => handleKeyActivate(e, handleSettingsClick)}
                  aria-label="Settings"
                  type="button"
                  className="p-1 rounded-md hover:bg-gray-200 cursor-pointer"
                >
                  <Image
                    src={settings}
                    alt=""
                    width={18}
                    height={18}
                    className="bg-transparent w-[18px] h-[18px] md:w-[17px] md:h-[17px] lg:w-[18px] lg:h-[18px] xl:w-5 xl:h-5"
                  />
                </button>
              </>
            )}

            {/* Avatar Menu */}
            <div ref={avatarMenuRef} className="relative">
              <button
                onClick={() => setIsAvatarMenuOpen((o) => !o)}
                onKeyDown={(e) =>
                  handleKeyActivate(e, () => setIsAvatarMenuOpen((o) => !o))
                }
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={isAvatarMenuOpen}
                className="flex cursor-pointer items-center justify-center rounded-full w-9 h-9 xl:w-11 xl:h-11 text-white font-bold bg-gradient-to-br from-[#FF855E] via-[#D66CBF] to-[#6A2AFFF2]"
              >
                {userId ? displayName || "G" : ""}
              </button>

              {isAvatarMenuOpen && (
                <div
                  role="menu"
                  className="absolute top-0 right-full mr-2 w-28 md:w-34 bg-white shadow-lg rounded-md z-50 border border-gray-200"
                >
                  <Button
                    className="px-3 md:px-3 lg:px-3 xl:px-4 py-1.5 md:py-1.5 lg:py-1 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm text-gray-700 hover:bg-gray-100 hover:text-black flex items-center w-full"
                    onClick={performLogout}
                    disabled={isLoggingOut}
                    role="menuitem"
                    aria-disabled={isLoggingOut}
                    buttonWidth="md"
                    variant="primary"
                  >
                    <LogOut
                      size={14}
                      className="w-3.5 h-3.5 md:w-[14px] md:h-[14px] lg:w-[14px] lg:h-[14px] xl:w-4 xl:h-4 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2"
                    />
                    {isLoggingOut ? "Logging out" : "Logout"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Provider options horizontal scroll on mobile */}
      {showProviderOptions && (
        <div
          className="lg:hidden md:flex justify-center bg-transparent py-2 overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="min-w-max">
            <TopBarProviderOptions
              activeFeature={activeFeature}
              showLabelInComponent={false}
            />
          </div>
        </div>
      )}
    </header>
  );
}
