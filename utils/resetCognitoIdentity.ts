import { fetchAuthSession, signOut } from "aws-amplify/auth";
import logger from "@/utils/logger/browserLogger";

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function resetCognitoIdentity() {
    try {
        sessionStorage.setItem("COGNITO_IDENTITY_RESET", "true");
        await signOut({ global: false });
        await fetchAuthSession({ forceRefresh: true });
    } catch (error) {
        logger.info("Failed to reset Cognito identity", error);
    }
}
