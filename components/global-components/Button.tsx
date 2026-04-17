"use client";

import clsx from "clsx";
import React from "react";
import SpinnerMessage from "./SpinnerMessage";
import {
  buttonSizes,
  buttonVariants,
  buttonShadows,
  buttonBorders,
  buttonWidths,
  buttonRounded,
} from "@/utils/uiStyles";

const baseButtonStyles =
  "px-4 py-2 rounded transition duration-150 ease-in-out";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  shadow?: keyof typeof buttonShadows;
  border?: keyof typeof buttonBorders;
  loading?: boolean;
  loadingMessage?: string;
  buttonWidth?: keyof typeof buttonWidths;
  rounded?: keyof typeof buttonRounded;
}


const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  shadow = "md",
  border = "default",
  className,
  loading = false,
  type = "button",
  buttonWidth,
  rounded,
  ...props
}) => {
  return (
    <button
      type={type}
      className={clsx(
        baseButtonStyles,
        buttonVariants[variant],
        buttonSizes[size],
        buttonShadows[shadow],
        buttonBorders[border],
        buttonWidth && buttonWidths[buttonWidth],
        rounded && buttonRounded[rounded],
        "disabled:opacity-50",
        "cursor-pointer disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <SpinnerMessage
          message={props.loadingMessage}
          color="border-white"
          size={4}
        />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
