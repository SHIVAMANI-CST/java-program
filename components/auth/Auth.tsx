"use client";
import React from "react";

interface AuthProps {
  children: React.ReactNode;
}

const Auth: React.FC<AuthProps> = ({ children }) => {
  return <>{children}</>;
};

export default Auth;
