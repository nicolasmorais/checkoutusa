import { cn } from "@/lib/utils";

export function IntegrationCard({
  letter,
  color,
  title,
  connected,
  children,
  className,
}: {
  letter: string;
  color: string;
  title: string;
  connected: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {letter}
          </span>
          <h2 className="font-medium text-neutral-900">{title}</h2>
        </div>
        <StatusBadge connected={connected} />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        connected ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-green-600" : "bg-neutral-400")} />
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}

export function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
