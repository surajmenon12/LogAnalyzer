"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  MessageSquare,
  Network,
  Building2,
  Upload,
} from "lucide-react";

const iconMap = {
  LayoutDashboard,
  Phone,
  MessageSquare,
  Network,
  Building2,
  Upload,
};

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" as const },
  { label: "Call Logs", href: "/calls", icon: "Phone" as const },
  { label: "Messages", href: "/messages", icon: "MessageSquare" as const },
  { label: "SIP Trunks", href: "/sip-trunks", icon: "Network" as const },
  { label: "Carriers", href: "/carriers", icon: "Building2" as const },
  { label: "Import Data", href: "/import", icon: "Upload" as const },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight">Plivo</h1>
        <p className="text-sm text-gray-400 mt-1">Log Analysis Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">admin@plivo.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
