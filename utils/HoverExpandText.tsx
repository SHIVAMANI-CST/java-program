import React from "react";

interface HoverExpandTextProps {
    text: string;
    className?: string;
}

export const HoverExpandText: React.FC<HoverExpandTextProps> = ({
    text,
    className = "",
}) => (
    <div className="relative group flex-1 min-w-0">
        <div className={`truncate ${className} cursor-default`}>{text}</div>
        <div
            className={`hidden group-hover:block absolute -left-2 -top-1 z-50 bg-white shadow-lg border border-gray-100 rounded-lg px-2 py-1 whitespace-nowrap min-w-[calc(100%+1rem)] ${className}`}
        >
            {text}
        </div>
    </div>
);
