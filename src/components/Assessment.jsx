/**
 * Assessment.jsx — Five pillars as an accordion.
 *
 * Each pillar is a collapsible card: collapsed shows just the name and
 * completion state, expanded shows the framing and questions. The first
 * pillar starts open; completing a pillar collapses it and opens the
 * next incomplete one, so the page stays scannable end to end.
 *
 * Single-select questions have no defaults: the point is an honest
 * read, not a fast one. Multi-select (visibility sources) may be left
 * empty — zero coverage is a valid, if grim, answer.
 */

import { useState } from "react";
import { PILLARS } from "../pillars.js";

function singlesOf(pillar) {
  return pillar.questions.filter((q) => q.type === "single");
}

function pillarComplete(pillar, answers) {
  return singlesOf(pillar).every((q) => answers[q.id] !== undefined);
}

export default function Assessment({ answers, onChange, onComplete }) {
  const [open, setOpen] = useState(() => new Set([PILLARS[0].id]));

  const singleQuestions = PILLARS.flatMap(singlesOf);
  const answered = singleQuestions.filter((q) => answers[q.id] !== undefined);
  const complete = answered.length === singleQuestions.length;

  function toggle(pillarId) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(pillarId) ? next.delete(pillarId) : next.add(pillarId);
      return next;
    });
  }

  function selectSingle(pillar, qid, idx) {
    const next = { ...answers, [qid]: idx };
    onChange(next);

    // Completing a pillar collapses it and opens the next incomplete one
    if (pillarComplete(pillar, next)) {
      const following = PILLARS.find(
        (p) => p.order > pillar.order && !pillarComplete(p, next)
      );
      setOpen((prev) => {
        const opened = new Set(prev);
        opened.delete(pillar.id);
        if (following) opened.add(following.id);
        return opened;
      });
    }
  }

  function toggleMulti(qid, optId) {
    const current = new Set(answers[qid] || []);
    current.has(optId) ? current.delete(optId) : current.add(optId);
    onChange({ ...answers, [qid]: [...current] });
  }

  return (
    <div className="questionnaire">
      {/* ── Hero ── */}
      <div className="questionnaire__hero">
        <div className="questionnaire__eyebrow">SOC Posture Tool</div>
        <h1 className="questionnaire__title">Where does your SOC actually stand?</h1>
        <p className="questionnaire__subtitle">
          A SOC's maturity rests on five pillars. Assess each one honestly
          and get a posture read — where you stand, what's missing, and
          what to fix first.
        </p>
        <p className="questionnaire__byline">Built by Nigel Dumont</p>
      </div>

      <div className="questionnaire__form">
        {PILLARS.map((pillar) => {
          const isOpen = open.has(pillar.id);
          const singles = singlesOf(pillar);
          const done = singles.filter((q) => answers[q.id] !== undefined).length;
          const isComplete = done === singles.length;

          return (
            <div
              className={isOpen ? "pillar-acc pillar-acc--open" : "pillar-acc"}
              key={pillar.id}
            >
              {/* ── Header (always visible) ── */}
              <div
                className="pillar-acc__header"
                onClick={() => toggle(pillar.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => e.key === "Enter" && toggle(pillar.id)}
              >
                <span className="question-block__number">{pillar.order}</span>
                <span className="pillar-acc__name">{pillar.name}</span>
                <span
                  className={
                    isComplete
                      ? "pillar-acc__status pillar-acc__status--done"
                      : "pillar-acc__status"
                  }
                >
                  {isComplete ? "✓ complete" : `${done}/${singles.length}`}
                </span>
                <span className={isOpen ? "pillar-acc__chevron pillar-acc__chevron--open" : "pillar-acc__chevron"}>
                  ▾
                </span>
              </div>

              {/* ── Body (questions) ── */}
              {isOpen && (
                <div className="pillar-acc__body">
                  <p className="pillar-framing">{pillar.framing}</p>

                  {pillar.questions.map((q) => (
                    <div className="pillar-question" key={q.id}>
                      <div className="question-block__title">{q.prompt}</div>
                      {q.hint && <p className="pillar-hint">{q.hint}</p>}

                      {q.type === "multi" ? (
                        <div className="option-grid">
                          {q.options.map((opt) => {
                            const selected = (answers[q.id] || []).includes(opt.id);
                            return (
                              <OptionCard
                                key={opt.id}
                                label={opt.label}
                                desc={opt.desc}
                                selected={selected}
                                onClick={() => toggleMulti(q.id, opt.id)}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="option-grid option-grid--2col">
                          {q.options.map((opt, idx) => (
                            <OptionCard
                              key={idx}
                              label={opt.label}
                              selected={answers[q.id] === idx}
                              onClick={() => selectSingle(pillar, q.id, idx)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Submit ── */}
        <div className="questionnaire__submit">
          <button
            className="btn btn--primary btn--lg btn--full"
            disabled={!complete}
            onClick={onComplete}
          >
            {complete
              ? "Read My Posture →"
              : `Answer all questions to continue (${answered.length}/${singleQuestions.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── OptionCard subcomponent ───────────────────────────────────────

function OptionCard({ label, desc, selected, onClick }) {
  return (
    <div
      className={selected ? "option-card option-card--selected" : "option-card"}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {selected && <span className="option-card__check" />}
      <div className="option-card__title">{label}</div>
      {desc && <div className="option-card__desc">{desc}</div>}
    </div>
  );
}
