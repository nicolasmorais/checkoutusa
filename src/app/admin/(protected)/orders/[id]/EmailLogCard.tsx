"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmailLogRow = {
  id: string;
  type: string;
  toEmail: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
};

export function EmailLogCard({ orderId, logs }: { orderId: string; logs: EmailLogRow[] }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setSending(true);
    const res = await fetch(`/api/orders/${orderId}/resend-email`, { method: "POST" });
    setSending(false);
    if (res.ok) {
      toast.success("Confirmation email sent");
    } else {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Failed to send email");
    }
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Emails</h2>
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          <Send size={12} />
          {sending ? "Sending..." : "Resend confirmation"}
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-neutral-400">No emails sent for this order yet.</p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">
                  {log.type === "confirmation" ? "Order confirmation" : log.type}
                </p>
                <p className="text-xs text-neutral-500">
                  To {log.toEmail} ·{" "}
                  {new Date(log.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                {log.status === "failed" && log.errorMessage && (
                  <p className="mt-1 text-xs text-red-600">{log.errorMessage}</p>
                )}
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  log.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}
              >
                {log.status === "sent" ? "Sent" : "Failed"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
