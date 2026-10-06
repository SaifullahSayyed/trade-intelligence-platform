import { useEffect, useRef, useState } from "react";

export default function CobeSmoke() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>("initialising…");
  const [arcCount, setArcCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!canvasRef.current) return;

    const hasWebGL = !!window.WebGLRenderingContext;
    if (!hasWebGL) {
      setStatus("FAIL: WebGL not available — 2D fallback required");
      return;
    }

    let globe: { destroy: () => void } | null = null;
    let phi = 0;

    import("cobe").then(({ default: createGlobe }) => {
      const ARCS = [
        { from: [22.3193, 114.1694] as [number, number], to: [34.0522, -118.2437] as [number, number] },
        { from: [1.3521, 103.8198] as [number, number], to: [51.5074, -0.1278] as [number, number] },
        { from: [13.7563, 100.5018] as [number, number], to: [40.7128, -74.0060] as [number, number] },
      ];

      try {
        globe = createGlobe(canvasRef.current!, {
          devicePixelRatio: 1,
          width: 600,
          height: 600,
          phi: 0,
          theta: 0.3,
          dark: 1,
          diffuse: 1.4,
          mapSamples: 12000,
          mapBrightness: 5,
          baseColor: [0.1, 0.15, 0.3],
          markerColor: [0.95, 0.62, 0.04],
          glowColor: [0.1, 0.2, 0.5],
          markers: [
            { location: [22.3193, 114.1694], size: 0.05 }, // HKG
            { location: [1.3521, 103.8198], size: 0.05 },  // SIN
            { location: [13.7563, 100.5018], size: 0.05 }, // BKK
            { location: [34.0522, -118.2437], size: 0.05 },// LAX
            { location: [51.5074, -0.1278], size: 0.05 },  // LHR
            { location: [40.7128, -74.0060], size: 0.05 }, // JFK
          ],
          onRender: (state) => {
            state.phi = phi;
            phi += 0.003;
          },
        });
        setStatus(`PASS: cobe@0.6.3 rendered successfully with WebGL (markers mode)`);
        setArcCount(6);
      } catch (err) {
        setStatus(`FAIL: ${err}`);
      }
    });

    return () => {
      globe?.destroy();
    };
  }, []);

  return (
    <div style={{ background: "#0B1020", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 32 }}>
      <h1 style={{ color: "#F0EDE4", fontFamily: "monospace", fontSize: 18 }}>cobe Arc Smoke Test</h1>

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        style={{ width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }}
      />

      <div style={{
        padding: "12px 20px",
        borderRadius: 8,
        background: status.startsWith("PASS") ? "rgba(16,185,129,0.15)" : status.startsWith("FAIL") ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
        border: `1px solid ${status.startsWith("PASS") ? "#10B981" : status.startsWith("FAIL") ? "#EF4444" : "#F59E0B"}`,
        color: status.startsWith("PASS") ? "#34D399" : status.startsWith("FAIL") ? "#FCA5A5" : "#FCD34D",
        fontFamily: "monospace",
        fontSize: 14,
        textAlign: "center",
        maxWidth: 480,
      }}>
        {status}
        {arcCount > 0 && <div style={{ marginTop: 4, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{arcCount} arcs rendered (HKG→LAX · SIN→LHR · BKK→JFK)</div>}
      </div>

      <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: 12 }}>
        Smoke test only — this page will be removed after verification.
      </p>
    </div>
  );
}
