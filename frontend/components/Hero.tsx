import React, { useState } from "react";
import { motion } from "framer-motion";

const INK = "#ffffff";
const avatars = [
  "linear-gradient(135deg, #38bdf8, #0284c7)",
  "linear-gradient(135deg, #34d399, #059669)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
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
  const [bgMode, setBgMode] = useState<"video" | "port" | "cargoship" | "harbor">("video");

  return (
    <section id="overview" style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>

      {bgMode === "video" ? (
        <video
          key="ship-video"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          autoPlay
          muted
          loop
          playsInline
          poster="/images/cargo-ship-cinematic.jpg"
        >
          <source src="/hero-ship.webm" type="video/webm" />
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      ) : bgMode === "port" ? (
        <div
          key="port-photo"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/images/port-terminal-cinematic.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.75) contrast(1.1)",
          }}
        />
      ) : bgMode === "cargoship" ? (
        <div
          key="cargo-photo"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/images/cargo-ship-cinematic.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.75) contrast(1.1)",
          }}
        />
      ) : (
        <div
          key="harbor-photo"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/images/harbor-dusk.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.48) 55%, rgba(0,0,0,0.30) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.75) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "5%",
          width: "700px",
          height: "700px",
          background: "radial-gradient(ellipse at 30% 30%, rgba(14,116,144,0.18) 0%, transparent 65%)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "absolute",
          right: "40px",
          top: "100px",
          zIndex: 20,
          display: "flex",
          gap: "6px",
          padding: "4px 6px",
          borderRadius: "999px",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)"
        }}
        className="hidden sm:flex"
      >
        <button
          onClick={() => setBgMode("video")}
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: bgMode === "video" ? "rgba(255,255,255,0.25)" : "transparent",
            color: bgMode === "video" ? "#fff" : "rgba(255,255,255,0.65)",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}
        >
          🚢 Live Vessel Video
        </button>
        <button
          onClick={() => setBgMode("port")}
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: bgMode === "port" ? "rgba(255,255,255,0.25)" : "transparent",
            color: bgMode === "port" ? "#fff" : "rgba(255,255,255,0.65)",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}
        >
          🏗️ Port Terminal
        </button>
        <button
          onClick={() => setBgMode("cargoship")}
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: bgMode === "cargoship" ? "rgba(255,255,255,0.25)" : "transparent",
            color: bgMode === "cargoship" ? "#fff" : "rgba(255,255,255,0.65)",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}
        >
          🌊 Cargo Mega-Ship
        </button>
        <button
          onClick={() => setBgMode("harbor")}
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: bgMode === "harbor" ? "rgba(255,255,255,0.25)" : "transparent",
            color: bgMode === "harbor" ? "#fff" : "rgba(255,255,255,0.65)",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}
        >
          🌅 Harbor Dusk
        </button>
      </div>

      <div style={{ position: "absolute", left: "6vw", top: "17vh", zIndex: 10, maxWidth: "660px" }}>

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
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: 500, textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
            +10,000 Verified Shipments • U.S. Ocean Manifest Corridor
          </span>
        </motion.div>

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
            textShadow: "0 2px 30px rgba(0,0,0,0.6)"
          }}
        >
          Audit <em style={{ fontStyle: "italic", fontWeight: 500 }}>Global Trade</em><br />
          The Verifiable Way
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          style={{
            margin: "17px 0 0",
            maxWidth: "480px",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 500,
            textShadow: "0 1px 14px rgba(0,0,0,0.6)"
          }}
        >
          Grounded trade intelligence on U.S. ocean vessel manifests. Resolve canonical entities with Splink, verify provenance across raw and normalized values, and cite verified records.
        </motion.p>

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
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
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
