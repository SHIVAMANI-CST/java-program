import React from "react";

interface SpinnerMessageProps {
  message?: string;
  size?: number;
  className?: string;
  color?: string;
}

const SpinnerMessage: React.FC<SpinnerMessageProps> = ({
  message = "Loading...",
  size = 4,
  className = "",
  color = "border-white",
}) => {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 ${color} mr-2`}
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
      ></div>
      <span>{message}</span>
    </span>
  );
};

export default SpinnerMessage;
