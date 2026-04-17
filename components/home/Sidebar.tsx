// components/Sidebar.tsx
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Ellipsis, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMemo,
  useState,
  Suspense,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import Shimmer from "../global-components/SidebarShimer";
import Button from "@/components/global-components/Button";
import { buildChatRoute, ROUTES } from "@/constants/routes";
import { useDeleteConversation } from "@/hooks/useDeleteConversation";
import { useListConversations } from "@/hooks/useListConversations";
import { useUpdateConversation } from "@/hooks/useUpdateConversation";
import { useUserId } from "@/lib/getUserId";
import PencilSimpleLine from "@/public/PencilSimpleLine.svg";
import { useSidebarStore } from "@/stores/sideBarStore";
import { useChatStore } from "@/stores/useChatStore";
import { groupConversationsByDate } from "@/utils/conversationUtils";
import { getDateGroupOrder } from "@/utils/dateUtils";
import { iconSizes, textSizes } from "@/utils/designTokens";
import logger from "@/utils/logger/browserLogger";
import { showSuccessToast } from "@/utils/toastUtils";

const CONVERSATIONS_PER_PAGE = 20;

// Animation variants
const sidebarVariants = {
  open: {
    width: "auto",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    width: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
} as const;

const contentVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0,
      duration: 0.15,
    },
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.1,
    },
  },
};

// eslint-disable-next-line @typescript-eslint/naming-convention
function SidebarSearchParamsHandler({
  children,
}: {
  children: (params: {
    showWelcome: boolean;
    filter: string | null;
  }) => React.ReactNode;
}) {
  const searchParams = useSearchParams();

  const { showWelcome, filter } = useMemo(() => {
    return {
      filter: searchParams.get("filter"),
      showWelcome: searchParams.get("showWelcome") === "true",
    };
  }, [searchParams]);

  return <>{children({ showWelcome, filter })}</>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const SidebarContent = forwardRef<HTMLDivElement>((props, ref) => {
  const { isOpen, isHovered, setHovered, setSidebarOpen } = useSidebarStore();

  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallDevice(window.innerWidth >= 0 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const sidebarIsVisible = isSmallDevice ? isOpen : isOpen || isHovered;

  const userId = useUserId();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(CONVERSATIONS_PER_PAGE);
  const [hoveredConversationId, setHoveredConversationId] = useState<
    string | null
  >(null);
  const searchParams = useSearchParams();
  const currentConversationId = searchParams.get("conversationId");
  const { activeFeature, loadingConversationId, setActiveFeature, isLoading } =
    useChatStore();
  const [displayFeature, setDisplayFeature] = useState(activeFeature);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [editingConversationId, setEditingConversationId] = useState<
    string | null
  >(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const { isModelAndPrioritySet } = useSidebarStore();
  const { updateConversation, isLoading: isUpdatingConversation } =
    useUpdateConversation();
  const { deleteConversation, isLoading: isDeletingConversation } =
    useDeleteConversation();

  useEffect(() => {
    setDisplayFeature(activeFeature);
  }, [activeFeature]);

  const {
    data: conversations = [],
    isLoading: isConversationListLoading,
    error,
  } = useListConversations(userId);

  const filteredConversations = useMemo(() => {
    if (!displayFeature || displayFeature === "GENERAL") {
      return conversations;
    }
    return conversations.filter(
      (conversation) => conversation.feature === displayFeature
    );
  }, [conversations, displayFeature]);

  const groupEntries = useMemo(
    () =>
      Object.entries(groupConversationsByDate(filteredConversations)).sort(
        ([labelA], [labelB]) => {
          return getDateGroupOrder(labelA) - getDateGroupOrder(labelB);
        }
      ),
    [filteredConversations]
  );

  const flattenedConversations = useMemo(
    () =>
      groupEntries.flatMap(([dateGroup, convs]) =>
        convs.map((conv) => ({ ...conv, dateGroup }))
      ),
    [groupEntries]
  );

  const visibleConversations = flattenedConversations.slice(0, visibleCount);
  const hasMore = visibleCount < flattenedConversations.length;

  const visibleGroupEntries = useMemo(
    () =>
      visibleConversations.reduce(
        (acc, conv) => {
          if (!acc[conv.dateGroup]) {
            acc[conv.dateGroup] = [];
          }
          acc[conv.dateGroup].push(conv);
          return acc;
        },
        {} as Record<string, typeof visibleConversations>
      ),
    [visibleConversations]
  );

  const handleNewChat = () => {
    const { resetChat, setHistoryChatFeature } = useChatStore.getState();
    setHistoryChatFeature(null);
    setActiveFeature(activeFeature);
    resetChat();
    router.push(ROUTES.CHAT);
  };

  const handleConversationClick = (
    conversationId: string,
    feature?: string
  ) => {
    if (isLoading || currentConversationId === conversationId) {
      return;
    }

    if (editingConversationId === conversationId) return;

    const newFeature = feature ?? "GENERAL";
    // setActiveFeature(newFeature); // Removed to prevent UI glitch - handled by page.tsx after loading
    // setDisplayFeature(newFeature); // Removed to prevent early filtering

    const { startConversationLoad, setHistoryChatFeature } =
      useChatStore.getState();
    startConversationLoad(conversationId);
    setHistoryChatFeature(newFeature);
    router.push(buildChatRoute(conversationId));

    if (isSmallDevice) {
      setSidebarOpen(false);
    }
  };

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + CONVERSATIONS_PER_PAGE);
  };

  const handleShowAll = () => {
    setDisplayFeature("GENERAL");
  };

  const handleStartRename = (conversationId: string, currentTitle: string) => {
    setDropdownOpen(null);
    setEditingConversationId(conversationId);
    setEditingTitle(currentTitle);
  };

  const handleCancelEdit = () => {
    setEditingConversationId(null);
    setEditingTitle("");
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setDropdownOpen(null);
    setDeletingConversationId(conversationId);
    try {
      await deleteConversation({ conversationId: conversationId });
      showSuccessToast("Conversation deleted successfully");

      if (currentConversationId === conversationId) {
        handleNewChat();
      }
    } catch (err) {
      logger.error("Failed to delete conversation.", err);
    } finally {
      setDeletingConversationId(null);
    }
  };

  const queryClient = useQueryClient();
  const handleSaveRename = async () => {
    if (!editingConversationId || !editingTitle.trim()) {
      handleCancelEdit();
      return;
    }

    const newTitle = editingTitle.trim();
    const originalConversation = conversations.find(
      (c) => c.conversationId === editingConversationId
    );

    if (originalConversation && originalConversation.title === newTitle) {
      handleCancelEdit();
      return;
    }

    try {
      await updateConversation({
        conversationId: editingConversationId,
        title: editingTitle.trim(),
      });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err) {
      logger.error("Failed to save the new title.", err);
    } finally {
      handleCancelEdit();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleToggleDropdown = (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    if (dropdownOpen === conversationId) {
      setDropdownOpen(null);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.right - 20,
      });
      setDropdownOpen(conversationId);
    }
  };

  const handleCollapsedSidebarClick = () => {
    if (isSmallDevice && !isOpen) {
      setSidebarOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownOpen) return;

      const target = event.target as HTMLElement;

      const triggerButton = target.closest(
        `[data-conversation-id="${dropdownOpen}"]`
      );

      if (triggerButton) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <Suspense
      fallback={
        <div className="w-60 md:w-60 lg:w-60 xl:w-70 bg-[#F5F7FA] h-full" />
      }
    >
      <SidebarSearchParamsHandler>
        {() => {
          const isSidebarFrozen = !isModelAndPrioritySet;

          return (
            <motion.div
              ref={ref}
              onMouseEnter={() => !isSmallDevice && setHovered(true)}
              onMouseLeave={() => !isSmallDevice && setHovered(false)}
              onClick={handleCollapsedSidebarClick}
              initial={false}
              animate={sidebarIsVisible ? "open" : "closed"}
              variants={sidebarVariants}
              className={`fixed left-0 top-11 md:top-12 lg:top-12 xl:top-14 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-3rem)] xl:h-[calc(100vh-3.5rem)] z-40 ${
                isSmallDevice && sidebarIsVisible ? "shadow-2xl" : ""
              }`}
              style={{
                width: sidebarIsVisible
                  ? "15rem"
                  : isSmallDevice
                    ? "0rem"
                    : "3.5rem",
              }}
            >
              <div
                className={`${
                  sidebarIsVisible
                    ? "w-60 md:w-60 lg:w-60 xl:w-70"
                    : "w-0 md:w-14 lg:w-16 xl:w-20"
                }
                  bg-[#F5F7FA] text-white flex flex-col h-full
                  ${isSidebarFrozen ? "opacity-50 pointer-events-none" : ""}
                `}
              >
                {/* New Chat Button */}
                <div
                  className={`p-3 md:p-2 lg:p-2 xl:p-4 flex-shrink-0 border-gray-700 ${sidebarIsVisible ? "" : "hidden md:flex justify-center"}`}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className={`bg-[#FFA386]/50 text-gray-800 rounded-lg font-semibold hover:bg-[#FFA386]/70 flex items-center shadow-md transition-all p-1.5 md:p-1.5 lg:p-1.5 xl:p-2 ${
                      sidebarIsVisible
                        ? "w-full justify-start"
                        : "justify-center"
                    }`}
                    onClick={handleNewChat}
                    disabled={isSidebarFrozen}
                    title="New Chat"
                  >
                    <Image
                      src={PencilSimpleLine}
                      alt=""
                      aria-hidden="true"
                      width={14}
                      height={14}
                      className={`${iconSizes.sm} flex-shrink-0`}
                    />
                    <AnimatePresence>
                      {sidebarIsVisible && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`text-black ${textSizes.xs} ml-1.5 md:ml-1.5 lg:ml-1.5 xl:ml-2 overflow-hidden whitespace-nowrap`}
                        >
                          New Chat
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>

                {/* Scrollable content area */}
                <AnimatePresence>
                  {sidebarIsVisible && (
                    <motion.div
                      variants={contentVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      aria-live="polite"
                      aria-busy={isConversationListLoading}
                      className="flex-1 overflow-y-auto px-3 md:px-2 lg:px-2 xl:px-4 py-1.5 md:py-1.5 lg:py-1.5 xl:py-2 custom-scroll"
                    >
                      {isConversationListLoading ? (
                        <div className="mt-5 space-y-3">
                          <Shimmer count={10} />
                        </div>
                      ) : error ? (
                        <p className={`text-red-500 ${textSizes.xs}`}>
                          Failed to load conversations
                        </p>
                      ) : Object.keys(visibleGroupEntries).length === 0 ? (
                        <div>
                          {displayFeature !== "GENERAL" && (
                            <div className="flex justify-end items-center mt-4">
                              <button
                                onClick={handleShowAll}
                                className="text-[10px] md:text-[10px] lg:text-[10px] xl:text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-2 md:px-2 lg:px-2 xl:px-2.5 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer"
                                title="Show all conversations"
                              >
                                All
                              </button>
                            </div>
                          )}
                          <p
                            className={`text-gray-400 text-center font-xl ${textSizes.xs} mt-6 md:mt-6 lg:mt-6 xl:mt-8`}
                          >
                            No conversations yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 md:space-y-3 lg:space-y-3 xl:space-y-4">
                          {Object.entries(visibleGroupEntries).map(
                            ([dateGroup, conversations], groupIndex) => (
                              <motion.div
                                key={dateGroup}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: groupIndex * 0.05 }}
                                className="mb-3 md:mb-3 lg:mb-3 xl:mb-4"
                              >
                                <div className="flex justify-between items-center">
                                  <h3 className="text-sm md:text-sm lg:text-sm xl:text-md font-semibold uppercase tracking-wide mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2 mt-4 md:mt-4 lg:mt-4 xl:mt-5 text-black py-1 border-gray-700">
                                    {dateGroup}
                                  </h3>
                                  {groupIndex === 0 &&
                                    displayFeature !== "GENERAL" && (
                                      <button
                                        onClick={handleShowAll}
                                        className="text-[10px] md:text-[10px] lg:text-[10px] xl:text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-2 md:px-2 lg:px-2 xl:px-2.5 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer"
                                        title="Show all conversations"
                                      >
                                        All
                                      </button>
                                    )}
                                </div>

                                <ul className="space-y-0.5 md:space-y-0.5 lg:space-y-0.5 xl:space-y-1">
                                  {conversations.map((conversation) => {
                                    const isActive = loadingConversationId
                                      ? conversation.conversationId ===
                                        loadingConversationId
                                      : conversation.conversationId ===
                                        currentConversationId;
                                    const isHovered =
                                      hoveredConversationId ===
                                      conversation.conversationId;
                                    const isEditing =
                                      editingConversationId ===
                                      conversation.conversationId;
                                    const isMenuOpen =
                                      dropdownOpen ===
                                      conversation.conversationId;
                                    const isDeleting =
                                      deletingConversationId ===
                                      conversation.conversationId;

                                    return (
                                      <li
                                        key={conversation.conversationId}
                                        className={`px-2.5 md:px-2 lg:px-2 xl:px-3 py-1.5 md:py-1.5 lg:py-1.5 xl:py-2 rounded-lg cursor-pointer truncate text-sm md:text-sm lg:text-sm xl:text-md font-normal leading-4 md:leading-4 lg:leading-4 xl:leading-5 transition 
                                          ${
                                            isActive
                                              ? "bg-gray-300 text-black font-semibold"
                                              : isMenuOpen || isEditing
                                                ? "bg-gray-200 text-[#1D2026]"
                                                : "text-[#1D2026] hover:bg-gray-200"
                                          }`}
                                        title={conversation.title}
                                        onMouseEnter={() =>
                                          setHoveredConversationId(
                                            conversation.conversationId
                                          )
                                        }
                                        onMouseLeave={() =>
                                          setHoveredConversationId(null)
                                        }
                                        onClick={(
                                          e: React.MouseEvent<HTMLLIElement>
                                        ) => {
                                          e.stopPropagation();
                                          if (!isSidebarFrozen && !isDeleting) {
                                            handleConversationClick(
                                              conversation.conversationId,
                                              conversation.feature
                                            );
                                          }
                                        }}
                                      >
                                        {isDeleting ? (
                                          <div className="flex items-center justify-between opacity-50">
                                            <Shimmer count={1} />
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            {isEditing ? (
                                              <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) =>
                                                  setEditingTitle(
                                                    e.target.value
                                                  )
                                                }
                                                onKeyDown={handleEditKeyDown}
                                                onBlur={handleSaveRename}
                                                className="w-full text-black text-xs md:text-xs lg:text-xs xl:text-sm outline-none bg-transparent"
                                                autoFocus
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                disabled={
                                                  isUpdatingConversation
                                                }
                                              />
                                            ) : (
                                              <span
                                                className={`truncate ${textSizes.xs}`}
                                              >
                                                {conversation.title}
                                              </span>
                                            )}

                                            <AnimatePresence>
                                              {(isHovered || isMenuOpen) &&
                                              !isEditing ? (
                                                <motion.button
                                                  initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                  }}
                                                  animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                  }}
                                                  exit={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                  }}
                                                  data-conversation-id={
                                                    conversation.conversationId
                                                  }
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleDropdown(
                                                      e,
                                                      conversation.conversationId
                                                    );
                                                  }}
                                                  title="Edit"
                                                  className="rounded-full cursor-pointer flex-shrink-0"
                                                >
                                                  <Ellipsis
                                                    size={18}
                                                    className={`${iconSizes.md} text-gray-600`}
                                                  />
                                                </motion.button>
                                              ) : (
                                                !isEditing &&
                                                conversation.feature && (
                                                  <span className="text-[10px] md:text-[10px] lg:text-[10px] xl:text-xs bg-gray-200 text-gray-600 px-1.5 md:px-1.5 lg:px-1.5 xl:px-2 py-0.5 rounded-full ml-1.5 md:ml-1.5 lg:ml-1.5 xl:ml-2 flex-shrink-0">
                                                    {conversation.feature
                                                      ?.split(" ")
                                                      .map(
                                                        (word) =>
                                                          word
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                          word
                                                            .slice(1)
                                                            .toLowerCase()
                                                      )
                                                      .join("")}
                                                  </span>
                                                )
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </motion.div>
                            )
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* See More button */}
                <AnimatePresence>
                  {sidebarIsVisible &&
                    hasMore &&
                    !isConversationListLoading &&
                    !error && (
                      <motion.div
                        variants={contentVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="p-3 md:p-2 lg:p-2 xl:p-4 flex-shrink-0 border-t border-gray-700 bg-gray-800 sticky bottom-0 z-20"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full border border-gray-600 text-gray-100 rounded-md p-1.5 md:p-1.5 lg:p-1.5 xl:p-2 hover:bg-gray-700 hover:border-gray-500 hover:text-white flex items-center justify-center transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeeMore();
                          }}
                          disabled={isSidebarFrozen}
                        >
                          <ChevronDown
                            size={14}
                            className={`${iconSizes.sm} mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2`}
                          />
                          <span className={textSizes.xs}>
                            See More (
                            {flattenedConversations.length - visibleCount}{" "}
                            remaining)
                          </span>
                        </Button>
                      </motion.div>
                    )}
                </AnimatePresence>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {dropdownOpen && dropdownPosition && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[110px] md:min-w-[100px] lg:min-w-[100px] xl:min-w-[120px] overflow-hidden"
                      style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const conv = conversations.find(
                                (c) => c.conversationId === dropdownOpen
                              );
                              if (conv) {
                                handleStartRename(
                                  conv.conversationId,
                                  conv.title
                                );
                              }
                            }}
                            className="w-full text-left px-3 md:px-3 lg:px-3 xl:px-4 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 cursor-pointer"
                          >
                            <Pencil size={14} className={iconSizes.sm} />
                            Rename
                          </button>
                        </li>
                        <li className="mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(dropdownOpen);
                            }}
                            className="w-full text-left px-3 md:px-3 lg:px-3 xl:px-4 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-1.5 md:gap-1.5 lg:gap-1.5 xl:gap-2 cursor-pointer"
                            disabled={isDeletingConversation}
                          >
                            <Trash size={14} className={iconSizes.sm} />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        }}
      </SidebarSearchParamsHandler>
    </Suspense>
  );
});

SidebarContent.displayName = "SidebarContent";

const Sidebar = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <Suspense
      fallback={
        <div className="w-60 md:w-60 lg:w-60 xl:w-70 bg-[#F5F7FA] h-full animate-pulse" />
      }
    >
      <SidebarContent ref={ref} />
    </Suspense>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
