"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { EMAIL_VARIABLES, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY, renderEmailPreview } from "@/lib/email-templates";

export function EmailTemplateFormClient({
  initial,
}: {
  initial: { subject: string; bodyHtml: string };
}) {
  const [subject, setSubject] = useState(initial.subject);
  const [bodyHtml, setBodyHtml] = useState(initial.bodyHtml);
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const preview = useMemo(() => renderEmailPreview(subject, bodyHtml), [subject, bodyHtml]);

  function insertVariable(key: string) {
    const textarea = bodyRef.current;
    const token = `{{${key}}}`;
    if (!textarea) {
      setBodyHtml((v) => v + token);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = bodyHtml.slice(0, start) + token + bodyHtml.slice(end);
    setBodyHtml(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
    });
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/email-template", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, bodyHtml }),
    });
    setSaving(false);
    if (res.ok) toast.success("Email template saved");
    else toast.error("Failed to save template");
  }

  function handleReset() {
    setSubject(DEFAULT_EMAIL_SUBJECT);
    setBodyHtml(DEFAULT_EMAIL_BODY);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order confirmation email</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Sent automatically when a payment is confirmed.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
          >
            <RotateCcw size={14} />
            Reset to default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save template"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Subject line</label>
            <input
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <label className="mb-1.5 mt-4 block text-sm font-medium text-neutral-700">Email body (HTML)</label>
            <textarea
              ref={bodyRef}
              rows={18}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold">Dynamic variables</h2>
            <p className="mb-3 text-xs text-neutral-500">
              Click to insert at your cursor. They&apos;re replaced with real order data when the email is sent.
            </p>
            <div className="flex flex-wrap gap-2">
              {EMAIL_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  title={v.description}
                  onClick={() => insertVariable(v.key)}
                  className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 font-mono text-xs text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100"
                >
                  {"{{"}
                  {v.key}
                  {"}}"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold">Live preview</h2>
          <p className="mb-3 text-xs text-neutral-500">Rendered with sample order data.</p>
          <div className="mb-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
            <span className="text-neutral-400">Subject: </span>
            <span className="font-medium text-neutral-900">{preview.subject}</span>
          </div>
          <div className="overflow-hidden rounded-md border border-neutral-200">
            <iframe title="Email preview" srcDoc={preview.html} className="h-[560px] w-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
