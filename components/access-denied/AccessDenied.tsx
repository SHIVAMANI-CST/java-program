import Image from "next/image";
import ArrowLeft from "@/public/arrow-left.svg";
import WarningIcon from "@/public/warning.svg";

export const AccessDenied = ({ onGoBack }: { onGoBack: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <Image
            src={WarningIcon}
            alt="Warning"
            width={80}
            height={80}
            className="text-red-500"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          403 - Access Denied
        </h1>

        <p className="text-lg text-gray-600">
          You do not have permission to view this conversation.
        </p>

        <div className="flex justify-center pt-2">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 cursor-pointer px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Image
              src={ArrowLeft}
              alt="Back"
              width={18}
              height={18}
              className="opacity-90"
            />
            Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
