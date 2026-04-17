import clsx from "clsx";
import React from "react";
import { InputProps } from "@/types/stepper";
import { COLORS } from "@/utils/colors";

const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  type,
  value,
  onChange,
  required = false,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  };

  return (
    <div
      className="mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2"
      style={{ width: props.width ?? "100%" }}
    >
      {label && (
        <label
          className={`block text-xs md:text-xs lg:text-xs xl:text-sm font-medium mb-0.5 md:mb-0.5 lg:mb-0.5 xl:mb-1 ${COLORS.darkGrayText}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        required={required}
        type={type}
        value={value}
        onChange={handleChange}
        className={clsx(
          COLORS.input,
          "text-xs md:text-xs lg:text-xs xl:text-sm",
          error ? COLORS.inputBorderError : COLORS.border,
          props.disabled &&
            "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300",
          className
        )}
      />

      {error && (
        <p
          className={`${COLORS.errorText} text-xs md:text-xs lg:text-xs xl:text-sm mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
