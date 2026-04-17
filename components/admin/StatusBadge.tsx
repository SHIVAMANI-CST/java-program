"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import React from "react";
import {
    StatusBadgeVariant,
    statusBadgeStyles,
    getStatusVariant,
} from "@/constants/adminConstants";

interface StatusBadgeProps {
    status: string;
    variant?: StatusBadgeVariant;
    showIcon?: boolean;
    label?: string;
    className?: string;
}

export const StatusBadge = ({
    status,
    variant,
    showIcon = false,
    label,
    className = "",
}: StatusBadgeProps) => {
    const badgeVariant = variant || getStatusVariant(status);
    const styles = statusBadgeStyles[badgeVariant];
    const displayLabel = label || status || "Unknown";

    const renderIcon = () => {
        if (!showIcon || !styles.icon) return null;

        const iconProps = { size: 12, className: "flex-shrink-0" };

        switch (styles.icon) {
            case "check":
                return <CheckCircle {...iconProps} />;
            case "clock":
                return <Clock {...iconProps} />;
            case "x":
                return <XCircle {...iconProps} />;
            default:
                return null;
        }
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border} ${className}`}
        >
            {renderIcon()}
            {displayLabel}
        </span>
    );
};

export default StatusBadge;
