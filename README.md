# SOC Posture — Five-Pillar Maturity Assessment

A portfolio project by Nigel Dumont.

A SOC's maturity rests on five pillars. This tool assesses each one honestly and outputs a **posture read** — not a checklist: where you stand, what's missing, and what to fix first.

**Live tool:** [dumont94.github.io/soc-builder-tool](https://dumont94.github.io/soc-builder-tool/)
**Portfolio:** [nigeldumont.github.io](https://dumont94.github.io/nigeldumont.github.io/)

---

## The Five Pillars

1. **Visibility** — the foundation. Coverage across endpoint, network, cloud, identity, and email; what's ingested vs. blind spots. You can't tune what you can't see.
2. **Detection Engineering** — custom rules vs. vendor defaults, MITRE ATT&CK coverage, detection-as-code. The tune-vs-triage split: mature SOCs fix the rule, immature ones just close the alert.
3. **Alert Management** — daily volume, false-positive rate, automation/SOAR coverage. Alert fatigue is the core burnout driver.
4. **Compliance Posture** — SOC 2 / HIPAA / PCI as the floor, not the goal. Passing ≠ secure.
5. **Organizational Standing** — reporting line (CISO vs. buried under IT), stakeholder comms during incidents, improvement roadmap. Respected = resourced.

## How It Works

- 14 assessment questions across the five pillars — single-select maturity states plus a telemetry-coverage multi-select where anything unchecked is counted as a named blind spot.
- Each answer scores 0–3; pillar scores map to four maturity levels: **Ad Hoc → Reactive → Managed → Optimized**.
- The posture read shows the overall level, a per-pillar bar chart, a "where you stand" diagnosis per pillar, the specific gaps your answers revealed, and a **Fix First** list — most severe gaps in priority order, visibility first, because every other pillar is capped by what you can see.

---

## Architecture

```
soc-builder-tool/
├── .github/workflows/deploy.yml   Builds and deploys to GitHub Pages on push to main
├── index.html
├── package.json        Vite + React 18
├── vite.config.js      base: /soc-builder-tool/
└── src/
    ├── App.jsx             Two screens: assessment → posture read
    ├── App.css             Single stylesheet, CSS custom properties, dark default
    ├── pillars.js          The model: questions, scoring points, gap text, per-level diagnoses
    ├── scoring.js          Answers → pillar levels, overall read, fix-first list
    └── components/
        ├── Assessment.jsx  All five pillars on one scannable page
        └── PostureRead.jsx Overall card + per-pillar reads + fix-first
```

**Design decisions:**

- **A posture read, not a checklist** — every answer maps to specific diagnosis and gap text, so the output reads like an assessment someone wrote for you, not a score.
- **No default answers** — the point is an honest read, not a fast one. Submit stays disabled until every question is answered.
- **Visibility gates everything** — it's the foundation pillar; the fix-first ordering and the overall narrative both treat low visibility as the first problem regardless of other scores.
- **All content in `src/pillars.js`** — the model, the language, and the diagnoses are one reviewable file.
- **Dark mode by default** — analysts live in dark dashboards.

---

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5174
```

Every push to `main` rebuilds and redeploys the Pages site via GitHub Actions.

---

## Extending the Model

Everything lives in `src/pillars.js`:

- **Add a question:** append to a pillar's `questions` with options carrying `points` (0–3) and optional `gap` text.
- **Change the language:** each pillar's per-level `diagnosis` and each option's `gap` string are plain text.
- **Add a pillar:** add an entry to `PILLARS` — scoring, bars, and the read pick it up automatically.
