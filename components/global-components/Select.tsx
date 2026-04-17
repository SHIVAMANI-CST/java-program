"use client";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import { CustomSelectProps } from "@/types/global";
import { COLORS } from "@/utils/colors";

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  className,
  error,
  required = false,
  maxHeight = "max-h-60 md:max-h-52 lg:max-h-52 xl:max-h-60",
  disabled = false,
  loading = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? "");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  const handleSelect = (val: string | number) => {
    setSelected(val);
    onChange?.(val);
    setIsOpen(false);
  };

  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label ?? placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative mb-2 md:mb-1.5 lg:mb-1.5 xl:mb-2 ${className ?? "w-64 md:w-48 lg:w-56 xl:w-64"}`}
    >
      {label && (
        <label
          className={`block text-sm md:text-xs lg:text-xs xl:text-sm font-medium mb-1 md:mb-0.5 lg:mb-0.5 xl:mb-1 ${COLORS.darkGrayText}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={clsx(
          "w-full px-4 md:px-3 lg:px-3 xl:px-4 py-2 md:py-1.5 lg:py-1.5 xl:py-2 border rounded text-sm md:text-xs lg:text-xs xl:text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white",
          error ? COLORS.inputBorderError : "border-gray-300"
        )}
      >
        <span
          className={
            selected ? "text-gray-900 truncate" : "text-gray-500 truncate"
          }
        >
          {selectedLabel}
        </span>
        {loading ? (
          <div
            className="animate-spin w-4 h-4 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 
               ml-2 md:ml-1.5 lg:ml-1.5 xl:ml-2 
               border-2 border-gray-400 border-t-transparent rounded-full"
          ></div>
        ) : (
          <div
            className="w-2.5 h-2.5 md:w-2 md:h-2 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 
               ml-2 md:ml-1.5 lg:ml-1.5 xl:ml-2 
               border-b-2 border-r-2 border-gray-500 rotate-45"
          ></div>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-10 mt-1 md:mt-0.5 lg:mt-0.5 xl:mt-1 w-full bg-white border border-gray-300 rounded-md md:rounded-sm lg:rounded-sm xl:rounded-md shadow-lg ${maxHeight} overflow-auto`}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 md:px-3 lg:px-3 xl:px-4 py-2 md:py-1.5 lg:py-1.5 xl:py-2 text-sm md:text-xs lg:text-xs xl:text-sm cursor-pointer hover:bg-blue-100 ${
                selected === option.value
                  ? "bg-blue-50 font-medium text-blue-700"
                  : ""
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p
          className={`${COLORS.errorText} text-sm md:text-xs lg:text-xs xl:text-sm mt-1 md:mt-0.5 lg:mt-0.5 xl:mt-1 pl-5 md:pl-4 lg:pl-4 xl:pl-5`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
