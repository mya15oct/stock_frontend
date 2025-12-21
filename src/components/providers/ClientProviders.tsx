"use client";

import { ReactNode } from "react";
import { StealthProvider } from "@/contexts/StealthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { AuthProvider } from "@/contexts/AuthContext";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <StealthProvider>
                    <RealtimeProvider>{children}</RealtimeProvider>
                </StealthProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

