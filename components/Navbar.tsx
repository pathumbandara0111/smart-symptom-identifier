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
  History,
  LogOut,
  User,
  Menu,
  X,
  Shield,
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
          🩺 SymptomAI
        </Link>

        {/* Desktop Nav */}
        <ul className="nav-links">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link ${pathname === href ? "active" : ""}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {session ? (
            <>
              <Link href="/history" className="nav-link" style={{ display: "flex" }}>
                <History size={15} />
                <span className="hidden-mobile">History</span>
              </Link>
              {(session.user as any)?.role === "ADMIN" && (
                <Link href="/admin" className="nav-link" style={{ display: "flex" }}>
                  <Shield size={15} />
                  <span className="hidden-mobile">Admin</span>
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: "13px" }}
              >
                <LogOut size={14} />
                <span className="hidden-mobile">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                Sign In
              </Link>
              <Link href="/register" className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
            borderBottom: "1px solid var(--glass-border)",
            zIndex: 99,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              onClick={() => setMobileOpen(false)}
              style={{ fontSize: "16px", padding: "14px 16px" }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .hidden-mobile { display: none; }
        }
      `}</style>
    </>
  );
}
