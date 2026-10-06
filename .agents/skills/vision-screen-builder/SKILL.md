# Vision Screen Builder Skill

## Purpose
Checklist to run before marking any /vision screen as done.

## Pre-build
- [ ] Read vision-honesty.md and vision-design-system.md rules before writing a line of code
- [ ] Identify every metric and confirm it has a denominator and a timestamp classification
- [ ] Map each module to the correct 3-state chip: Built / Built (simplified today) / Backend built – UI planned / Planned

## Per-screen checklist (must pass before moving to next screen)

### Honesty
- [ ] Persistent amber `VisionBadge` visible in top bar (non-dismissible)
- [ ] Every module has a `StatusChip` visible
- [ ] "Built (simplified today)" chips include a tooltip explaining what the live version does and doesn't do
- [ ] All figures use "Q3 2024 Illustrative Sample" date framing
- [ ] Mock data uses distinct illustrative numbers (never "10 of 18" or live benchmark figures)
- [ ] `isMock: true` badge visible on any drill-down record
- [ ] AI text (if any): no banned phrases. Validate with validateAiText() utility.

### States
- [ ] Loading skeleton renders before data loads
- [ ] Empty state has icon + clear message
- [ ] Error state has retry button and descriptive message
- [ ] Hover/focus states visible on all interactive elements

### Accessibility
- [ ] WCAG AA contrast (min 4.5:1 text, 3:1 UI components)
- [ ] Visible focus ring on all keyboard-reachable elements (outline-2 outline-amber-400)
- [ ] Icon-only buttons have aria-label
- [ ] Custom widgets have correct role, aria-expanded, aria-controls
- [ ] useReducedMotion() used in every component with motion

### Performance
- [ ] 3D bundles and heavy charts imported with next/dynamic ssr:false
- [ ] No useEffect calls that block first render
- [ ] Images use next/image or explicit width/height

### Visual self-review (Checkpoint gate — MANDATORY)
Run Playwright capture, then answer all questions before reporting done:
1. Does the badge contrast sufficiently against the top bar? (amber on ink: yes/no)
2. Are hairline borders and glass surfaces visible without being muddy?
3. Is the typography hierarchy clear? (Playfair display → Inter body → Mono IDs)
4. Is whitespace consistent with the 8px grid?
5. Are denominators prominently placed, not buried?
6. Does any element distract without clarifying?
7. Do status chips read instantly (green=Built, slate=Planned)?
8. Are hover/focus states obvious at a glance?
If any answer is no — fix it before reporting done.
