/**
 * Assessment.jsx — All five pillars on one scannable page.
 *
 * Single-select questions have no defaults: the point is an honest
 * read, not a fast one. Multi-select (visibility sources) may be
 * left empty — zero coverage is a valid, if grim, answer.
 */

import { PILLARS } from "../pillars.js";

export default function Assessment({ answers, onChange, onComplete }) {
  const singleQuestions = PILLARS.flatMap((p) =>
    p.questions.filter((q) => q.type === "single")
  );
  const answered = singleQuestions.filter((q) => answers[q.id] !== undefined);
  const complete = answered.length === singleQuestions.length;

  function selectSingle(qid, idx) {
    onChange({ ...answers, [qid]: idx });
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
        {PILLARS.map((pillar) => (
          <div className="question-block" key={pillar.id}>
            <div className="question-block__label">
              <span className="question-block__number">{pillar.order}</span>
              {pillar.name}
            </div>
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
                        onClick={() => selectSingle(q.id, idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

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
