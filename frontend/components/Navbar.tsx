import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const INK = "#ffffff";
const navLinks = [
  { label: "Overview", href: "/" },
  { label: "Manifest Search", href: "/search" },
  { label: "Entity Review", href: "/review" },
  { label: "Company Profile", href: "/company/walmart-stores-east-lp" },
  { label: "Data Contracts", href: "/#contracts" }
];

export default function Navbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 36px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}
    >

      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="28" height="28" rx="9" stroke={INK} strokeWidth="1.5" />
          <g fill="none" stroke={INK} strokeWidth="1.3">
            <ellipse cx="16" cy="11.2" rx="2.3" ry="3.3" />
            <ellipse cx="16" cy="20.8" rx="2.3" ry="3.3" />
            <ellipse cx="11.2" cy="16" rx="3.3" ry="2.3" />
            <ellipse cx="20.8" cy="16" rx="3.3" ry="2.3" />
          </g>
          <circle cx="16" cy="16" r="1.7" fill={INK} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "20px", fontWeight: 600, color: INK, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
            Orchid
          </span>
          <span style={{ fontSize: "8.5px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
            Trade Intelligence
          </span>
        </div>
      </Link>

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "18px"
        }}
        className="hidden md:flex"
      >
        {navLinks.map((link, i) => (
          <div key={link.label} style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            {i > 0 && (
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.4)"
                }}
              />
            )}
            <Link
              href={link.href}
              style={{
                fontSize: "13.5px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.78)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = INK;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.78)";
              }}
            >
              {link.label}
            </Link>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            cursor: "pointer"
          }}
        >
          US Corridor
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
        <Link href="/search" style={{ display: "flex", alignItems: "center", color: "inherit" }} title="Search manifests">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
        </Link>
        <Link href="/#dashboard" style={{ display: "flex", alignItems: "center", color: "inherit" }} title="Platform control room">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
