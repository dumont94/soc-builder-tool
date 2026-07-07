/**
 * PostureRead.jsx — The output: a posture read, not a checklist.
 *
 *   1. Overall card — maturity level, narrative, five-pillar bar chart
 *   2. Per-pillar reads — level chip, "where you stand", "what's missing"
 *   3. Fix first — the most severe gaps in priority order
 */

export default function PostureRead({ posture, onAdjust, onReset }) {
  const { pillars, overall, moves } = posture;

  return (
    <div className="summary">
      {/* ── 1. Overall ── */}
      <div className="summary__path-card">
        <div className="summary__path-badge">Your posture read</div>
        <h1 className="summary__path-name">{overall.levelName} SOC</h1>
        <p className="summary__path-tagline">Level {overall.level} of 4 across the five pillars</p>

        <div className="pillar-bars">
          {pillars.map((p) => (
            <div className="pillar-bar" key={p.id}>
              <span className="pillar-bar__name">{p.name}</span>
              <div className="pillar-bar__track">
                <div
                  className={`pillar-bar__fill pillar-bar__fill--l${p.level}`}
                  style={{ width: `${Math.max((p.score / 3) * 100, 4)}%` }}
                />
              </div>
              <span className={`level-chip level-chip--${p.level}`}>{p.levelName}</span>
            </div>
          ))}
        </div>

        <p className="summary__path-desc">{overall.narrative}</p>
      </div>

      {/* ── 2. Per-pillar reads ── */}
      {pillars.map((p) => (
        <div className="section" key={p.id}>
          <div className="section__header pillar-read__header">
            <div className="section__icon">{p.order}</div>
            <div className="section__title">{p.name}</div>
            <span className={`level-chip level-chip--${p.level}`}>
              {p.levelName} · {p.level}/4
            </span>
          </div>
          <div className="section__body">
            <p className="section__text">{p.diagnosis}</p>
            {p.gaps.length > 0 && (
              <>
                <p className="pillar-read__gaps-label">What's missing</p>
                <ul className="dayone-list">
                  {p.gaps.map((g, i) => (
                    <li key={i} className="dayone-item">
                      <span className="dayone-item__text">{g}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ))}

      {/* ── 3. Fix first ── */}
      <div className="section">
        <div className="section__header">
          <div className="section__icon">→</div>
          <div className="section__title">Fix First</div>
        </div>
        <div className="section__body">
          <ol className="config-steps">
            {moves.map((m, i) => (
              <li key={i} className="config-step">
                <span className="config-step__text">{m}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="summary__actions">
        <button className="btn btn--ghost" onClick={onAdjust}>
          ← Adjust Answers
        </button>
        <button className="btn btn--secondary" onClick={onReset}>
          Start Over
        </button>
      </div>
    </div>
  );
}
