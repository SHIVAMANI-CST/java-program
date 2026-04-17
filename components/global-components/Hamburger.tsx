import { ChevronLeft, Menu } from "lucide-react";
import Button from "@/components/global-components/Button";
import { HamburgerProps } from "@/types/home";

const Hamburger = ({
  isOpen,
  onClick,
  className = "",
  size = 24,
}: HamburgerProps) => {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      size="sm"
      className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${className}`}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      {isOpen ? (
        <ChevronLeft size={size} className="text-gray-700" />
      ) : (
        <Menu size={size} className="text-gray-700" />
      )}
    </Button>
  );
};

export default Hamburger;
