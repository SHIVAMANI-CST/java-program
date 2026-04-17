import Image from "next/image";
import React from "react";
import copy from "@/public/copy.svg";
import copiedIcon from "@/public/tick.svg";
export default function CopyButton({
  copied,
  handleCopy,
}: {
  copied: boolean;
  handleCopy: () => void;
}) {
  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-white"
          : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      }`}
      title={copied ? "Copied!" : "Copy response"}
    >
      {copied ? (
        <Image
          src={copiedIcon}
          alt="Copied"
          width={34}
          height={34}
          className="w-4 h-4"
        />
      ) : (
        <Image
          src={copy}
          alt="Copy"
          width={34}
          height={34}
          className="w-4 h-4"
        />
      )}
    </button>
  );
}
