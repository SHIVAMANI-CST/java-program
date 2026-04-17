/* eslint-disable @typescript-eslint/naming-convention */
import dayjs from "dayjs";
import { createDate, formatDate } from "./dateUtils";
import { DATE_LABELS } from "@/constants/constants";
import { ConversationsFeature } from "@/constants/enums";
import { Conversation, GraphQLMessage } from "@/types/home";

const IST = "Asia/Kolkata";
export const groupConversationsByDate = (
  conversations: Conversation[]
): Record<string, Conversation[]> => {
  const groups: Record<string, Conversation[]> = {};

  conversations.forEach((conv) => {
    const now = dayjs().tz(IST);
    const updatedDate = conv.updatedAt ? dayjs(conv.updatedAt).tz(IST) : null;

    let label: string;
    if (updatedDate && updatedDate.isSame(now, "day")) {
      label = DATE_LABELS.TODAY;
    } else {
      label = formatDate(conv.createdAt);
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(conv);
  });

  Object.keys(groups).forEach((key) => {
    groups[key].sort(
      (a, b) =>
        dayjs(b.updatedAt ?? b.createdAt).valueOf() -
        dayjs(a.updatedAt ?? a.createdAt).valueOf()
    );
  });

  return groups;
};

export const sortMessagesByDate = (
  messages: GraphQLMessage[]
): GraphQLMessage[] => {
  return messages.sort((a, b) => {
    const timeA =
      a.timestamp ?? (a.updatedAt ? createDate(a.updatedAt).valueOf() : 0);
    const timeB =
      b.timestamp ?? (b.updatedAt ? createDate(b.updatedAt).valueOf() : 0);

    return timeA - timeB;
  });
};

export const FEATURE_MAP: Record<string, ConversationsFeature> = {
  General: ConversationsFeature.GENERAL,
  OptimizedResults: ConversationsFeature.OPTIMIZATION,
  ChatComparison: ConversationsFeature.COMPARISON,
  Summarization: ConversationsFeature.SUMMARIZATION,
};

export function trimConversationTitle(text: string, maxLength = 50): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
