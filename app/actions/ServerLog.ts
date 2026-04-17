"use server";

import serverLogger from "@/utils/logger/serverLogger";

export async function ServerLog(userId: string, message: string) {
    serverLogger.info({ userId }, message);
}