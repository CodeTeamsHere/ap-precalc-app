import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, NavLink, Link } from "react-router-dom";
import { useProgress } from "./store/progress";
import TutorChat from "./components/TutorChat";

const Home = lazy(() => import("./routes/Home"));
const Unit = lazy(() => import("./routes/Unit"));
const Lesson = lazy(() => import("./routes/Lesson"));
const Graph = lazy(() => import("./routes/Graph"));
const UnitCircle = lazy(() => import("./routes/UnitCircle"));
const Practice = lazy(() => import("./routes/Practice"));
const Flashcards = lazy(() => import("./routes/Flashcards"));
const Exam = lazy(() => import("./routes/Exam"));
const Dashboard = lazy(() => import("./routes/Dashboard"));

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/unit/1", label: "Unit 1" },
  { to: "/unit/2", label: "Unit 2" },
  { to: "/unit/3", label: "Unit 3" },
  { to: "/graph", label: "Grapher" },
  { to: "/unit-circle", label: "Unit Circle" },
  { to: "/practice", label: "Practice" },
  { to: "/flashcards", label: "Flashcards" },
  { to: "/exam", label: "Exam" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function App() {
  const theme = useProgress((s) => s.theme);
  const toggleTheme = useProgress((s) => s.toggleTheme);
  const dueToday = useProgress((s) => s.dueFlashcardCount());
  const streak = useProgress((s) => s.streak);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // Heartbeat: count today as active if user is using the app.
  useEffect(() => {
    useProgress.getState().pingActivity();
  }, []);

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur bg-[color:var(--bg)]/85 border-b border-[color:var(--line)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="font-display text-xl tracking-tight">
            <span className="text-[color:var(--accent)]">π</span>recalc
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-2 overflow-x-auto">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-md text-sm focusring ${
                    isActive
                      ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                      : "hover:bg-[color:var(--bg-soft)]"
                  }`
                }
              >
                {n.label}
                {n.to === "/flashcards" && dueToday > 0 ? (
                  <span className="ml-1 inline-block min-w-[1.4rem] text-center text-[10px] font-semibold rounded-full bg-[color:var(--accent)] text-white px-1.5">
                    {dueToday}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="chip" title="Daily streak (days with ≥1 activity)">
              🔥 {streak}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? "☀︎" : "☾"}
            </button>
          </div>
        </div>
        <MobileNav />
      </header>

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-6xl mx-auto p-8 text-sm text-[color:var(--ink-soft)]">
              Loading…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/unit/:unitId" element={<Unit />} />
            <Route path="/lesson/:topicId" element={<Lesson />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/unit-circle" element={<UnitCircle />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:topicId" element={<Practice />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/exam/:examId" element={<Exam />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="*"
              element={
                <div className="max-w-3xl mx-auto p-8">
                  <h1 className="text-3xl">404</h1>
                  <p className="mt-2">
                    Page not found. <Link className="underline" to="/">Back home</Link>.
                  </p>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-[color:var(--line)] py-6">
        <div className="max-w-6xl mx-auto px-4 text-xs text-[color:var(--ink-soft)] flex flex-wrap gap-2 justify-between">
          <span>
            Curriculum derived from the College Board AP Precalculus Course and Exam Description.
            This app is not endorsed by College Board.
          </span>
          <span>v0.1 · made for self-study</span>
        </div>
      </footer>

      <TutorChat />
    </div>
  );
}

function MobileNav() {
  return (
    <nav
      className="md:hidden overflow-x-auto border-t border-[color:var(--line)]"
      aria-label="Primary mobile"
    >
      <div className="flex gap-1 px-2 py-1.5">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `whitespace-nowrap px-2.5 py-1.5 rounded-md text-xs focusring ${
                isActive
                  ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                  : "hover:bg-[color:var(--bg-soft)]"
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
