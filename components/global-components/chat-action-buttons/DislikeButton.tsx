import { ThumbsDown } from "lucide-react";
import React from "react";

export default function DislikeButton({
  handleDislike,
  isDisliked,
}: {
  handleDislike: () => void;
  isDisliked: boolean;
}) {
  return (
    <button
      onClick={handleDislike}
      className={`p-1.5 rounded-md cursor-pointer transition-all duration-200 ${
        isDisliked
          ? "text-gray-900"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      title="Bad response"
    >
      <ThumbsDown
        size={14}
        strokeWidth={1}
        className={`
          transition-all duration-200
          ${
            isDisliked
              ? "fill-current stroke-current"
              : "fill-transparent stroke-black "
          }
        `}
      />
    </button>
  );
}
