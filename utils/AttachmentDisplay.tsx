"use client";
import { getUrl } from "aws-amplify/storage";
import React, { useEffect, useState } from "react";
import logger from "@/utils/logger/browserLogger";

const AttachmentDisplay = ({ itemKey }: { itemKey: string }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!itemKey) return;
        getUrl({ path: itemKey })
            .then((res) => setUrl(res.url.href))
            .catch((err) => logger.error("Failed to get attachment URL", err));
    }, [itemKey]);

    if (!url)
        return (
            <div className="w-24 h-24 bg-gray-200 animate-pulse rounded-md inline-block mr-2" />
        );

    return (
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-gray-200 inline-block mr-2 align-top">
            <img src={url} alt="Attachment" className="w-full h-full object-cover" />
        </div>
    );
};

export default AttachmentDisplay;
