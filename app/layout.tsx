import "./globals.css";
import ProvidersWrapper from "./providers-wrapper";
import { FONT_MONO_FAMILY, FONT_SANS_FAMILY } from "@/styles/fonts";

export const metadata = {
  title: "CinfyAI - Your AI Companion",
  description:
    "Experience the power of AI with CinfyAI, your personal assistant for productivity and creativity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${FONT_SANS_FAMILY} ${FONT_MONO_FAMILY} antialiased min-h-dvh`}
      >
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}
