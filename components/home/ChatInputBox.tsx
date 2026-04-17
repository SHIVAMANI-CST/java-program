// ChatInputBox.tsx
"use client";
import dayjs from "dayjs";
import { Send, Paperclip, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import Button from "@/components/global-components/Button";
import Textarea from "@/components/global-components/TextArea";
import { chatActions } from "@/constants/constants";
import { buildChatRoute, ROUTES } from "@/constants/routes";
import { useProviderModels } from "@/hooks/gptModels";
import { useListConversations } from "@/hooks/useListConversations";
import { useUploadAttachments } from "@/hooks/useUploadAttachments";
import { useUserId } from "@/lib/getUserId";
import { useNetworkStore } from "@/stores/networkStore";
import { useChatStore } from "@/stores/useChatStore";
import { ChatInputBoxProps } from "@/types/home";
import { attachmentConfig, validateFiles } from "@/utils/attachmentUtils";
import { FEATURE_MAP } from "@/utils/conversationUtils";
import logger from "@/utils/logger/browserLogger";
import { showErrorToast } from "@/utils/toastUtils";


export default function ChatInputBox({
  input,
  setInput,
  handleSubmit,
  activeFeature,
  disabled = false,
  isGenerating = false,
}: ChatInputBoxProps & { isGenerating?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [focusedButton, setFocusedButton] = useState<string | null>(null);
  const [isInputLocked, setIsInputLocked] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const {
    setHasSubmitted,
    resetChat,
    setHistoryChatFeature,
    setActiveFeature,
    startConversationLoad,
    isGenerating: isGeneratingFromStore,
    userModelPriorities,
    conversationId,
  } = useChatStore();
  const { isOffline } = useNetworkStore();
  const { data: providerModels = [] } = useProviderModels();
  const { uploadFiles, isUploading } = useUploadAttachments();

  const currentFeatureEnum =
    FEATURE_MAP[activeFeature] || activeFeature?.toUpperCase();
  const priority = userModelPriorities?.find(
    (p) => p.feature === currentFeatureEnum
  );

  const { isAttachmentAllowed, selectedModelNames } = useMemo(() => {
    let allowed = false;
    let names: string[] = [];

    if (priority?.models?.[0]) {
      try {
        const models = JSON.parse(priority.models[0]);
        if (Array.isArray(models) && models.length > 0) {
          const modelIds = models.map((m: { modelId: string }) => m.modelId);
          const selectedModels = providerModels?.filter((m) =>
            modelIds.includes(m.modelId)
          );

          if (selectedModels && selectedModels.length > 0) {
            names = selectedModels.map((m) => m.modelName || m.modelId);
            // Check if ANY of the selected models is TEXT_ONLY
            const hasTextOnlyModel = selectedModels.some(
              (m) => m.modelType === "TEXT_ONLY"
            );

            // Only allow attachments if ALL models support them (none are TEXT_ONLY)
            if (!hasTextOnlyModel) {
              allowed = true;
            }
          }
        }
      } catch (e) {
        logger.error("Failed to parse model priority", e);
      }
    }
    return { isAttachmentAllowed: allowed, selectedModelNames: names };
  }, [priority, providerModels]);

  const userId = useUserId();
  const { data: conversations = [] } = useListConversations(userId);

  const handleButtonClick = (buttonId: string) => {
    if (isGenerating) return;

    // Always check if there are existing conversations for this feature first
    const featureConversations = conversations.filter(
      (conversation) => conversation.feature === buttonId
    );

    if (featureConversations.length > 0) {
      const sortedConversations = featureConversations.sort((a, b) => {
        const dateA = dayjs(a.updatedAt ?? a.createdAt);
        const dateB = dayjs(b.updatedAt ?? b.createdAt);
        return dateB.valueOf() - dateA.valueOf();
      });

      const latestConversation = sortedConversations[0];
      startConversationLoad(latestConversation.conversationId);
      setHistoryChatFeature(latestConversation.feature ?? null);
      setActiveFeature(buttonId);
      router.push(buildChatRoute(latestConversation.conversationId));
    } else {
      // Feature has no conversations - start a new chat
      resetChat();
      setHistoryChatFeature(null);
      setHasSubmitted(false);
      setActiveFeature(buttonId);
      router.push(ROUTES.CHAT);
    }
  };

  const [isFullscreen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const { validFiles } = validateFiles(newFiles, selectedFiles.length);

      setSelectedFiles((prev) => [...prev, ...validFiles]);

      // Reset input so same file can be selected again if needed
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileClick = () => {
    if (!isAttachmentAllowed) {
      const modelNamesStr =
        selectedModelNames.length > 0
          ? ` (${selectedModelNames.join(", ")})`
          : "";
      showErrorToast(
        `Selected model does not support image input. Please choose a compatible model.${modelNamesStr}`
      );
      return;
    }
    fileInputRef.current?.click();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (!input.trim() && selectedFiles.length === 0) ||
      disabled ||
      isSubmitting ||
      isGenerating ||
      isUploading
    ) {
      return;
    }

    setIsSubmitting(true);
    setIsInputLocked(true);

    // Clear files immediately from UI (optimistic update)
    const filesToUpload = [...selectedFiles];
    setSelectedFiles([]);

    try {
      let attachmentKeys: string[] = [];
      // Determine Conversation ID for Uploads
      if (filesToUpload.length > 0) {
        // If we don't have a conversation ID yet (new chat), pass "temp" to backend
        const targetId = conversationId || "temp";

        attachmentKeys = await uploadFiles(filesToUpload, targetId);
      }

      // Pass keys to handleSubmit
      await handleSubmit(e, attachmentKeys);

      // Clear inputs on success
      setHasSubmitted(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      logger.error("Error submitting chat:", error);
      // Restore files on error so user doesn't lose them
      if (filesToUpload.length > 0) {
        setSelectedFiles(filesToUpload);
      }
      setIsInputLocked(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (!isGenerating) {
      setIsInputLocked(false);
    }
  }, [isGenerating, isSubmitting]);

  const isDisabled =
    disabled ||
    isSubmitting ||
    isGenerating ||
    isInputLocked ||
    isGeneratingFromStore ||
    isUploading;

  const getPlaceholder = () => {
    if (isUploading) return "Uploading attachment...";
    if (isGenerating) return "AI is generating response...";
    if (isSubmitting) return "Sending message...";
    if (disabled) return "Creating conversation...";
    return "Enter your prompt here...";
  };

  const chatInputDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatInputDivRef.current) return;

    const textarea = chatInputDivRef.current.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;

    if (textarea) {
      textarea.style.height = "auto";

      const scrollHeight = textarea.scrollHeight;
      const maxHeight = isFullscreen ? window.innerHeight * 1.9 : 400;

      if (isFullscreen) {
        textarea.style.height = `${window.innerHeight * 0.9}px`; // almost full height
        textarea.style.overflowY = "auto";
      } else {
        if (scrollHeight <= maxHeight) {
          textarea.style.height = `${scrollHeight}px`;
          textarea.style.overflowY = "hidden";
        } else {
          textarea.style.height = `${maxHeight}px`;
          textarea.style.overflowY = "auto";
        }
      }
    }
  }, [input, isFullscreen]);

  return (
    <div className="w-full px-2 md:px-3 lg:px-3 xl:px-3 py-1.5 md:py-2 lg:py-2 xl:py-2 bottom-0 bg-white z-10">
      <div className="w-[96vw] md:w-[90vw] md:max-w-3xl lg:max-w-3xl xl:max-w-3xl mx-auto">
        {/* Feature buttons - Horizontally scrollable on mobile, wrapping on desktop */}
        <div className="mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 text-center md:text-left">
          <div className="inline-flex md:flex flex-nowrap md:flex-wrap gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 pb-1 overflow-x-auto md:overflow-x-visible scrollbar-hide max-w-full">
            {chatActions.map((button) => {
              const isActive = activeFeature === button.id;
              const isHovered = hoveredButton === button.id;
              const isFocusedBtn = focusedButton === button.id;

              const buttonDisabled = isDisabled || isActive;

              let buttonClass =
                "flex items-center justify-center gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 px-2.5 md:px-4 lg:px-4 xl:px-4 py-1.5 md:py-2 lg:py-2 xl:py-2 rounded-2xl text-white whitespace-nowrap transition-all duration-300 ease-in-out flex-shrink-0 text-xs md:text-sm lg:text-sm xl:text-sm";

              if (buttonDisabled) {
                buttonClass +=
                  " disabled:opacity-50 disabled:cursor-not-allowed";
              }

              if (isActive) {
                buttonClass +=
                  " bg-[linear-gradient(92deg,_#FF855E_22.97%,_rgba(106,_42,_255,_0.95)_77.03%)]";
              } else if (isFocusedBtn) {
                buttonClass += " !bg-[#2563EB]";
              } else if (isHovered) {
                buttonClass +=
                  " bg-[linear-gradient(92deg,_rgba(106,_42,_255,_0.3)_32.97%,_rgba(255,_133,_94,_0.3)_67.03%)]";
              } else {
                buttonClass +=
                  " bg-[linear-gradient(92deg,_#374151_22.97%,_#1f2937_77.03%)]";
              }

              return (
                <Button
                  key={button.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleButtonClick(button.id)}
                  onMouseEnter={() =>
                    !buttonDisabled && setHoveredButton(button.id)
                  }
                  onMouseLeave={() => setHoveredButton(null)}
                  onFocus={() => !buttonDisabled && setFocusedButton(button.id)}
                  onBlur={() => setFocusedButton(null)}
                  className={buttonClass}
                  disabled={buttonDisabled}
                  title={button.label}
                  aria-label={button.label}
                >
                  <Image
                    src={button.icon}
                    alt=""
                    aria-hidden="true"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] lg:w-[18px] lg:h-[18px] xl:w-[18px] xl:h-[18px]"
                  />
                  {button.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Input wrapper */}
        <div
          ref={chatInputDivRef}
          className="relative flex flex-col items-start rounded-xl border border-[#FF855E] bg-[#F5F7FA] px-2 md:px-3 lg:px-3 xl:px-3 py-1.5 md:py-2 lg:py-2 xl:py-2 transition-all duration-300"
        >
          {/* Attachment Previews */}
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto w-full py-2 px-1 mb-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-1.5 -right-1.5 bg-gray-600 text-white rounded-full p-0.5 hover:bg-gray-800 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center w-full">
            {/* File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/png, image/jpeg, image/gif, image/webp"
              multiple
              disabled={
                isDisabled ||
                !isAttachmentAllowed ||
                selectedFiles.length >= attachmentConfig.MAX_FILES
              }
            />

            <Button
              onClick={handleFileClick}
              variant="secondary"
              shadow="none"
              border="none"
              className={`mr-1 md:mr-2 text-gray-500 hover:text-gray-700 p-1 md:p-1.5 rounded-full hover:bg-gray-200 transition-colors !bg-transparent ${!isAttachmentAllowed ||
                selectedFiles.length >= attachmentConfig.MAX_FILES
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
              title={
                !isAttachmentAllowed
                  ? "Attachments not supported for this model"
                  : selectedFiles.length >= attachmentConfig.MAX_FILES
                    ? `Max ${attachmentConfig.MAX_FILES} attachments allowed`
                    : "Attach images"
              }
              disabled={
                isDisabled || selectedFiles.length >= attachmentConfig.MAX_FILES
              }
            >
              <Paperclip size={18} className="w-[18px] h-[18px]" />
            </Button>

            <Textarea
              value={input}
              onChange={(e) =>
                !isDisabled && !isOffline && setInput(e.target.value)
              }
              placeholder={getPlaceholder()}
              rows={1}
              className={`flex-1 resize-none border-0 bg-transparent focus:ring-0 leading-relaxed focus:outline-none placeholder:text-gray-400 text-sm md:text-base lg:text-base xl:text-base
      ${isDisabled || isOffline ? "text-gray-400 cursor-not-allowed" : "text-gray-900"}
    `}
              style={{
                minHeight: "32px",
                maxHeight: "300px",
              }}
              onKeyDown={(e) => {
                if (isDisabled || isOffline) {
                  e.preventDefault();
                  return;
                }
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !isDisabled &&
                  !isGenerating &&
                  !isOffline
                ) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />

            {/* Send button inside box */}
            <Button
              onClick={onSubmit}
              disabled={!input.trim() || isDisabled}
              variant="secondary"
              aria-label="Send message"
              className={`ml-1.5 md:ml-2 lg:ml-2 xl:ml-2 rounded-full transition-all duration-200 !bg-gray-700 !text-white p-1.5 md:p-2.5 lg:p-2.5 xl:p-2.5 ${input.trim() && !isDisabled
                ? "hover:bg-gray-600 cursor-pointer"
                : "!cursor-default"
                }`}
            >
              <Send
                size={16}
                className={`w-4 h-4 md:w-[18px] md:h-[18px] lg:w-[18px] lg:h-[18px] xl:w-[18px] xl:h-[18px] transition-transform duration-200 ${isGenerating || isUploading ? "animate-pulse" : ""
                  }`}
              />
            </Button>
          </div>
        </div>

        {/* Loading indicator / Disclaimer */}
        <div className="mt-1.5 md:mt-2 lg:mt-2 xl:mt-2 text-center text-[0.625rem] md:text-xs lg:text-xs xl:text-xs text-gray-500">
          {isDisabled && (isGenerating || isUploading) ? (
            <div className="flex items-center justify-center gap-1.5 md:gap-2 lg:gap-2 xl:gap-2">
              <div className="animate-spin rounded-full h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3 lg:w-3 xl:h-3 xl:w-3 border-2 border-gray-300 border-t-blue-500"></div>
              <span>
                {isUploading
                  ? "Uploading files..."
                  : "AI is generating response..."}
              </span>
            </div>
          ) : (
            <span>CinfyAI can make mistakes, so double-check it</span>
          )}
        </div>
      </div>
    </div>
  );
}
