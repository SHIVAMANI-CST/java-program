/* eslint-disable @typescript-eslint/naming-convention */
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ComparisonChatRenderer from "./ComparisonChatRenderer";
import FeatureIntro from "./FeatureIntro";
import { AIResponseLoader } from "../feature-loaders/FeatureLoaders";
import CopyButton from "../global-components/chat-action-buttons/CopyButton";
import DislikeButton from "../global-components/chat-action-buttons/DislikeButton";
import LikeButton from "../global-components/chat-action-buttons/LikeButton";
import RetryButton from "../global-components/chat-action-buttons/RetryButton";
import { featureIntroContent, gradientTextClass } from "@/constants/constants";
import { useUpdateMessage } from "@/hooks/useUpdateMessage";
import Exlude from "@/public/CinfyAIMain.svg";
import { TypewriterMessage, useChatStore } from "@/stores/useChatStore";
import {
  ChatMessageProps,
  EnhancedChatScreenProps,
  MarkdownRendererProps,
  MessageActionsProps,
} from "@/types/home";
import AttachmentDisplay from "@/utils/AttachmentDisplay";
import { buildPaginatedMessageState } from "@/utils/chatPagination";
import { COLORS } from "@/utils/colors";
import logger from "@/utils/logger/browserLogger";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// Lazy load MDEditor to reduce initial bundle size
const MDEditorMarkdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <div
      className="prose prose-sm max-w-none break-words [&>div]:!bg-transparent 
        [&_*]:!text-[0.75rem] md:[&_*]:!text-[0.75rem] lg:[&_*]:!text-[0.75rem] xl:[&_*]:!text-[0.875rem] 
        [&_pre]:!max-w-full [&_pre]:!overflow-x-auto [&_pre]:!whitespace-pre-wrap [&_pre]:!break-all
        [&_code]:!break-all [&_code]:!whitespace-pre-wrap
        [&_p]:!break-words [&_p]:!overflow-wrap-anywhere
        [&_li]:!break-words [&_li]:!overflow-wrap-anywhere"
      style={{ overflowWrap: "anywhere" }}
      data-color-mode="light"
    >
      <MDEditorMarkdown
        source={content}
        components={{
          a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      />
    </div>
  );
};

const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  messageId,
  conversationId,
  timestamp,
  isLastMessage = false,
  pagination,
  initialIsLiked = null,
  initialIsDisliked = null,
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(initialIsLiked ?? false);
  const [disliked, setDisliked] = useState(initialIsDisliked ?? false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { isGenerating, messages, retryMessage } = useChatStore();
  const { updateMessageReaction, isLoading } = useUpdateMessage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy text: ", err);
    }
  };

  const handleLike = async () => {
    if (isLoading) return;

    const newLikedState = !liked;
    setLiked(newLikedState);
    if (newLikedState) {
      setDisliked(false);
    }

    try {
      await updateMessageReaction({
        messageId,
        conversationId,
        timestamp,
        isLiked: newLikedState,
        isDisliked: false,
      });
      logger.info(`Message like status updated to: ${newLikedState}`);
    } catch (err) {
      logger.error("Error in handleLike:", err);
      setLiked(!newLikedState);
    }
  };

  const handleDislike = async () => {
    if (isLoading) return;

    const newDislikedState = !disliked;
    setDisliked(newDislikedState);
    if (newDislikedState) {
      setLiked(false);
    }

    try {
      await updateMessageReaction({
        messageId,
        conversationId,
        timestamp,
        isDisliked: newDislikedState,
        isLiked: false,
      });
      logger.info(`Message dislike status updated to: ${newDislikedState}`);
    } catch (err) {
      logger.error("Error in handleDislike:", err);
      setDisliked(!newDislikedState);
    }
  };

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);

    const userMessages = messages.filter(
      (msg: TypewriterMessage) => msg.isUser
    );
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (!lastUserMessage) {
      logger.error("No user message found to retry");
      setIsRetrying(false);
      return;
    }

    logger.info("Retrying message", {
      messageId,
      userMessage: lastUserMessage.content,
    });

    try {
      const success = await retryMessage(lastUserMessage.content, lastUserMessage.attachments);
      if (success) {
        logger.info("Message retry initiated successfully");
      } else {
        logger.error("Failed to retry message");
      }
    } catch (error) {
      logger.error("Error during message retry:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const shouldShowRetrySpinner = isRetrying || (isGenerating && isLastMessage);
  const shouldDisableRetry = isRetrying || isGenerating;

  return (
    <div className="mt-1 ml-8 md:ml-10 lg:ml-10 xl:ml-12 flex space-x-1.5 md:space-x-1.5 lg:space-x-1.5 xl:space-x-2">
      <div className="flex items-center space-x-1.5 md:space-x-1.5 lg:space-x-1.5 xl:space-x-2 bg-white backdrop-blur-sm px-1.5 md:px-1.5 lg:px-1.5 xl:px-2 py-0.5 md:py-1">
        <CopyButton copied={copied} handleCopy={handleCopy} />
        <LikeButton handleLike={handleLike} isLiked={liked} />
        <DislikeButton handleDislike={handleDislike} isDisliked={disliked} />
        {isLastMessage && (
          <RetryButton
            handleRetry={handleRetry}
            disabled={shouldDisableRetry}
            isLoading={shouldShowRetrySpinner}
          />
        )}
        {pagination && (
          <div className="flex items-center gap-0.5 text-gray-600">
            <button
              type="button"
              onClick={pagination.onPrev}
              disabled={pagination.disablePrev}
              className="p-1 rounded-md transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
              aria-label="View previous response"
            >
              <ChevronLeft size={15} strokeWidth={1.5} />
            </button>
            <span className="text-[0.7rem] text-gray-500 whitespace-nowrap">
              {pagination.current} / {pagination.total}
            </span>
            <button
              type="button"
              onClick={pagination.onNext}
              disabled={pagination.disableNext}
              className="p-1 rounded-md transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
              aria-label="View next response"
            >
              <ChevronRight size={15} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// Enhanced ChatMessage component with proper streaming support
export const ChatMessage: React.FC<ChatMessageProps & { isLast?: boolean }> = ({
  message,
  isLast = false,
  showAnimation = false,
  paginationControls,
}) => {
  const finalContent: string = message.fullContent;
  const isLastAIMessage = isLast && !message.isUser;

  return (
    <div
      className={`flex justify-${message.isUser ? "end" : "start"} mb-2.5 md:mb-3 lg:mb-3 xl:mb-4`}
    >
      <div
        className={`min-w-0 ${
          message.isUser
            ? "w-[70vw] md:w-[60vw] lg:w-[50vw] xl:w-[50vw] mx-2 md:mx-20 lg:mx-20 xl:mx-25"
            : "mx-auto w-full max-w-full md:max-w-[800px] lg:max-w-[800px] xl:max-w-[960px]"
          } ${!message.isUser ? "group " : ""}`}
      >
        <div
          className={`px-1.5 md:px-3 lg:px-3 xl:px-4 py-1 md:py-2.5 lg:py-2.5 xl:py-3 rounded-lg md:rounded-xl overflow-hidden ${
            message.isUser ? "bg-[#E9EAF0] text-black" : "bg-white text-black"
            }`}
        >
          {message.isUser ? (
            <div className="text-[0.75rem] md:text-[0.75rem] lg:text-[0.75rem] xl:text-[0.875rem] whitespace-pre-wrap break-words word-break py-1">
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-2">
                  {message.attachments.map((key, i) => (
                    <AttachmentDisplay key={i} itemKey={key} />
                  ))}
                </div>
              )}
              {finalContent}
            </div>
          ) : (
            <div className="flex items-start min-w-0">
              <Image
                src={Exlude}
                alt="Cinfy Logo"
                width={24}
                height={24}
                className="mr-2 md:mr-2 lg:mr-2 xl:mr-3 ml-1 md:ml-1.5 lg:ml-1.5 xl:ml-2 rounded-full w-[24px] h-[24px] md:w-[26px] md:h-[26px] lg:w-[26px] lg:h-[26px] xl:w-[30px] xl:h-[30px] flex-shrink-0"
              />
              <div className="flex-1 min-w-0 overflow-hidden">
                <MarkdownRenderer content={finalContent || ""} />
                {showAnimation && (
                  <span className="inline-block w-1.5 h-3.5 md:w-2 md:h-4 bg-gray-400 animate-pulse ml-1"></span>
                )}
              </div>
            </div>
          )}
        </div>

        {!message.isUser && finalContent?.trim() && !showAnimation && (
          <MessageActions
            content={finalContent}
            messageId={message.id}
            conversationId={message.conversationId!}
            timestamp={message.timestamp}
            isLastMessage={isLastAIMessage}
            pagination={paginationControls}
            initialIsLiked={message.isLiked}
            initialIsDisliked={message.isDisliked}
          />
        )}
      </div>
    </div>
  );
};

// Error Display Component
const ChatErrorDisplay: React.FC<{
  error: string;
  onDismiss: () => void;
}> = ({ error, onDismiss }) => {
  return (
    <div className="px-4 py-2">
      <div className="max-w-full md:max-w-5xl lg:max-w-5xl xl:max-w-6xl w-full mx-auto p-3 text-sm text-red-800 border border-red-400 rounded-lg bg-red-50 flex items-center justify-between">
        <span
          className={`${COLORS.errorText} text-xs md:text-xs lg:text-xs xl:text-sm mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1`}
        >
          {error}
        </span>
        <button
          onClick={onDismiss}
          className="ml-4 text-red-800 font-bold hover:text-red-900"
          aria-label="Dismiss error"
        >
          <X className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
        </button>
      </div>
    </div>
  );
};

const customFeatureIntros = Object.keys(featureIntroContent);

export const EnhancedChatScreen: React.FC<EnhancedChatScreenProps> = ({
  messages,
  isGenerating = false,
  isLoadingMore = false,
  hasMoreMessages = true,
  onLoadMore,
  activeFeature,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const previousScrollHeightRef = useRef<number>(0);
  const isLoadingRef = useRef(false);

  const isStreaming = useChatStore((state) => state.isStreaming);
  const error = useChatStore((state) => state.error);
  const setError = useChatStore((state) => state.setError);
  const aiResponsePageMap = useChatStore((state) => state.aiResponsePageMap);
  const setAiResponsePage = useChatStore((state) => state.setAiResponsePage);

  const prevIsStreaming = usePrevious(isStreaming);
  const prevMessagesLength = usePrevious(messages.length);

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !onLoadMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;

    const isAtTop = scrollTop < 100;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    setShouldAutoScroll(isNearBottom);

    // Auto-load when scrolled to top and have messages
    if (isAtTop && hasMoreMessages && !isLoadingMore && !isLoadingRef.current) {
      logger.info("📜 Auto-loading more messages (scrolled to top)");
      isLoadingRef.current = true;
      previousScrollHeightRef.current = scrollHeight;
      onLoadMore();
    }
  }, [onLoadMore, hasMoreMessages, isLoadingMore, messages.length]);

  // Reset loading ref when load completes
  useEffect(() => {
    if (!isLoadingMore) {
      isLoadingRef.current = false;
    }
  }, [isLoadingMore]);

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (!isLoadingMore && previousScrollHeightRef.current > 0) {
      const container = messagesContainerRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        const heightDifference =
          newScrollHeight - previousScrollHeightRef.current;

        if (heightDifference > 0) {
          container.scrollTop = heightDifference;
          logger.info(`📍 Adjusted scroll position by ${heightDifference}px`);
        }

        previousScrollHeightRef.current = 0;
      }
    }
  }, [isLoadingMore, messages.length]);

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Handle feature changes
  useEffect(() => {
    setShouldAutoScroll(true);
    scrollToBottom("auto");
  }, [activeFeature]);

  // Auto-scroll logic
  useEffect(() => {
    if (!shouldAutoScroll || isLoadingMore) {
      return;
    }

    const hasNewMessage = messages.length > (prevMessagesLength ?? 0);

    // Scenario 1: Actively streaming
    if (isStreaming) {
      scrollToBottom("auto");
      return;
    }

    if (shouldShowLoader) {
      scrollToBottom("smooth");
      return;
    }

    // Scenario 2: Stream just finished
    if (prevIsStreaming && !isStreaming) {
      const timer = setTimeout(() => scrollToBottom("smooth"), 150);
      return () => clearTimeout(timer);
    }

    // Scenario 3: New message added
    if (hasNewMessage && !isStreaming) {
      scrollToBottom("smooth");
    }
  }, [
    messages,
    isStreaming,
    prevIsStreaming,
    prevMessagesLength,
    shouldAutoScroll,
    isLoadingMore,
  ]);

  const { visibleMessageIds, paginationByMessageId } = useMemo(
    () =>
      buildPaginatedMessageState(
        messages,
        aiResponsePageMap,
        setAiResponsePage
      ),
    [messages, aiResponsePageMap, setAiResponsePage]
  );
  const validMessages = messages;
  const shouldShowLoader =
    isGenerating &&
    !isStreaming &&
    (validMessages.length === 0 ||
      (validMessages.length > 0 &&
        validMessages[validMessages.length - 1]?.isUser));

  const displayedMessages = useMemo(
    () => messages.filter((msg) => msg.isUser || visibleMessageIds.has(msg.id)),
    [messages, visibleMessageIds]
  );

  // if (isLoading) {
  //   return <LoadingFallback text="Loading messages..." />;
  // }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {error && (
        <ChatErrorDisplay error={error} onDismiss={() => setError(null)} />
      )}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 md:px-4 py-2 md:py-3"
        style={{ maxHeight: "100%" }}
      >
        {validMessages.length > 0 && isLoadingMore && (
          <div className="flex justify-center py-2.5 md:py-3 lg:py-3 xl:py-4 mb-2.5 md:mb-3 lg:mb-3 xl:mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 md:h-3.5 lg:h-3.5 xl:h-4 w-3 md:w-3.5 lg:w-3.5 xl:w-4 border-b-2 border-blue-600"></div>
              <span className="text-[0.6875rem] md:text-xs lg:text-xs xl:text-sm text-gray-500">
                Loading previous messages...
              </span>
            </div>
          </div>
        )}
        <div
          className={`max-w-full md:max-w-5xl lg:max-w-5xl xl:max-w-6xl w-full mx-auto ${validMessages.length === 0 && !shouldShowLoader ? "h-full" : ""}`}
        >
          {validMessages.length === 0 && !shouldShowLoader ? (
            <div className="h-full flex flex-col items-center justify-start text-center space-y-3 md:space-y-6 lg:space-y-6 xl:space-y-8 px-2 md:px-4 pt-12 md:pt-20 lg:pt-24 xl:pt-32">
              {/* Logo */}
              <div className="relative w-12 h-8 md:w-16 md:h-10 lg:w-16 lg:h-10 xl:w-20 xl:h-12">
                <Image
                  src={Exlude}
                  alt="Cinfy Logo"
                  width={96}
                  height={64}
                  priority
                  className="drop-shadow-2xl w-full h-full object-contain"
                  decoding="sync"
                />
              </div>
              {customFeatureIntros.includes(activeFeature) ? (
                <FeatureIntro feature={activeFeature} />
              ) : (
                <>
                  {/* Title and Description */}
                  <div className="px-2 md:px-2 lg:px-2 xl:px-2 max-w-full">
                    <h1 className="text-[0.875rem] md:text-xl lg:text-xl xl:text-2xl font-semibold text-gray-900 leading-tight">
                      Compare, Optimize, and Summarize GPT Outputs
                    </h1>
                    <p className="text-[0.6875rem] md:text-xs lg:text-xs xl:text-sm text-gray-500 mt-1 md:mt-2 lg:mt-2 xl:mt-2 leading-snug">
                      Seamlessly test, refine, and analyze GPT model responses
                      in one place
                    </p>
                  </div>

                  {/* Feature Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 lg:gap-3 xl:gap-3 mt-2 md:mt-4 lg:mt-4 xl:mt-4 w-full max-w-full md:max-w-3xl lg:max-w-3xl xl:max-w-3xl px-2 md:px-3 lg:px-3 xl:px-3">
                    {/* Comparison Card */}
                    <div className="bg-[#FAFAFB] rounded-lg p-2.5 md:p-3 lg:p-3 xl:p-4 text-left shadow-sm">
                      <h2 className="font-semibold text-[0.75rem] md:text-sm lg:text-sm xl:text-base mb-0.5 md:mb-1 lg:mb-1 xl:mb-1">
                        <span className={`${gradientTextClass}`}>Compare</span>
                      </h2>
                      <p className="text-[0.6875rem] md:text-xs lg:text-xs xl:text-sm text-gray-600 leading-snug">
                        Easily run side-by-side comparisons across different GPT
                        models or prompts
                      </p>
                    </div>

                    {/* Optimization Card */}
                    <div className="bg-[#FAFAFB] rounded-lg p-2.5 md:p-3 lg:p-3 xl:p-4 text-left shadow-sm">
                      <h2 className="font-semibold text-[0.75rem] md:text-sm lg:text-sm xl:text-base mb-0.5 md:mb-1 lg:mb-1 xl:mb-1">
                        <span className={`${gradientTextClass}`}>Optimize</span>
                      </h2>
                      <p className="text-[0.6875rem] md:text-xs lg:text-xs xl:text-sm text-gray-600 leading-snug">
                        Experiment with different prompts to find the most
                        effective version
                      </p>
                    </div>

                    {/* Summarization Card */}
                    <div className="bg-[#FAFAFB] rounded-lg p-2.5 md:p-3 lg:p-3 xl:p-4 text-left shadow-sm">
                      <h2 className="font-semibold text-[0.75rem] md:text-sm lg:text-sm xl:text-base mb-0.5 md:mb-1 lg:mb-1 xl:mb-1">
                        <span className={`${gradientTextClass}`}>
                          Summarize
                        </span>
                      </h2>
                      <p className="text-[0.6875rem] md:text-xs lg:text-xs xl:text-sm text-gray-600 leading-snug">
                        Instantly generate clear and concise summaries from long
                        AI responses
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeFeature === "COMPARISON" ? (
            <>
              <ComparisonChatRenderer messages={messages} />
              {isGenerating && <AIResponseLoader show={shouldShowLoader} />}
            </>
          ) : (
            <>
              {displayedMessages.map((message, index, arr) => {
                const paginationControls = paginationByMessageId[message.id];
                const isLast = index === arr.length - 1;

                return (
                  <ChatMessage
                    key={`${message.id}-${index}`}
                    message={message}
                    isLast={isLast}
                    showAnimation={isLast && isStreaming}
                    paginationControls={paginationControls}
                  />
                );
              })}

              {isGenerating && <AIResponseLoader show={shouldShowLoader} />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
