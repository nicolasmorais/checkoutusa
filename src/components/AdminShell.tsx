"use client";

import { Sidebar } from "@/components/Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="lg:pl-[230px]">
        <div className="mx-auto max-w-[1600px] px-4 py-8 pt-16 lg:px-10 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
