// hooks/useTypewriter.ts
import { useState, useEffect, useRef } from "react";

export const useTypewriter = (
  text: string,
  speed: number = 30,
  onComplete?: () => void
) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) return;

    setIsTyping(true);
    indexRef.current = 0;
    setDisplayText("");

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.substring(0, indexRef.current + 1));
        indexRef.current++;
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    typeNextChar();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return { displayText, isTyping };
};
