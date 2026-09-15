import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      {children}
      <Toaster richColors position="top-right" />
    </SessionProviderWrapper>
  );
}
