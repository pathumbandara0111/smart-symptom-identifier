"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Activity,
  Camera,
  MapPin,
  Phone,
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="navbar sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-md border-b border-[#00B4D8]/15 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <Link href="/" className="nav-logo flex items-center gap-2 group">
            <span className="text-xl group-hover:scale-110 transition-transform">🩺</span>
            <span className="font-bold tracking-tight text-white font-['Outfit'] text-base md:text-lg">
              SmartSymptom <span className="text-[#00CFE8]">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Desktop Auth Controls */}
            {session ? (
              <div className="hidden sm:flex items-center gap-2">
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
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#EF476F] border-[#EF476F]/30 hover:bg-[#EF476F]/10"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn-secondary text-xs px-3.5 py-1.5 rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-xs px-3.5 py-1.5 rounded-lg font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile App Menu Trigger Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open mobile menu"
              className="md:hidden flex items-center justify-center p-2 rounded-lg bg-[#031525] border border-[#00B4D8]/25 text-[#00CFE8] active:scale-95 transition-transform"
            >
              {session?.user ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0077B6] to-[#00CFE8] flex items-center justify-center text-[10px] font-bold text-black">
                    {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                  </div>
                  <Menu size={18} />
                </div>
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Native Mobile App Slide-Over Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <aside
            className="relative w-4/5 max-w-sm h-full bg-[#020B18]/95 backdrop-blur-2xl border-l border-[#00B4D8]/20 flex flex-col justify-between p-5 z-10 shadow-2xl shadow-cyan-950/60 overflow-y-auto"
          >
            {/* Top Bar inside Drawer */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#00B4D8]/15">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🩺</span>
                  <span className="font-bold text-white text-base">SmartSymptom AI</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#051525] border border-[#00B4D8]/20 text-[#90E0EF] active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-[#051525] to-[#020B18] border border-[#00B4D8]/20">
                {session?.user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0077B6] to-[#00CFE8] flex items-center justify-center text-sm font-bold text-black">
                      {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {session.user.name || "Logged In User"}
                      </p>
                      <p className="text-[11px] text-[#90E0EF]/70 truncate">{session.user.email}</p>
                      <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#00CFE8]/15 text-[#00CFE8]">
                        {(session.user as any)?.role || "PATIENT"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-white">Welcome, Guest</p>
                    <p className="text-[11px] text-[#90E0EF]/70 mt-0.5">
                      Sign in to track your personal symptom history.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Link
                        href="/login"
                        className="btn-secondary flex-1 text-center py-1.5 text-xs rounded-lg"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="btn-primary flex-1 text-center py-1.5 text-xs rounded-lg"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links Group */}
              <div className="mt-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#90E0EF]/50 px-2 mb-1.5">
                  Main Services
                </p>

                <Link
                  href="/symptom-checker"
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/symptom-checker"
                      ? "bg-[#00CFE8]/15 text-[#00CFE8] font-semibold"
                      : "text-[#E0F7FF] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity size={16} className="text-[#00CFE8]" />
                    <span>Symptom Checker (Text)</span>
                  </div>
                  <ChevronRight size={14} className="text-[#90E0EF]/40" />
                </Link>

                <Link
                  href="/image-checker"
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/image-checker"
                      ? "bg-[#00CFE8]/15 text-[#00CFE8] font-semibold"
                      : "text-[#E0F7FF] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Camera size={16} className="text-[#00CFE8]" />
                    <span>Skin Lesion Analyzer (Photo)</span>
                  </div>
                  <ChevronRight size={14} className="text-[#90E0EF]/40" />
                </Link>

                <Link
                  href="/doctor-locator"
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/doctor-locator"
                      ? "bg-[#00CFE8]/15 text-[#00CFE8] font-semibold"
                      : "text-[#E0F7FF] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin size={16} className="text-[#00CFE8]" />
                    <span>Find Doctors & Hospitals</span>
                  </div>
                  <ChevronRight size={14} className="text-[#90E0EF]/40" />
                </Link>

                <Link
                  href="/first-aid"
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/first-aid"
                      ? "bg-[#00CFE8]/15 text-[#00CFE8] font-semibold"
                      : "text-[#E0F7FF] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={16} className="text-[#00CFE8]" />
                    <span>First Aid Emergency Guide</span>
                  </div>
                  <ChevronRight size={14} className="text-[#90E0EF]/40" />
                </Link>

                <Link
                  href="/emergency"
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors bg-[#EF476F]/10 border border-[#EF476F]/30 text-[#EF476F]`}
                >
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[#EF476F]" />
                    <span>1990 Emergency Hotline</span>
                  </div>
                  <span className="text-[10px] bg-[#EF476F] text-white px-1.5 py-0.5 rounded font-bold">
                    CALL
                  </span>
                </Link>
              </div>

              {/* Personal Section (When Logged In) */}
              {session && (
                <div className="mt-5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#90E0EF]/50 px-2 mb-1.5">
                    My Account
                  </p>
                  <Link
                    href="/history"
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs text-[#E0F7FF] hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-[#00B4D8]" />
                      <span>Past Diagnosis History</span>
                    </div>
                    <ChevronRight size={14} className="text-[#90E0EF]/40" />
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs text-[#E0F7FF] hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard size={16} className="text-[#00B4D8]" />
                      <span>Health Dashboard</span>
                    </div>
                    <ChevronRight size={14} className="text-[#90E0EF]/40" />
                  </Link>

                  {(session.user as any)?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-between p-2.5 rounded-xl text-xs text-[#00CFE8] bg-[#00CFE8]/10 border border-[#00CFE8]/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield size={16} />
                        <span>Hospital/Doctor Admin</span>
                      </div>
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Bottom of Drawer: Sign Out & Version */}
            <div className="pt-4 border-t border-[#00B4D8]/15">
              {session && (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#EF476F]/10 border border-[#EF476F]/25 text-[#EF476F] text-xs font-semibold active:scale-95 transition-all"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              )}
              <div className="text-center mt-3">
                <p className="text-[10px] text-[#90E0EF]/40 font-mono">
                  SmartSymptom AI v2.0 • Kaggle + Gemini
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
