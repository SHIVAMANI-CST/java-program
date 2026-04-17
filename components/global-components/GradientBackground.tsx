"use client";
import React from "react";

const GradientBackground = () => {
  return (
    <>
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(142, 94, 255, 0.35)",
          filter: "blur(120px)",
          transform: "translate(50%, -50%)",
        }}
      />
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(255, 133, 94, 0.2)",
          filter: "blur(180px)",
          transform: "translate(-100px, -80px)",
        }}
      />
    </>
  );
};

export default GradientBackground;
