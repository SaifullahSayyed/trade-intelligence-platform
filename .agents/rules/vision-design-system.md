# Vision Design System Rules (always-on)

## Palette (design tokens in frontend/vision/ui/tokens.ts)
- ink base: #0B1020 to #141A47
- surface glass: bg-v-surface with 1px border border-v-border
- ivory text: #F0EDE4
- amber accent: #F59E0B (matches live app badge)
- teal verified: #0D9488
- confidence: HIGH=#10B981 MEDIUM=#F59E0B LOW=#EF4444
- status chips: Built=teal Built(simplified)=blue Backend/planned=slate Planned=gray

## Typography (via CSS vars --font-display --font-ui --font-mono)
- Display/headings: Playfair Display (serif) via next/font/google, font-display class
- UI labels/body: Inter via next/font/google, font-ui class
- IDs/scores/hashes: JetBrains Mono via next/font/google, font-mono class

## Motion (framer-motion)
- Default easing: 150-300ms ease-out
- Staggered reveal: staggerChildren 0.05s on container mount
- Respect prefers-reduced-motion via useReducedMotion() hook
- No gratuitous animation. Every motion must clarify or guide attention.

## Surfaces
- GlassPanel: bg-v-surface/90 backdrop-blur-xl border border-v-border shadow-lg
- Header hairline: 1px top border gradient transparent→accent→transparent
- 8px grid, 12-16px radii, generous whitespace around hero elements

## 3D Performance
- Cap pixel ratio: dpr={[1, 1.5]}
- frameloop="demand" on R3F canvases (render on interaction only)
- Always provide a static 2D fallback if WebGL fails (check WebGLRenderingContext)
- Lazy-load: next/dynamic with ssr:false for all 3D and heavy chart bundles

## Charts
- Recharts ResponsiveContainer for all charts
- Tooltips: always show value + denominator + source label
- Time series: ComposedChart Area (CI band) + Line (mean), animated draw-in
- Consistent dark chart theme matching ink palette

## Tech Constraints
- Stay on: Next.js 14, TypeScript, Tailwind 3. Pinned deps only (see plan).
- No API calls from /vision to live backends. 100% offline mock data.
- Performance: first meaningful paint < 2s on production build at port 3100
- WCAG AA contrast, visible focus rings (outline-2 outline-amber-400), ARIA on custom widgets
