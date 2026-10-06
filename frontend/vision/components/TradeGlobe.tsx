import React, { useEffect, useRef, useState } from "react";
import { MOCK_PORTS, MOCK_CORRIDORS } from "../mock/corridors";
import { MockCorridor, MockPort } from "../mock/types";
import { StatusChip } from "../ui/StatusChip";
import { MockLabel } from "../ui/MockLabel";
import { ShieldAlert, Compass, Anchor, ArrowRight } from "lucide-react";

interface TradeGlobeProps {
  selectedCorridorId: string;
  onSelectCorridor: (corridorId: string) => void;
}

export const TradeGlobe: React.FC<TradeGlobeProps> = ({
  selectedCorridorId,
  onSelectCorridor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(true);

  const activeCorridor =
    MOCK_CORRIDORS.find((c) => c.id === selectedCorridorId) || MOCK_CORRIDORS[0];

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;

    const hasWebGL = !!(
      window.WebGLRenderingContext &&
      (canvasRef.current.getContext("webgl") ||
        canvasRef.current.getContext("experimental-webgl"))
    );

    if (!hasWebGL) {
      setWebGlAvailable(false);
      return;
    }

    let globe: { destroy: () => void } | null = null;
    let phi = 0;

    // Load cobe dynamically
    import("cobe").then(({ default: createGlobe }) => {
      if (!canvasRef.current) return;

      const markers = MOCK_PORTS.map((port) => ({
        location: [port.lat, port.lng] as [number, number],
        size: port.congestionLevel === "HIGH" ? 0.07 : 0.05,
      }));

      try {
        globe = createGlobe(canvasRef.current, {
          devicePixelRatio: 1,
          width: 520,
          height: 520,
          phi: 0,
          theta: 0.35,
          dark: 1,
          diffuse: 1.3,
          mapSamples: 14000,
          mapBrightness: 4.8,
          baseColor: [0.08, 0.12, 0.24],
          markerColor: [0.96, 0.62, 0.04],
          glowColor: [0.12, 0.22, 0.45],
          markers,
          onRender: (state) => {
            state.phi = phi;
            phi += 0.003;
          },
        });
      } catch (err) {
        console.warn("cobe initialization error:", err);
        setWebGlAvailable(false);
      }
    });

    return () => {
      globe?.destroy();
    };
  }, []);

  // Filter ports belonging to current corridor
  const corridorPorts = MOCK_PORTS.filter((p) =>
    activeCorridor.primaryPorts.includes(p.code)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* 3D GLOBE / 2D FALLBACK DISPLAY */}
      <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[360px] sm:min-h-[420px]">
        {webGlAvailable ? (
          <div className="relative group">
            <canvas
              ref={canvasRef}
              width={520}
              height={520}
              className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full drop-shadow-[0_0_35px_rgba(245,158,11,0.15)] cursor-grab active:cursor-grabbing"
              aria-label="3D Interactive Trade Lane Globe"
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>18 Monitored Global Terminals</span>
            </div>
          </div>
        ) : (
          <div className="w-[320px] h-[320px] rounded-full bg-gradient-to-br from-[#101935] to-[#070b14] border border-[#1E2A45] flex flex-col items-center justify-center p-6 text-center">
            <Compass className="w-12 h-12 text-amber-400/60 mb-2" />
            <p className="text-xs font-mono text-slate-300">2D Cartographic Fallback</p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              WebGL hardware acceleration inactive in current viewport.
            </p>
          </div>
        )}
      </div>

      {/* CORRIDOR TELEMETRY & SELECTOR */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              Maritime Corridor Horizon
            </span>
          </div>
          <StatusChip type="planned" />
        </div>

        {/* Corridor Pill Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MOCK_CORRIDORS.slice(0, 4).map((corridor) => {
            const isSelected = corridor.id === activeCorridor.id;
            return (
              <button
                key={corridor.id}
                type="button"
                onClick={() => onSelectCorridor(corridor.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-sm"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isSelected ? "text-amber-400 font-bold" : "text-slate-500"}>
                    {corridor.id}
                  </span>
                  <span>{corridor.q3TotalShipments} shipments</span>
                </div>
                <div className="text-xs font-medium truncate font-sans">{corridor.name}</div>
              </button>
            );
          })}
        </div>

        {/* Active Corridor Card */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">Selected Corridor</span>
              <h4 className="text-sm font-semibold text-white">{activeCorridor.name}</h4>
            </div>
            <MockLabel size="xs" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center font-mono">
            <div className="p-2 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-slate-500 block">Avg Transit</span>
              <span className="text-sm font-bold text-white">{activeCorridor.avgTransitDays}d</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-slate-500 block">Active Lanes</span>
              <span className="text-sm font-bold text-white">{activeCorridor.activeLanes} lanes</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-slate-500 block">Q3 Volume</span>
              <span className="text-sm font-bold text-amber-300">{activeCorridor.q3TotalShipments} BOLs</span>
            </div>
          </div>

          {/* Primary Ports along Corridor */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Key Terminals & Congestion Index
            </span>
            <div className="flex flex-wrap gap-1.5">
              {corridorPorts.map((port) => (
                <div
                  key={port.code}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs font-mono"
                >
                  <span className="text-white font-semibold">{port.code}</span>
                  <span className="text-slate-400 text-[10px]">({port.country})</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      port.congestionLevel === "HIGH"
                        ? "bg-rose-400"
                        : port.congestionLevel === "NORMAL"
                        ? "bg-amber-400"
                        : "bg-teal-400"
                    }`}
                    title={`Congestion: ${port.congestionLevel}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeGlobe;
