/* eslint-disable @typescript-eslint/naming-convention */
"use client";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Suspense } from "react";
import { AccessDenied } from "@/components/access-denied/AccessDenied";
import ChatInputBox from "@/components/home/ChatInputBox";
import ProgressBar from "@/components/progress-bar/ProgressBar";
import { Welcome } from "@/components/welcome/Welcome";
import { HAS_SKIPPED_WELCOME_KEY } from "@/constants/constants";
import { ROUTES } from "@/constants/routes";
import { useConversationFeature } from "@/hooks/fetchConversations";
import { useUserModelPriorities } from "@/hooks/fetchPriorityModels";
import { useFetchUserProviderConfigs } from "@/hooks/fetchUserProviderConfigs";
import { useUserId } from "@/lib/getUserId";
import { useSidebarStore } from "@/stores/sideBarStore";
import { useChatStore } from "@/stores/useChatStore";
import { ChatPageProps } from "@/types/home";
import localStorageUtils from "@/utils/localStorageUtils";
import logger from "@/utils/logger/browserLogger";

const EnhancedChatScreen = dynamic(
  () =>
    import("@/components/home/MarkdownRenderer").then(
      (mod) => mod.EnhancedChatScreen
    ),
  { ssr: false }
);

const useChatLogic = () => {
  const userId = useUserId();
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");
  const queryClient = useQueryClient();
  const { data: userModelPriorities, isLoading: isLoadingPriorities } =
    useUserModelPriorities(userId ?? undefined);
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    messages,
    input,
    activeFeature,
    conversationId,
    conversationCreated,
    isLoading,
    isCreatingMessage,
    isGenerating,
    isLoadingMore,
    hasMoreMessages,
    setInput,
    setActiveFeature,
    setConversationId,
    setConversationCreated,
    setUserModelPriorities,
    setUserId,
    getActiveModelId,
    loadMoreMessages,
    setupSubscriptions,
    sendMessage,
    createConversationMessage,
    isStreaming,
    fetchMessages,
    handleChunk,
    resetChat,
  } = useChatStore();

  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId, setUserId]);

  const fetchedFeature = useConversationFeature(urlConversationId);

  useEffect(() => {
    if (fetchedFeature.isError && fetchedFeature.error) {
      const err = fetchedFeature.error as unknown;
      logger.error("fetchedFeature error detected:", err);

      const isAuthError = (
        e: unknown
      ): e is { isUnauthorized?: boolean; message?: string } =>
        typeof e === "object" && e !== null && "isUnauthorized" in e;

      if (isAuthError(err) && err.isUnauthorized) {
        setAuthError(err.message || "Unauthorized access");
        logger.error("Authorization error:", err.message);
      } else if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof err.message === "string" &&
        err.message.includes("Conversation not found")
      ) {
        logger.info("Conversation not found, redirecting to new chat");
        router.push(ROUTES.CHAT);
      }
    }
  }, [
    fetchedFeature.isError,
    fetchedFeature.error,
    fetchedFeature.status,
    router,
  ]);

  useEffect(() => {
    const historyChatFeature = fetchedFeature?.data;
    const { setHistoryChatFeature } = useChatStore.getState();
    if (typeof historyChatFeature === "string") {
      setHistoryChatFeature(historyChatFeature);
      setActiveFeature(historyChatFeature);
    } else {
      setHistoryChatFeature(null);
    }
  }, [fetchedFeature?.data]);

  useEffect(() => {
    if (userModelPriorities && userModelPriorities.length > 0) {
      setUserModelPriorities(userModelPriorities);
    }
  }, [userModelPriorities, setUserModelPriorities, getActiveModelId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!urlConversationId) {
        resetChat();
        setAuthError(null);
        return;
      }

      // Skip if this conversation is already loaded
      if (conversationId === urlConversationId && conversationCreated) {
        logger.info("⏸️ Conversation already loaded - skipping");
        return;
      }

      // Clean up previous conversation if switching conversations
      if (conversationId && conversationId !== urlConversationId) {
        logger.info("🔄 Switching conversations - cleaning up");
        //resetChat();
        setAuthError(null);
      }

      try {
        logger.info("🔄 Loading conversation:", urlConversationId);

        setConversationId(urlConversationId);

        await fetchMessages(false, urlConversationId);

        setConversationCreated(true);
        setupSubscriptions(urlConversationId);
      } catch (error) {
        logger.error("❌ Failed to load conversation:", error);

        setConversationCreated(false);
        setConversationId(null);
      }
    };

    loadMessages();
  }, [urlConversationId]); // Only depend on URL conversation ID

  const createNewConversation = useCallback(
    async (firstMessage: string, attachments: string[] = []) => {
      if (conversationCreated) return true;

      try {
        // Set generating state first to show loader
        const { setIsGenerating } = useChatStore.getState();
        setIsGenerating(true);

        // Add user message to UI immediately (synchronously)
        const { messages, setMessages } = useChatStore.getState();
        const tempMessageId = `temp-user-${Date.now()}`;

        const newUserMessage = {
          id: tempMessageId,
          content: firstMessage,
          fullContent: firstMessage,
          displayContent: firstMessage,
          isUser: true,
          isTyping: false,
          timestamp: dayjs().valueOf(),
          isRestored: false,
          createdAt: dayjs().toISOString(),
          modelId: getActiveModelId(),
          feature: activeFeature,
          attachments,
        };

        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);

        const { convoId, isSuccess } = await createConversationMessage(
          firstMessage,
          true,
          false,
          attachments
        );

        if (isSuccess && convoId) {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });

          setConversationId(convoId);
          setConversationCreated(true);
          setupSubscriptions(convoId);
          const url = new URL(window.location.href);
          url.searchParams.set("conversationId", convoId);
          url.searchParams.delete("showWelcome");
          router.replace(`${ROUTES.CHAT}?conversationId=${convoId}`);

          return true;
        } else {
          // If conversation creation failed, remove the optimistic message and reset state
          const { removeMessageById, setIsGenerating: resetIsGenerating } =
            useChatStore.getState();
          removeMessageById(tempMessageId);
          resetIsGenerating(false);
        }

        return false;
      } catch (error) {
        logger.error("Failed to create conversation:", error);
        // Clean up optimistic message on error
        const { removeMessageById, setIsGenerating: resetIsGenerating } =
          useChatStore.getState();
        removeMessageById(`temp-user-${Date.now()}`);
        resetIsGenerating(false);
        return false;
      }
    },
    [
      conversationCreated,
      activeFeature,
      userId,
      createConversationMessage,
      setConversationId,
      setConversationCreated,
      handleChunk,
      setupSubscriptions,
      getActiveModelId,
    ]
  );

  const handleSubmit = async (
    e: React.FormEvent,
    attachments: string[] = []
  ) => {
    e.preventDefault();

    if (!input.trim() || isCreatingMessage) {
      return;
    }

    if (isLoadingPriorities) {
      logger.info("Waiting for model priorities to load...");
      return;
    }

    const messageContent = input.trim();
    setInput("");

    if (!conversationCreated) {
      try {
        const success = await createNewConversation(
          messageContent,
          attachments
        );
        if (!success) {
          setInput(messageContent);
          return;
        }
      } catch (error) {
        logger.error("Error in new conversation flow:", error);
        setInput(messageContent);
      }
      return;
    }
    const success = await sendMessage(messageContent, attachments);
    if (success) {
      // Invalidate conversations query to refresh sidebar and move conversation to top
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } else {
      setInput(messageContent);
    }
  };

  const handleFeatureChange = (feature: string) => {
    setActiveFeature(feature);
  };

  const handleLoadMore = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMore) return;
    try {
      await loadMoreMessages();
    } catch (error) {
      logger.error("❌ Failed to load more messages:", error);
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  const handleGoBackHome = useCallback(() => {
    setAuthError(null);
    resetChat();
    router.push(ROUTES.CHAT);
  }, [router, resetChat]);

  return {
    messages,
    input,
    activeFeature,
    isLoading: isLoading || isLoadingPriorities,
    isCreatingMessage,
    isGenerating,
    isLoadingMore,
    hasMoreMessages,
    conversationId,
    authError,
    setInput,
    handleSubmit,
    handleFeatureChange,
    handleLoadMore,
    handleGoBackHome,
    isStreaming,
  };
};

function ChatPageContent() {
  const {
    messages,
    input,
    activeFeature,
    isLoading,
    isGenerating,
    isLoadingMore,
    hasMoreMessages,
    conversationId,
    authError,
    setInput,
    handleSubmit,
    handleFeatureChange,
    handleLoadMore,
    handleGoBackHome,
    isStreaming,
  } = useChatLogic();

  // if (isUserLoading || !userData) {
  //   return <LoadingFallback />;
  // }

  if (authError) {
    return (
      <div className="h-full flex flex-col bg-white">
        <AccessDenied onGoBack={handleGoBackHome} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <ChatPageWithSearchParams
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        activeFeature={activeFeature}
        onFeatureChange={handleFeatureChange}
        isCreatingConversation={isStreaming}
        isLoading={isLoading}
        isGenerating={isGenerating}
        isLoadingMore={isLoadingMore}
        hasMoreMessages={hasMoreMessages}
        onLoadMore={handleLoadMore}
        conversationId={conversationId ?? undefined}
      />
    </div>
  );
}

const ChatPageWithSearchParams = ({
  messages,
  input,
  setInput,
  handleSubmit,
  activeFeature,
  onFeatureChange,
  isCreatingConversation,
  isLoading,
  isGenerating,
  isLoadingMore,
  hasMoreMessages,
  onLoadMore,
}: ChatPageProps & {
  isLoading?: boolean;
  isGenerating?: boolean;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  conversationId?: string;
}) => {
  const userId = useUserId();
  const { data: userModelPriorities, isLoading: isPrioritiesLoading } =
    useUserModelPriorities(userId ?? undefined);
  const { setIsModelAndPrioritySet } = useSidebarStore();
  const { mutateAsync: fetchProviderConfigs, isPending } = useFetchUserProviderConfigs();
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const [welcomeReason, setWelcomeReason] = useState<
    "missing-keys" | "missing-models" | null
  >(null);
  useEffect(() => {
    async function validate() {
      if (!userId) {
        setIsValidating(false);
        return;
      }

      if (isPrioritiesLoading && !userModelPriorities) {
        return;
      }

      try {
        setIsValidating(true);
        useChatStore.getState().setIsValidating(true);

        const response = await fetchProviderConfigs({ userId });
        const hasAtLeastOneKey = response?.data?.length >= 1;

        // ✅ Check only for the currently active feature
        const featureData = userModelPriorities?.find(
          (item) => item.feature === activeFeature
        );

        let hasPriorityModelsForActiveFeature = false;
        if (featureData && featureData.models?.length > 0) {
          try {
            const parsedModels = JSON.parse(featureData.models[0]);
            hasPriorityModelsForActiveFeature =
              parsedModels && parsedModels.length > 0;
          } catch {
            hasPriorityModelsForActiveFeature = false;
          }
        }

        const isSetupComplete =
          hasAtLeastOneKey && hasPriorityModelsForActiveFeature;
        setIsModelAndPrioritySet(isSetupComplete);

          if (!hasAtLeastOneKey) {
              setWelcomeReason("missing-keys");
          } else if (!hasPriorityModelsForActiveFeature) {
              setWelcomeReason("missing-models");
          } else {
              setWelcomeReason(null);
          }
      } finally {
        setIsValidating(false);
        useChatStore.getState().setIsValidating(false);
      }
    }

    validate();
  }, [
    userId,
    userModelPriorities,
    fetchProviderConfigs,
    activeFeature,
    isPrioritiesLoading,
  ]);

  const onCompleteSetup = () => {
    setIsSetupLoading(true);
    if (welcomeReason === "missing-keys") {
      router.push(`${ROUTES.SETTINGS}?section=api-keys`);
    } else if (welcomeReason === "missing-models") {
      router.push(`${ROUTES.SETTINGS}?section=priority-models`);
    }
  };

  // Show blank screen with subtle progress indication while validating
  if (isValidating || isPending || (!!isLoading)) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <ProgressBar isLoading={true} />
        <div className="flex-1" />
      </div>
    );
  }
  return (
    <>
        <div className="flex-1 flex flex-col overflow-hidden">
            {welcomeReason === "missing-models" || welcomeReason === "missing-keys" && (
                <Welcome
                    reason={welcomeReason}
                    onCompleteSetup={onCompleteSetup}
                    isSetupLoading={isSetupLoading}
                />
            )}
            {!welcomeReason && (
                <div className="flex-1 overflow-hidden">
                    <EnhancedChatScreen
                        messages={messages}
                        isLoading={isLoading}
                        isGenerating={isGenerating}
                        isLoadingMore={isLoadingMore}
                        hasMoreMessages={hasMoreMessages}
                        onLoadMore={onLoadMore}
                        activeFeature={activeFeature}
                    />
                </div>
            )}
        </div>

      {!welcomeReason && (
        <div className={`transition-all duration-300 `}>
          <ChatInputBox
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            activeFeature={activeFeature}
            onFeatureChange={onFeatureChange}
            disabled={isCreatingConversation}
            isGenerating={isCreatingConversation}
          />
        </div>
      )}
    </>
  );
};
const SuspenseFallback = () => {
  return <div className="h-full w-full bg-white" />;
};
function HomePageContent() {
  const router = useRouter();
  const userId = useUserId();
  const searchParams = useSearchParams();
  const { mutateAsync: fetchProviderConfigs, isPending } = useFetchUserProviderConfigs();
  const pathname = usePathname();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const { data: userModelPriorities, isLoading: isPriorityLoading } =
    useUserModelPriorities(userId ?? undefined);

  useEffect(() => {
    if (isPriorityLoading) {
      useChatStore.getState().setIsValidating(true);
    }
  }, [isPriorityLoading]);

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!userId || isPriorityLoading) return;

      try {
        useChatStore.getState().setIsValidating(true);

        const response = await fetchProviderConfigs({ userId });
        const hasAtLeastTwoKeys = response?.data?.length >= 1;
        const hasPriorityModels =
          userModelPriorities && userModelPriorities.length > 0;

        if (hasAtLeastTwoKeys && hasPriorityModels) {
          localStorageUtils.removeItem(HAS_SKIPPED_WELCOME_KEY);
        } else {
          localStorageUtils.setItem<boolean>(HAS_SKIPPED_WELCOME_KEY, true);
        }
      } catch (error) {
        logger.error("❌ Failed to fetch provider configs", error);
      } finally {
        setIsCheckingAccess(false);
        useChatStore.getState().setIsValidating(false);
      }
    };

    checkUserAccess();
  }, [
    userId,
    fetchProviderConfigs,
    router,
    pathname,
    searchParams,
    userModelPriorities,
    isPriorityLoading,
  ]);
  if (isCheckingAccess || isPending || isPriorityLoading) {
    return <SuspenseFallback />;
  }
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ChatPageContent />
    </Suspense>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
