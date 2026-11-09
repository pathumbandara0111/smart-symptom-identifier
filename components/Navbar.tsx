"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="nav-logo">
          <span>🩺</span> SmartSymptom AI
        </Link>

        {/* Desktop Nav */}
        <ul className="nav-links hidden md:flex">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link ${pathname === href ? "active" : ""}`}
                style={href === "/emergency" ? { color: "#EF476F", fontWeight: 600 } : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {session ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/history"
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: "13px" }}
              >
                <Clock size={14} />
                <span>History</span>
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: "13px" }}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>
              {(session.user as any)?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "13px", borderColor: "rgba(0, 207, 232, 0.4)", color: "var(--accent)" }}
                >
                  <Shield size={14} />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: "13px", borderColor: "rgba(239, 71, 111, 0.3)", color: "#EF476F" }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                Sign In
              </Link>
              <Link href="/register" className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            left: 0,
            right: 0,
            background: "rgba(2, 11, 24, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--glass-border)",
            zIndex: 99,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              onClick={() => setMobileOpen(false)}
              style={{ fontSize: "16px", padding: "12px 16px", color: href === "/emergency" ? "#EF476F" : undefined }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid var(--glass-border)", marginTop: "10px", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {session ? (
              <>
                <Link href="/history" className="nav-link" onClick={() => setMobileOpen(false)} style={{ fontSize: "15px" }}>
                  <Clock size={16} /> History
                </Link>
                <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)} style={{ fontSize: "15px" }}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                {(session.user as any)?.role === "ADMIN" && (
                  <Link href="/admin" className="nav-link" onClick={() => setMobileOpen(false)} style={{ fontSize: "15px", color: "var(--accent)" }}>
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center", color: "#EF476F" }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <Link href="/login" className="btn-secondary" onClick={() => setMobileOpen(false)} style={{ flex: 1, justifyContent: "center" }}>
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ flex: 1, justifyContent: "center" }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
