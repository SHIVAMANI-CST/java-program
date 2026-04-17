import { ThumbsUp } from "lucide-react";
import React from "react";

export default function LikeButton({
  handleLike,
  isLiked,
}: {
  handleLike: () => void;
  isLiked: boolean;
}) {
  return (
    <button
      onClick={handleLike}
      className={`p-1.5 rounded-md cursor-pointer transition-all duration-200 ${
        isLiked
          ? "text-gray-900"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      title="Good response"
    >
      <ThumbsUp
        size={14}
        strokeWidth={1}
        className={`transition-all duration-200 ${
          isLiked
            ? "fill-current stroke-current"
            : "fill-transparent stroke-black "
        }`}
      />
    </button>
  );
}
