import React from "react";
import Button from "@/components/global-components/Button";
import BasicModal from "@/components/global-components/Modal";

interface ResetPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const ResetPriorityModal: React.FC<ResetPriorityModalProps> = ({
  isOpen,
  onClose,
  onReset,
}) => {
  return (
    <BasicModal
      width="600px"
      open={isOpen}
      onClose={onClose}
      title="Reset Priority Models"
    >
      <div className="space-y-3 md:space-y-3 lg:space-y-3 xl:space-y-4">
        <p className="text-sm md:text-xs lg:text-xs xl:text-sm mt-3">
          Are you sure you want to reset your priority models?
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-1.5 lg:gap-1.5 xl:gap-2">
          <Button
            onClick={onClose}
            className=" text-sm md:text-xs lg:text-xs xl:text-sm px-4 md:px-3 lg:px-3 xl:px-4 py-2 md:py-1.5 lg:py-1.5 xl:py-2"
            variant="secondary"
            buttonWidth="md"
          >
            Cancel
          </Button>
          <Button
            onClick={onReset}
            className="text-sm md:text-xs lg:text-xs xl:text-sm px-4 md:px-3 lg:px-3 xl:px-4 py-2 md:py-1.5 lg:py-1.5 xl:py-2"
            variant="gradient"
            buttonWidth="md"
          >
            Reset
          </Button>
        </div>
      </div>
    </BasicModal>
  );
};

export default ResetPriorityModal;
