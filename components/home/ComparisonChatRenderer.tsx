import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useProviderModels } from "@/hooks/gptModels";
import expandIcon from "@/public/expand-icon.svg";
import { TypewriterMessage, useChatStore } from "@/stores/useChatStore";
import AttachmentDisplay from "@/utils/AttachmentDisplay";
import { getModelDisplayName } from "@/utils/modelUtils";


type ComparisonChatRendererProps = {
  messages: TypewriterMessage[]; // or whatever your message type is
};
const ComparisonChatRenderer: React.FC<ComparisonChatRendererProps> = ({
  messages,
}) => {
  const [expandedInfo, setExpandedInfo] = useState<{
    groupIndex: number;
    responseIndex: number;
  } | null>(null);

  const toggleExpand = (groupIndex: number, responseIndex: number) => {
    //It toggles the expanded card: if the clicked card is already expanded, it collapses it. otherwise, it expands that card.
    setExpandedInfo((prev) =>
      prev &&
        prev.groupIndex === groupIndex &&
        prev.responseIndex === responseIndex
        ? null
        : { groupIndex, responseIndex }
    );
  };

  const comparisonChats = getGroupedComparisonChats(messages);
  const CombinedChevrons = () => (
    <div className="flex items-center relative gap-2 md:gap-1.5 lg:gap-2 xl:gap-2">
      <ChevronRight className="text-white w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
      <ChevronLeft className="text-white -ml-4 md:-ml-4 lg:-ml-5 xl:-ml-5 w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
    </div>
  );

  const { isStreaming, userModelPriorities, activeFeature } = useChatStore();

  const { data: providerModels } = useProviderModels();
  const getModelName = (modelId: string) => {
    const model = providerModels?.find((model) => model.modelId === modelId);
    if (!model) return modelId || "";
    return getModelDisplayName(model);
  };

  // Helper function to sort responses by model priority from TopBarProviderOptions
  const sortResponsesByPriority = (responses: TypewriterMessage[]) => {
    if (!userModelPriorities || userModelPriorities.length === 0) {
      return responses;
    }

    // Find the priority configuration for the current active feature
    const priorityForActiveFeature = userModelPriorities.find(
      (item) => item.feature === activeFeature.toUpperCase()
    );

    if (!priorityForActiveFeature?.models?.length) {
      return responses;
    }

    let parsedModels: { modelId: string; priority: number }[] = [];
    try {
      parsedModels = JSON.parse(priorityForActiveFeature.models[0]);
    } catch {
      return responses;
    }

    // Create a priority map for quick lookup
    const priorityMap = new Map<string, number>();
    parsedModels.forEach((model) => {
      priorityMap.set(model.modelId, model.priority);
    });

    // Sort responses by priority (lower priority number = higher priority = earlier position)
    return responses.sort((a, b) => {
      const priorityA =
        priorityMap.get(a.modelId || "") ?? Number.MAX_SAFE_INTEGER;
      const priorityB =
        priorityMap.get(b.modelId || "") ?? Number.MAX_SAFE_INTEGER;

      return priorityA - priorityB;
    });
  };

  const renderAIResponses = (
    responses: TypewriterMessage[],
    groupIndex: number
  ) => {
    // Sort responses by model priority before rendering
    const sortedResponses = sortResponsesByPriority(responses);

    return sortedResponses.map((res, responseIndex) => {
      const isExpanded =
        expandedInfo?.groupIndex === groupIndex &&
        expandedInfo.responseIndex === responseIndex;
      if (expandedInfo && !isExpanded) return null;

      return (
        <div
          key={res.id}
          className={`flex flex-col overflow-hidden max-h-[360px] md:max-h-[380px] lg:max-h-[400px] xl:max-h-[500px] overflow-y-auto flex-shrink-0 ${
            isExpanded
              ? "w-full"
              : "w-[85vw] md:w-[calc(47%-0.375rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(33.333%-0.667rem)]"
            }`}
        >
          {/* Rest of the card content */}
          <div className="flex rounded-t-[10px] md:rounded-t-[10px] lg:rounded-t-[10px] xl:rounded-t-[12px] px-4 md:px-4 lg:px-4 xl:px-6 py-1.5 md:py-1 lg:py-1 xl:py-1.5 gap-2 md:gap-2 lg:gap-2 xl:gap-2.5 bg-[#363B47] items-center justify-between flex-shrink-0">
            <h2 className="text-sm md:text-sm lg:text-base xl:text-lg font-semibold text-white truncate">
              {getModelName(res.modelId || "")}
            </h2>
            <button
              onClick={() => toggleExpand(groupIndex, responseIndex)}
              className="hover:opacity-80 transition flex-shrink-0"
            >
              {isExpanded ? (
                <CombinedChevrons />
              ) : (
                <Image
                  src={expandIcon}
                  alt="Expand"
                  width={20}
                  height={20}
                  className="w-[20px] h-[20px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px] xl:w-[25px] xl:h-[25px]"
                />
              )}
            </button>
          </div>

          <div
            className={`p-3 md:p-3 lg:p-4 xl:p-5 rounded-b-[10px] md:rounded-b-[10px] lg:rounded-b-[10px] xl:rounded-b-[12px] ${
              isExpanded ? "bg-gray-50" : "bg-[#CED1D933]"
              } overflow-auto text-gray-800 leading-5 md:leading-5 lg:leading-5 xl:leading-6 tracking-normal flex-grow`}
          >
            <div className="break-words overflow-wrap-anywhere overflow-x-auto text-xs md:text-xs lg:text-sm xl:text-base">
              <MarkdownRenderer content={res.fullContent || ""} />
              {isStreaming && responseIndex === responses.length - 1 && (
                <span className="inline-block w-1.5 h-3.5 md:w-1.5 md:h-3.5 lg:w-1.5 lg:h-3.5 xl:w-2 xl:h-4 bg-gray-400 animate-pulse ml-1"></span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className="w-full"
      style={{ maxWidth: "100vw" }}
    >
      {comparisonChats.map((chats, groupIndex) => {
        const shouldRenderGroup =
          expandedInfo === null || expandedInfo.groupIndex === groupIndex;

        if (!shouldRenderGroup) return null;
        return (
          <div
            key={groupIndex}
            className="mt-4 md:mt-5 lg:mt-6 xl:mt-8 overflow-hidden"
          >
            {chats.userQuery && (
              <div className="ml-auto w-[70vw] md:w-[60vw] lg:w-[60vw] xl:w-[50vw] mr-1 md:mr-2 lg:mr-2 xl:mr-2 p-3 md:p-3 lg:p-3 xl:p-4 rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl bg-[#E9EAF0] text-gray-800 font-sans text-xs md:text-xs lg:text-xs xl:text-sm 2xl:text-base mb-3 md:mb-3 lg:mb-3 xl:mb-4">
                {chats.userQuery.attachments &&
                  chats.userQuery.attachments.length > 0 && (
                    <div className="mb-2">
                      {chats.userQuery.attachments.map((key, i) => (
                        <AttachmentDisplay key={i} itemKey={key} />
                      ))}
                    </div>
                  )}
                {chats.userQuery.fullContent}
              </div>
            )}

            <div className="px-1 md:px-1 lg:px-1 xl:px-1 pt-3 md:pt-4 lg:pt-4 xl:pt-6 overflow-hidden">
              <div
                className={`${
                  expandedInfo !== null
                    ? "max-w-[95%] md:max-w-[680px] lg:max-w-[800px] xl:max-w-[958px] ml-4 md:ml-12 lg:ml-16 xl:ml-24"
                    : ""
                  }`}
              >
                {/* Horizontal scrollable container for responses */}
                <div
                  className={`flex gap-2 md:gap-3 lg:gap-4 xl:gap-4 ${
                    expandedInfo === null
                      ? "overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                      : ""
                    }`}
                  style={{
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {renderAIResponses(chats.aiResponses, groupIndex)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const getGroupedComparisonChats = (messages: TypewriterMessage[]) => {
  const chatPairs: {
    userQuery: TypewriterMessage;
    aiResponses: TypewriterMessage[];
  }[] = [];

  let userQuery: TypewriterMessage | null = null;
  let aiResponses: TypewriterMessage[] = [];

  for (const message of messages) {
    if (message.isUser) {
      // Push previous pair if any
      if (userQuery) {
        chatPairs.push({ userQuery, aiResponses });
      }

      // Start new group
      userQuery = message;
      aiResponses = [];
    } else if (userQuery) {
      // Collect responses for current user query
      aiResponses.push(message);
    }
  }

  // Push the last collected group
  if (userQuery) {
    chatPairs.push({ userQuery, aiResponses });
  }

  return chatPairs;
};

export default ComparisonChatRenderer;
