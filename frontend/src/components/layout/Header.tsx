"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/calls": "Call Logs",
  "/messages": "Message Logs",
  "/sip-trunks": "SIP Trunk Health",
  "/carriers": "Carrier Performance",
  "/import": "Import Data",
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Role: <span className="font-medium text-gray-700">Admin</span>
        </span>
      </div>
    </header>
  );
}
