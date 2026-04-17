import { TypewriterMessage } from "@/stores/useChatStore";
import { PaginationControls } from "@/types/home";

interface PaginatedState {
  visibleMessageIds: Set<string>;
  paginationByMessageId: Record<string, PaginationControls | undefined>;
}

export const buildPaginatedMessageState = (
  messages: TypewriterMessage[],
  aiResponsePageMap: Record<string, number>,
  setAiResponsePage: (userMessageId: string, page: number) => void
): PaginatedState => {
  const aiBuckets: Record<string, TypewriterMessage[]> = {};
  let currentUserId: string | null = null;

  messages.forEach((msg) => {
    if (msg.isUser) {
      currentUserId = msg.id;
      if (!aiBuckets[currentUserId]) {
        aiBuckets[currentUserId] = [];
      }
    } else if (currentUserId) {
      aiBuckets[currentUserId].push(msg);
    }
  });

  const visibleIds = new Set<string>();
  const paginationMap: Record<string, PaginationControls | undefined> = {};

  Object.entries(aiBuckets).forEach(([userId, aiList]) => {
    if (aiList.length === 0) return;

    const lastIndex = aiList.length - 1;
    const storedIndex = aiResponsePageMap[userId];
    const currentIndex =
      storedIndex === undefined
        ? lastIndex
        : Math.min(Math.max(storedIndex, 0), lastIndex);
    const activeMessage = aiList[currentIndex];

    if (!activeMessage) return;

    visibleIds.add(activeMessage.id);

    if (aiList.length > 1) {
      paginationMap[activeMessage.id] = {
        current: currentIndex + 1,
        total: aiList.length,
        onPrev: () =>
          setAiResponsePage(userId, Math.max(0, currentIndex - 1)),
        onNext: () =>
          setAiResponsePage(userId, Math.min(lastIndex, currentIndex + 1)),
        disablePrev: currentIndex === 0,
        disableNext: currentIndex === lastIndex,
      };
    }
  });

  return {
    visibleMessageIds: visibleIds,
    paginationByMessageId: paginationMap,
  };
};

