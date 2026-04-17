import { useState } from "react";
import { getPresignedUrl } from "@/graph/queries";
import { useUserId } from "@/lib/getUserId";
import { client } from "@/utils/amplifyGenerateClient";
import logger from "@/utils/logger/browserLogger";

export const useUploadAttachments = () => {
    const [isUploading, setIsUploading] = useState(false);
    const userId = useUserId();

    const uploadFiles = async (
        filesToUpload: File[],
        targetConversationId: string
    ): Promise<string[]> => {
        if (filesToUpload.length === 0 || !userId) return [];

        setIsUploading(true);
        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                try {
                    // 1. Get Presigned URL
                    const { data: presignedDataJson } = await client.graphql({
                        query: getPresignedUrl,
                        variables: {
                            fileName: file.name,
                            contentType: file.type,
                            conversationId: targetConversationId,
                            size: file.size,
                        },
                    });

                    const presignedResult = presignedDataJson?.getPresignedUrl;

                    if (!presignedResult) {
                        throw new Error("Failed to get presigned URL");
                    }

                    const { url, key } = JSON.parse(presignedResult);

                    // 2. Upload to S3
                    const uploadResponse = await fetch(url, {
                        method: "PUT",
                        body: file,
                        headers: {
                            ["Content-Type"]: file.type,
                        },
                    });

                    if (!uploadResponse.ok) {
                        throw new Error(
                            `Upload failed with status ${uploadResponse.status}`
                        );
                    }

                    return key;
                } catch (error) {
                    logger.error(`Error uploading file ${file.name}:`, error);
                    return null; // Handle error gracefully
                }
            });

            const results = await Promise.all(uploadPromises);
            return results.filter((key): key is string => key !== null);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadFiles,
        isUploading,
    };
};
