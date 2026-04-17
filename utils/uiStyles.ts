import { COLORS } from "./colors";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  danger: COLORS.danger,
  success: COLORS.success,
  gradient: COLORS.gradientButton,
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const buttonShadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export const buttonBorders = {
  none: "border-0",
  default: "border " + COLORS.border,
  thick: "border-2 border-gray-500",
};
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "gradient";

export const flex = "flex items-center justify-center ";

export const planStyles = {
  DEFAULT: {
    iconUI: "w-9 h-9 text-[#453fca]",
    iconBg: "bg-indigo-100",
    iconColor: "marker:text-[#453fca]",
    buttonText: "Subscribe",
    buttonBg: "bg-gradient-to-r from-[#ff855e] to-[#453fca] text-white",
    border: "border border-gray-200",
    cursor: "cursor-pointer",
  },
  RECOMMENDED: {
    iconUI: "w-9 h-9 text-[#ff855e]",
    buttonText: "Subscribe",
    iconBg: "bg-pink-100",
    iconColor: "marker:text-[#ff855e]",
    buttonBg: "bg-gradient-to-r from-[#ff855e] to-[#453fca] text-white",
    border: "border-2 border-[#FF855E]",
    cursor: "cursor-pointer",
  },
} as const;

// eslint-disable-next-line @typescript-eslint/naming-convention
export function getPlanStyles(tag: string | null | undefined) {
  const onlyFreePlan =
    typeof window !== "undefined" &&
    localStorage.getItem("onlyFreePlan") === "true";

  if (!tag) return planStyles.DEFAULT;

  switch (tag) {
    case "RECOMMENDED":
      return planStyles.RECOMMENDED;
    case "FREE":
      // if only Free plan apply DEFAULT styles
      if (onlyFreePlan) {
        // return planStyles.DEFAULT;
        return {
          ...planStyles.DEFAULT,
          buttonText: "Continue with Free Plan",
        };
      }
      return {
        ...planStyles.DEFAULT,
        buttonText: "Continue with Free Plan",
        buttonBg: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      };
    default:
      return planStyles.DEFAULT;
  }
}

export const customtransactionsStyles = {
  headCells: {
    style: {
      backgroundColor: "#F8FAFC",
      color: "#374151",
      fontWeight: 500,
      fontSize: "12px",
      textAlign: "center" as const,
    },
  },
  cells: {
    style: {
      textAlign: "center" as const,
      fontSize: "14px",
      fontWeight: 500,
      color: "#1F2937",
    },
  },
};

export const buttonWidths = {
  sm: "w-24", // ~96px
  md: "w-32", // ~144px
  lg: "w-56", // ~192px
};

export const buttonRounded = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
};
