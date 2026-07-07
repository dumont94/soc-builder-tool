/**
 * scoring.js — Turns assessment answers into a posture read.
 *
 * Answers shape:
 *   single: { [questionId]: optionIndex }
 *   multi:  { [questionId]: Set/array of selected option ids }
 *
 * Each question scores 0–3. A pillar's score is the mean of its
 * questions; multi-select scores by coverage fraction. Levels:
 *   < 0.75 → 1 Ad Hoc · < 1.5 → 2 Reactive · < 2.25 → 3 Managed · else 4 Optimized
 *
 * The fix-first list takes the most severe named gaps, visibility
 * first — it's the foundation, so it gates everything else.
 */

import { PILLARS, LEVEL_NAMES, OVERALL_NARRATIVES } from "./pillars.js";

function levelFor(score) {
  if (score < 0.75) return 1;
  if (score < 1.5) return 2;
  if (score < 2.25) return 3;
  return 4;
}

export function computePosture(answers) {
  const gapsPool = [];

  const pillars = PILLARS.map((pillar) => {
    let total = 0;
    const gaps = [];

    for (const q of pillar.questions) {
      if (q.type === "multi") {
        const selected = new Set(answers[q.id] || []);
        total += (selected.size / q.options.length) * 3;
        for (const opt of q.options) {
          if (!selected.has(opt.id)) {
            gaps.push(opt.missingGap);
            gapsPool.push({ text: opt.missingGap, points: 0, order: pillar.order });
          }
        }
      } else {
        const idx = answers[q.id];
        const opt = q.options[idx];
        total += opt.points;
        if (opt.gap) {
          gaps.push(opt.gap);
          gapsPool.push({ text: opt.gap, points: opt.points, order: pillar.order });
        }
      }
    }

    const score = total / pillar.questions.length;
    const level = levelFor(score);
    return {
      id: pillar.id,
      order: pillar.order,
      name: pillar.name,
      score,
      level,
      levelName: LEVEL_NAMES[level],
      diagnosis: pillar.diagnosis[level],
      gaps,
    };
  });

  const overallScore = pillars.reduce((s, p) => s + p.score, 0) / pillars.length;
  const overallLevel = levelFor(overallScore);

  const sorted = [...pillars].sort((a, b) => a.score - b.score || a.order - b.order);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  let narrative = OVERALL_NARRATIVES[overallLevel];
  if (weakest.score < strongest.score) {
    narrative += ` Strongest pillar: ${strongest.name}. Weakest: ${weakest.name}.`;
  }
  const visibility = pillars.find((p) => p.id === "visibility");
  if (visibility.level <= 2 && overallLevel >= 2) {
    narrative += " Start with visibility — every other pillar is capped by what you can see.";
  }

  // Fix-first: most severe gaps, visibility-first tiebreak, max 5, deduped.
  const moves = [];
  const seen = new Set();
  for (const g of [...gapsPool].sort((a, b) => a.points - b.points || a.order - b.order)) {
    if (!seen.has(g.text)) {
      seen.add(g.text);
      moves.push(g.text);
    }
    if (moves.length === 5) break;
  }
  if (moves.length === 0) {
    moves.push("No structural gaps in this model — validate the posture instead: purple-team the detections, run the tabletop, and re-check the coverage map quarterly.");
  }

  return {
    pillars,
    overall: {
      score: overallScore,
      level: overallLevel,
      levelName: LEVEL_NAMES[overallLevel],
      narrative,
    },
    moves,
  };
}
