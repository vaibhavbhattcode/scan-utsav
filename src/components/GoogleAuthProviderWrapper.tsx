"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const GoogleAuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  // Use a fallback generic client ID if not provided in env for UI testing
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1234567890-mockclientid.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
