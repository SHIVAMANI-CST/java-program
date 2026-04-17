import Image from "next/image";
import React from "react";
import regenrate from "@/public/Comment.svg";

export default function RegenerateButton({
  handleRegenerate,
}: {
  handleRegenerate: () => void;
}) {
  return (
    <button
      onClick={handleRegenerate}
      className="p-1.5 rounded-md cursor-pointer bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200"
      title="Regenerate response"
    >
      <Image
        src={regenrate}
        alt="Regenerate"
        width={16}
        height={16}
        className="w-4 h-4"
      />
    </button>
  );
}
