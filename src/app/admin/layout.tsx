import type { Metadata } from "next";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { Toaster } from "sonner";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "West and Row",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <RegisterServiceWorker />
      {children}
      <Toaster richColors position="top-right" />
    </SessionProviderWrapper>
  );
}
