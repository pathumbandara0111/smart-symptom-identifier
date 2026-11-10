"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Activity,
  Camera,
  MapPin,
  Phone,
  BookOpen,
  LogOut,
  LayoutDashboard,
  Shield,
  Clock,
  LogIn,
} from "lucide-react";

const navItems = [
  { href: "/symptom-checker", label: "Check Symptoms", icon: Activity },
  { href: "/image-checker", label: "Upload Photo", icon: Camera },
  { href: "/first-aid", label: "First Aid", icon: BookOpen },
  { href: "/doctor-locator", label: "Doctors", icon: MapPin },
  { href: "/emergency", label: "Emergency", icon: Phone },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="navbar sticky top-0 z-30 bg-[#000000]/80 backdrop-blur-md border-b border-[#00B4D8]/15 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        {/* Brand Logo */}
        <Link href="/" className="nav-logo flex items-center gap-2 group">
          <span className="text-xl group-hover:scale-110 transition-transform">🩺</span>
          <span className="font-bold tracking-tight text-white font-['Outfit'] text-base md:text-lg">
            SmartSymptom <span className="text-[#00CFE8]">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links (Completely hidden on mobile) */}
        <ul className="nav-links hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`nav-link flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "text-[#00CFE8] bg-[#00CFE8]/10 shadow-[0_0_12px_rgba(0,207,232,0.25)]"
                      : "text-[#90E0EF]/80 hover:text-white hover:bg-white/5"
                  }`}
                  style={href === "/emergency" ? { color: "#EF476F", fontWeight: 600 } : undefined}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Auth Buttons: Visible on both Desktop and Mobile */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              {/* Desktop-only extra user tabs */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/history"
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <Clock size={13} />
                  <span>History</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <LayoutDashboard size={13} />
                  <span>Dashboard</span>
                </Link>
                {(session.user as any)?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00CFE8] border-[#00CFE8]/40"
                  >
                    <Shield size={13} />
                    <span>Admin</span>
                  </Link>
                )}
              </div>

              {/* Sign Out Button (Visible on mobile and desktop) */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#EF476F] border-[#EF476F]/30 hover:bg-[#EF476F]/10 active:scale-95 transition-all"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Sign In Button (Visible on mobile and desktop) */}
              <Link
                href="/login"
                className="btn-secondary flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-medium active:scale-95 transition-all"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </Link>
              {/* Desktop-only Get Started button */}
              <Link
                href="/register"
                className="btn-primary hidden md:inline-flex text-xs px-3.5 py-1.5 rounded-lg font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
