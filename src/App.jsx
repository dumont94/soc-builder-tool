import { useState, useEffect } from "react";
import Assessment from "./components/Assessment.jsx";
import PostureRead from "./components/PostureRead.jsx";
import { computePosture } from "./scoring.js";

const SCREENS = { ASSESS: "assess", READ: "read" };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.ASSESS);
  const [answers, setAnswers] = useState({});
  const [posture, setPosture] = useState(null);
  // SOC tools default to dark — analysts live in dark dashboards
  const [theme, setTheme] = useState(
    () => localStorage.getItem("soc-theme") || "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("soc-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function handleComplete() {
    setPosture(computePosture(answers));
    setScreen(SCREENS.READ);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Back to the assessment with answers intact, for adjusting
  function handleAdjust() {
    setScreen(SCREENS.ASSESS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setAnswers({});
    setPosture(null);
    setScreen(SCREENS.ASSESS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__logo">
          <div className="app-header__dot" />
          <div>
            <div className="app-header__title">SOC Posture</div>
            <div className="app-header__sub">by Nigel Dumont</div>
          </div>
        </div>
        <div className="app-header__right">
          {posture && screen === SCREENS.READ && (
            <div className="app-header__badge">{posture.overall.levelName}</div>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀ light" : "☾ dark"}
          </button>
          <a
            className="app-header__back"
            href="https://dumont94.github.io/nigeldumont.github.io/"
          >
            ← portfolio
          </a>
        </div>
      </header>

      <main className="main">
        {screen === SCREENS.ASSESS && (
          <Assessment
            answers={answers}
            onChange={setAnswers}
            onComplete={handleComplete}
          />
        )}

        {screen === SCREENS.READ && posture && (
          <PostureRead
            posture={posture}
            onAdjust={handleAdjust}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
