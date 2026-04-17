import { RotateCcw } from "lucide-react";
import React, { useState } from "react";

type RetryButtonProps = {
  handleRetry: () => Promise<void> | void;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function RetryButton({
  handleRetry,
  disabled,
  isLoading = false,
}: RetryButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const onClick = async () => {
    setIsAnimating(true);

    try {
      await handleRetry();
    } finally {
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const shouldSpin = isAnimating || isLoading;

  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-md transition-all duration-200 cursor-pointer bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-800"
      title="Retry"
      disabled={disabled}
    >
      <RotateCcw
        size={14}
        strokeWidth={1}
        className={`transition-transform ${shouldSpin ? "animate-spin" : ""}`}
        style={shouldSpin ? { animationDirection: "reverse" } : undefined}
      />
    </button>
  );
}
