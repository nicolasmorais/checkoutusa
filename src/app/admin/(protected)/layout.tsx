import { AdminShell } from "@/components/AdminShell";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
