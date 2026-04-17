import React from "react";
import Button from "@/components/global-components/Button";
import BasicModal from "@/components/global-components/Modal";

interface ResetPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleSetDefaultPriority: () => void;
}

const RestorePriorityModal: React.FC<ResetPriorityModalProps> = ({
  isOpen,
  onClose,
  handleSetDefaultPriority,
}) => {
  return (
    <BasicModal
      open={isOpen}
      onClose={onClose}
      title="Restore Default Priority Models"
      width="600px"
    >
      <div className="space-y-3 md:space-y-3 lg:space-y-3 xl:space-y-4">
        <p className="text-sm md:text-xs lg:text-xs xl:text-sm mt-4">
          Are you sure you want to set your priority models to the default
          settings? This will overwrite your current priority model selections.
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-1.5 lg:gap-1.5 xl:gap-2 pt-4">
          <Button
            onClick={onClose}
            className="text-sm md:text-xs lg:text-xs xl:text-sm px-4 md:px-3 lg:px-3 xl:px-4 py-2 md:py-1.5 lg:py-1.5 xl:py-2"
            buttonWidth="md"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSetDefaultPriority}
            className="text-sm md:text-xs lg:text-xs xl:text-sm px-4 md:px-3 lg:px-3 xl:px-4 py-2 md:py-1.5 lg:py-1.5 xl:py-2"
            buttonWidth="md"
            variant="gradient"
          >
            Restore
          </Button>
        </div>
      </div>
    </BasicModal>
  );
};

export default RestorePriorityModal;
