import { SubscriptionPlanProps } from "@/types/home";
import { createDate } from "./dateUtils";

interface Subscription {
  status?: string | null | undefined;
  startDate?: string | null;
  createdAt?: string | null;
  plan?: any;
}

export function addPaymentUnloadListener(
  message = "Are you sure you want to leave? Your payment is still processing."
) {
  const handler = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = message;
    return message;
  };

  window.addEventListener("beforeunload", handler);

  // return a cleanup function so caller can remove it
  return () => {
    window.removeEventListener("beforeunload", handler);
  };
}

export const paymentStatusMap: Record<
  string,
  { label: string; className: string }
> = {
  captured: { label: "Paid", className: "text-green-600 font-semibold" },
  authorized: { label: "In Progress", className: "text-blue-500 font-semibold" },
  created: { label: "Pending", className: "text-yellow-600 font-semibold" },
  refunded: { label: "Refunded", className: "text-purple-600 font-semibold" },
  failed: { label: "Failed", className: "text-red-600 font-semibold" },
};

export const getPaymentStatusLabel = (
  status?: string | null
): { label: string; className: string } => {
  if (!status) return { label: "N/A", className: "text-gray-500" };
  return (
    paymentStatusMap[status] ?? {
      label: status,
      className: "text-gray-500",
    }
  );
};

export function formatCurrency(
  amount: number | null | undefined,
  currency: string | null | undefined = "INR"
): string {
  if (amount == null) return "0.00";

  const localeMap: Record<string, string> = {
    INR: "en-IN", // Indian numbering system
    USD: "en-US", // US system
    SGD: "en-SG", // Singapore
  };

  const locale = localeMap[currency ?? "INR"] || "en-IN";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency ?? "INR",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function mapPlanTag(plan: SubscriptionPlanProps): "RECOMMENDED" | "FREE" | undefined {
  if (plan.displayTag === "RECOMMENDED") return "RECOMMENDED";
  if (plan.planType === "FREE") return "FREE";
  return undefined;
}

export function getLatestActivePlan(
  subscriptions: Subscription[] | undefined | null
): SubscriptionPlanProps | null {
  if (!subscriptions || subscriptions.length === 0) return null;

  const latestSub =
    [...subscriptions]
      .filter((s) => s.status === "ACTIVE")
      .sort(
        (a, b) =>
          createDate(b.startDate ?? b.createdAt ?? undefined).valueOf() -
          createDate(a.startDate ?? a.createdAt ?? undefined).valueOf()
      )[0] ?? null;


  return latestSub?.plan ?? null;
}


