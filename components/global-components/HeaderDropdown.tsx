import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SelectOption } from "@/types/stepper";

interface StyledDropdownProps {
  idx: number;
  priorityKey: string;
  labels: Record<string, string | undefined>;
  filteredOptions: SelectOption[];
  selectedModels: string[];
  handleSelect: (idx: number, value: string) => void;
}

const HeaderDropdown: React.FC<StyledDropdownProps> = ({
  idx,
  priorityKey,
  labels,
  filteredOptions,
  selectedModels,
  handleSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const disabled = idx > 0 && !selectedModels[idx - 1];
  const selectedLabel =
    filteredOptions.find((o) => o.value === selectedModels[idx])?.label ||
    labels[priorityKey];

  // Update dropdown position when opened
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      let dropdownWidth = 176;

      if (screenWidth >= 1280) {
        dropdownWidth = 176; // w-44 (xl:w-44)
      } else if (screenWidth >= 1024) {
        dropdownWidth = 144; // w-36 (lg:w-36)
      } else if (screenWidth >= 768) {
        dropdownWidth = 144; // w-40 (md:w-40)
      } else {
        dropdownWidth = 128; // w-44 (base: w-44)
      }

      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX -5,
        width: dropdownWidth,
      });
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);


  const dropdownMenu = open && (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-[100] max-h-60 overflow-y-auto"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
      }}
    >
      {/* Real options */}
      {filteredOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            handleSelect(idx, option.value);
            setOpen(false);
          }}
          className={`w-full text-left px-2.5 md:px-2.5 lg:px-2.5 xl:px-3 py-1.5 md:py-1.5 lg:py-1.5 xl:py-2 text-[10px] md:text-xs lg:text-xs xl:text-sm rounded-md hover:bg-gray-100 ${
            option.value === selectedModels[idx]
              ? "bg-gray-200 font-normal"
              : ""
          }`}
        >
          <span className="truncate block">{option.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div
        className={`relative flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full shadow-sm px-1.5 md:px-1.5 lg:px-1.5 xl:px-2 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 cursor-pointer transition-all ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center justify-between w-28 md:w-32 lg:w-32 xl:w-40 text-[10px] md:text-xs lg:text-xs xl:text-xs text-gray-800 font-medium focus:outline-none disabled:opacity-50 cursor-pointer transition-all"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            size={12}
            className={`ml-0.5 md:ml-0.5 lg:ml-0.5 xl:ml-1 text-gray-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Portal dropdown menu */}
      {typeof document !== "undefined" &&
        dropdownMenu &&
        createPortal(dropdownMenu, document.body)}
    </>
  );
};

export default HeaderDropdown;
