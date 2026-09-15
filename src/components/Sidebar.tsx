"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Truck,
  Code2,
  Mail,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badgeKey: "pending" as const, divider: true },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/pixels", label: "Pixels", icon: Code2 },
  { href: "/admin/email", label: "Email", icon: Mail },
  { href: "/admin/checkout-settings", label: "Checkout", icon: Settings },
];

type DashboardStats = { pendingOrders: number };

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name ?? "Admin";

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-neutral-900 p-2 text-white shadow-lg lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col overflow-hidden border-r border-[#171717] bg-[#050505] transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-[75px] flex-shrink-0 items-center justify-between px-4">
          <div className="flex items-center text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://pub-da9fd1c19b8e45d691d67626b9a7ba6d.r2.dev/1789446453059-ChatGPT-Image-15-de-set.-de-2026,-01_22_53.png"
              alt="Checkout"
              className="h-14 w-auto flex-shrink-0 object-contain"
            />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1 text-neutral-400 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              const Icon = link.icon;
              const badgeCount = link.badgeKey === "pending" ? stats?.pendingOrders : undefined;
              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex h-11 items-center rounded-[5px] px-3.5 text-[13px] font-medium transition-colors duration-150",
                      isActive ? "bg-[#f5f5f5] font-semibold text-[#151515]" : "text-[#7d7d83] hover:bg-[#111] hover:text-[#e7e7e7]"
                    )}
                  >
                    <span className="mr-2 flex w-[25px] flex-shrink-0 items-center">
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="flex-1 whitespace-nowrap">{link.label}</span>
                    {!!badgeCount && (
                      <span className="ml-auto rounded-[3px] bg-[#f3f3f3] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#111]">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                  {link.divider && <div className="mx-1 my-3.5 h-px bg-[#181818]" />}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer user */}
        <div ref={menuRef} className="relative flex-shrink-0 border-t border-[#111] bg-[#050505] p-3">
          {menuOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 overflow-hidden rounded-[5px] border border-[#242424] bg-[#181818] shadow-lg">
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#7d7d83] hover:bg-[#202020] hover:text-[#e7e7e7]"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-12 w-full items-center rounded-[5px] border border-[#242424] bg-[#181818] px-2.5 transition-colors duration-150 hover:bg-[#202020]"
          >
            <span className="mr-2.5 flex h-[29px] w-[29px] flex-shrink-0 items-center justify-center rounded-full bg-[#030303]">
              <User size={16} className="text-[#828282]" />
            </span>
            <span className="flex-1 truncate text-left text-xs font-medium text-[#77777e]">{name}</span>
            <ChevronRight size={14} className="text-[#696969]" />
          </button>
        </div>
      </aside>
    </>
  );
}
