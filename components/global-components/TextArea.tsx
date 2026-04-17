"use client";

import clsx from "clsx";
import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isFocused?: boolean;
}

const baseTextareaStyles =
  "w-full resize-none pl-3 pr-3 focus:outline-none rounded-lg max-h-24 min-h-8 text-sm";

const Textarea: React.FC<TextareaProps> = ({
  isFocused,
  className,
  ...props
}) => {
  return (
    <textarea
      className={clsx(
        baseTextareaStyles,
        className,
        isFocused ? "shadow-sm" : ""
      )}
      {...props}
    />
  );
};

export default Textarea;
