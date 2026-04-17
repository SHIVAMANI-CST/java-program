import { showErrorToast } from "@/utils/toastUtils";

export const attachmentConfig = {
    MAX_FILES: 5,
    MAX_SIZE: 3 * 1024 * 1024, // 3MB
    ALLOWED_TYPES: ["image/png", "image/jpeg", "image/gif", "image/webp"],
};

export interface FileValidationResult {
    validFiles: File[];
    hasSizeError: boolean;
    hasCountError: boolean;
    hasTypeError: boolean;
}

export const validateFiles = (
    newFiles: File[],
    currentCount: number
): FileValidationResult => {
    const validFiles: File[] = [];
    let hasSizeError = false;
    let hasTypeError = false;

    newFiles.forEach((file) => {
        if (!attachmentConfig.ALLOWED_TYPES.includes(file.type)) {
            hasTypeError = true;
        } else if (file.size > attachmentConfig.MAX_SIZE) {
            hasSizeError = true;
        } else {
            validFiles.push(file);
        }
    });

    if (hasTypeError) {
        showErrorToast("Unsupported file type. Only PNG, JPG, GIF, and WEBP are allowed.");
    }

    if (hasSizeError) {
        showErrorToast("Max file size is 3MB.");
    }

    // Enforce max file count
    const availableSlots = attachmentConfig.MAX_FILES - currentCount;
    const filesToAdd = validFiles.slice(0, availableSlots);
    const hasCountError = filesToAdd.length < validFiles.length;

    if (hasCountError) {
        showErrorToast(`Max ${attachmentConfig.MAX_FILES} files allowed.`);
    }

    return {
        validFiles: filesToAdd,
        hasSizeError,
        hasCountError,
        hasTypeError,
    };
};
