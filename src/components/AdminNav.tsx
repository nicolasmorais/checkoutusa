"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/pixels", label: "Pixels" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold">Checkout Admin</span>
          <div className="flex gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2 py-1 text-neutral-600 hover:text-neutral-900",
                  pathname?.startsWith(link.href) && "bg-neutral-100 font-medium text-neutral-900"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PushNotificationToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
