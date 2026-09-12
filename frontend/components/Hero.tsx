import React from "react";
import { motion } from "framer-motion";

const INK = "#ffffff";
const avatars = [
  "linear-gradient(135deg, #38bdf8, #0284c7)", // Ocean Blue
  "linear-gradient(135deg, #34d399, #059669)", // Emerald Verification
  "linear-gradient(135deg, #f59e0b, #d97706)", // Gold Manifest
];

const steps = [
  {
    n: "01",
    label: "CBP Ingest",
    icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
  },
  {
    n: "02",
    label: "Canonical Schema",
    icon: <><rect x="3" y="4" width="14" height="10" rx="2" /><path d="M7 20h6M10 14v6" /></>
  },
  {
    n: "03",
    label: "Entity Match",
    icon: <path d="M17 20v-2a4 4 0 0 0-3-3.87M11 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM15 4.5a3 3 0 0 1 0 5.8" />
  },
  {
    n: "04",
    label: "Trust Evidence",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  }
];

export default function Hero() {
  return (
    <section id="overview" style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Background Video */}
      <video
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Overlays — matching design specification */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.20) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.60) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "5%",
          width: "700px",
          height: "700px",
          background: "radial-gradient(ellipse at 30% 30%, rgba(14,116,144,0.12) 0%, transparent 65%)",
          pointerEvents: "none"
        }}
      />

      {/* Left Content */}
      <div style={{ position: "absolute", left: "6vw", top: "17vh", zIndex: 10, maxWidth: "660px" }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "17px" }}
        >
          <div style={{ display: "flex", padding: "3px", background: "rgba(255,255,255,0.14)", borderRadius: "999px" }}>
            {avatars.map((bg, i) => (
              <span
                key={i}
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  background: bg,
                  border: "2px solid rgba(20,20,25,0.6)",
                  marginLeft: i === 0 ? 0 : "-8px"
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: 500, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>
            +10,000 Verified Shipments • U.S. Ocean Manifest Corridor
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.22, ease: "easeOut" }}
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 500,
            fontSize: "clamp(2.2rem, 5.1vw, 4.25rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.01em",
            color: INK,
            textShadow: "0 2px 30px rgba(0,0,0,0.5)"
          }}
        >
          Audit <em style={{ fontStyle: "italic", fontWeight: 500 }}>Global Trade</em><br />
          The Verifiable Way
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          style={{
            margin: "17px 0 0",
            maxWidth: "480px",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.80)",
            fontWeight: 500,
            textShadow: "0 1px 14px rgba(0,0,0,0.5)"
          }}
        >
          Grounded trade intelligence on U.S. ocean vessel manifests. Resolve canonical entities with Splink, verify provenance across raw and normalized values, and cite verified records.
        </motion.p>

        {/* CTA Button */}
        <motion.a
          href="#dashboard"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.54, ease: "easeOut" }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "27px",
            padding: "7px 22px 7px 7px",
            borderRadius: "14px",
            background: "#1c1c22",
            border: "1px solid rgba(255,255,255,0.22)",
            textDecoration: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            cursor: "pointer"
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </span>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>
            Launch Live Pipeline
          </span>
        </motion.a>
      </div>

      {/* Steps Row (4-step onboarding / pipeline stages) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: "6vw",
          bottom: "16vh",
          zIndex: 10,
          display: "flex",
          gap: "14px"
        }}
      >
        {steps.map((step) => (
          <div key={step.n} style={{ width: "88px" }}>
            <div
              style={{
                height: "76px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke={INK}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {step.icon}
              </svg>
              <span style={{ fontSize: "10.5px", fontWeight: 600, color: INK, lineHeight: 1.2 }}>
                {step.label}
              </span>
            </div>
            <div style={{ marginTop: "9px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{step.n}</span>
              <div
                style={{
                  marginTop: "5px",
                  width: "22px",
                  height: "2px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.45)"
                }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
