"use client";

import { ReactNode } from "react";
import { StealthProvider } from "@/contexts/StealthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <StealthProvider>
                <RealtimeProvider>{children}</RealtimeProvider>
            </StealthProvider>
        </ThemeProvider>
    );
}

