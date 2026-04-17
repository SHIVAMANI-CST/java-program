import React, { useEffect, useState } from "react";

// Add this export for use in Header
export const ProgressBar = ({ isLoading }: { isLoading: boolean }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 10;
          return Math.min(prev + increment, 90);
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (progress === 0 && !isLoading) return null;

  return (
    <div className="fixed top-11 md:top-12 xl:top-14 left-0 right-0 z-50 h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#FF855E] via-[#FFA386] to-[#D66CBF] transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(255, 133, 94, 0.5)",
        }}
      />
    </div>
  );
};

export default ProgressBar;
