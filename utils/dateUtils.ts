/* eslint-disable @typescript-eslint/naming-convention */
// dateUtils.ts
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { v4 as uuidv4 } from "uuid";
import { throwMissingParamError } from "./errorUtils";
import { DATE_LABELS } from "@/constants/constants";

dayjs.extend(utc);
dayjs.extend(timezone);
const IST = "Asia/Kolkata";

export function createDate(
  date: string | number | Date | undefined = new Date()
): Dayjs {
  return dayjs(date);
}

// Returns a unique string id using the current timestamp and optional suffix.

export function generateUniqueId(): string {
  return uuidv4();
}

// Formats a timestamp/date to "hh:mm A" (e.g., 02:45 PM)
export function formatTime(
  date: string | Date | number | undefined,
  format: string = "hh:mm A"
): string {
  return dayjs(date).format(format);
}

export function getCurrentISOString(): string {
  return dayjs().toISOString();
}

export function toISOString(date: string | Date | number | undefined): string {
  return createDate(date).toISOString();
}

export const formatDate = (dateString: string): string => {
  if (!dateString) {
    throwMissingParamError("Invalid date.");
  }
  const now = dayjs().tz(IST);
  const date = dayjs(dateString).tz(IST);

  if (date.isSame(now, "day")) return DATE_LABELS.TODAY;
  if (date.isSame(now.subtract(1, "day"), "day")) return DATE_LABELS.YESTERDAY;
  if (date.isAfter(now.subtract(7, "day"))) return DATE_LABELS.LAST_SEVEN_DAYS;
  if (date.isAfter(now.subtract(30, "day")))
    return DATE_LABELS.LAST_THIRTY_DAYS;
  if (date.isBefore(now.subtract(60, "day")))
    return DATE_LABELS.LAST_SIXTY_DAYS;

  return date.format("DD MMM YYYY");
};

export const getDateGroupOrder = (label: string): number => {
  // Define the order priority for date groups
  const orderMap: Record<string, number> = {
    [DATE_LABELS.TODAY]: 1,
    [DATE_LABELS.YESTERDAY]: 2,
    [DATE_LABELS.LAST_SEVEN_DAYS]: 3,
    [DATE_LABELS.LAST_THIRTY_DAYS]: 4,
    [DATE_LABELS.LAST_SIXTY_DAYS]: 5,
  };

  // If it's a custom date format (DD MMM YYYY), give it a lower priority
  return orderMap[label] || 6;
};

export function getBillingDate(
  endDate?: string | Date | number | null
): string {
  if (!endDate) return "N/A";

  const nextBillingDate = dayjs(endDate).add(1, "day").tz(IST).toDate();
  return formatDisplayDate(nextBillingDate, { withTime: false });
}

export function formatDisplayDate(
  date?: string | Date | number | null,
  opts: { withTime?: boolean } = { withTime: true }
): string {
  if (!date) return "N/A";

  const format = opts.withTime ? "MMM DD, YYYY hh:mm A" : "MMM DD, YYYY";
  return dayjs(date).tz(IST).format(format);
}
