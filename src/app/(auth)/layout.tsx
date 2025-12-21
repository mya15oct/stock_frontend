import { StealthProvider } from "@/contexts/StealthContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StealthProvider>
      <div className="bg-[#2E2E3E] flex items-center justify-center p-4">
        {children}
      </div>
    </StealthProvider>
  );
}

