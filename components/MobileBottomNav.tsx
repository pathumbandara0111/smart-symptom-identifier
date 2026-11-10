"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Camera, Home, BookOpen, Phone } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav inside admin dashboard if desired, or keep everywhere
  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/symptom-checker", label: "Check", icon: Activity },
    { href: "/image-checker", label: "Scan", icon: Camera, isCenter: true },
    { href: "/first-aid", label: "First Aid", icon: BookOpen },
    { href: "/emergency", label: "1990", icon: Phone, isAlert: true },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#000000]/90 backdrop-blur-xl border-t border-[#00B4D8]/20 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5 relative group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isActive
                      ? "bg-gradient-to-tr from-[#0077B6] to-[#00CFE8] text-black shadow-[#00CFE8]/50 ring-2 ring-[#00CFE8]"
                      : "bg-[#031024] text-[#00CFE8] border border-[#00CFE8]/40 shadow-black/60 group-active:scale-95"
                  }`}
                >
                  <Icon size={22} className={isActive ? "text-black stroke-[2.5]" : "text-[#00CFE8]"} />
                </div>
                <span
                  className={`text-[10px] font-medium mt-1 transition-colors ${
                    isActive ? "text-[#00CFE8] font-semibold" : "text-[#90E0EF]/80"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          if (tab.isAlert) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-transform active:scale-95"
              >
                <div
                  className={`relative p-1.5 rounded-full transition-colors ${
                    isActive ? "bg-[#EF476F]/25 text-[#EF476F]" : "text-[#EF476F]"
                  }`}
                >
                  <Icon size={19} className="stroke-[2.2] animate-pulse" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EF476F] rounded-full" />
                </div>
                <span
                  className={`text-[10px] font-semibold mt-0.5 ${
                    isActive ? "text-[#EF476F]" : "text-[#EF476F]/90"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all active:scale-95 ${
                isActive ? "text-[#00CFE8]" : "text-[#90E0EF]/60 hover:text-[#90E0EF]"
              }`}
            >
              <div
                className={`relative p-1 rounded-md transition-all ${
                  isActive ? "bg-[#00CFE8]/15" : ""
                }`}
              >
                <Icon size={19} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
              </div>
              <span
                className={`text-[10px] font-medium mt-0.5 transition-colors ${
                  isActive ? "text-[#00CFE8] font-semibold" : "text-[#90E0EF]/70"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
