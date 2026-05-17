# AP Precalc Study App

A free, self-contained AP Precalculus study app. Lessons for all 44 College Board CED topics, an interactive function grapher, a draggable unit circle, ~350 practice problems with worked solutions, spaced-repetition flashcards, two full timed mock exams, and an optional AI tutor — all running locally in the browser. No backend, no signup, no API keys.

![Status](https://img.shields.io/badge/status-v0.1-amber)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-Vite%20%2B%20React%20%2B%20TS%20%2B%20Tailwind-informational)

## Screenshots

> _Add your own screenshots in `/docs/screenshots/` and reference them here._
> Suggested shots: Home, a Lesson page with KaTeX + the embedded grapher, the Unit Circle, a Practice problem with feedback, the Dashboard with the activity heatmap, and the Mock Exam timer.

## What's inside

| Area | Notes |
|---|---|
| **All 44 CED topics** | Units 1–3 fully covered. Each lesson has the Topic ID, Learning Objectives, Essential Knowledge, worked examples, common pitfalls, vocabulary chips, and an embedded visualization. Unit 4 is intentionally omitted because it's not on the exam. |
| **Interactive grapher** | Up to four function plots, parameter sliders for `a*f(b*(x-c))+d`-style transformations, asymptote/zero/extrema overlays, polar mode, and a value table. |
| **Unit Circle simulator** | Drag the terminal ray; snap to special angles; live readouts of sin/cos/tan in exact form; live trace plots of sin and cos as θ sweeps. |
| **~350 practice problems** | Multiple choice and free response. Every problem is tagged with its CED topic, AP skill (1.A–3.C), difficulty (1–3), and a calculator-allowed flag. |
| **Spaced repetition flashcards** | SM-2 "lite" algorithm — Again/Hard/Good/Easy — over every vocab term. "Due today" count in the nav. |
| **Two full mock exams** | Real AP structure: Section I Part A (28 MC, 80 min, calc) + Part B (12 MC, 40 min, no calc) + Section II Part A (2 FRQ, 30 min, calc) + Part B (2 FRQ, 30 min, no calc). Per-section timer with auto-advance, mark-for-review navigator, and an end-of-exam score report with predicted AP score (1–5) and weakest-topic links. |
| **Dashboard** | Per-unit and per-skill mastery, daily streak, 90-day activity heatmap, full topic table, and JSON export/import of your progress. |
| **AI tutor** | Floating sparkle button. Uses [puter.js](https://js.puter.com/) — free, no API key, no signup. The tutor knows what lesson or problem you're on. If puter.js fails to load, the worked-solution fallback is one click away. |
| **Aesthetic** | Fraunces serif + IBM Plex Sans, ink-black on paper-cream, per-unit accents — amber for Unit 1, teal for Unit 2, violet for Unit 3. Persistent dark mode toggle. |
| **Storage** | Everything lives in `localStorage`. No tracking, no accounts. |

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router v6](https://reactrouter.com/) (HashRouter — works on GitHub Pages without server config)
- [Zustand](https://zustand-demo.pmnd.rs/) with `persist` middleware
- [KaTeX](https://katex.org/) via `react-katex` for math rendering
- [Plotly.js](https://plotly.com/javascript/) (dist-min) via `react-plotly.js/factory`
- [mathjs](https://mathjs.org/) for expression parsing and evaluation
- [lucide-react](https://lucide.dev/) for icons
- [puter.js](https://docs.puter.com/) for the optional AI tutor

---

## First-time setup — click-by-click

If you've never used Node or npm before, follow these instructions exactly. They assume you're on Windows; macOS/Linux instructions are essentially the same.

### 1. Install Node.js

1. Go to [https://nodejs.org/](https://nodejs.org/).
2. Click the big green button labeled **"LTS"** (Long-Term Support, recommended for most users).
3. Open the downloaded `.msi` file.
4. Click **Next** through every screen, accepting the defaults. When asked about "Tools for Native Modules," it's safe to **uncheck** that box.
5. Click **Install**, wait, then **Finish**.
6. Open a new terminal window (on Windows: press **Win + R**, type `powershell`, hit Enter).
7. Type `node --version` and press Enter. You should see something like `v20.x.x`. If you do, Node is installed.

### 2. Get the code

You have two options. Pick one:

**Option A — Download a ZIP (easiest):**

1. On the GitHub page, click the green **Code** button.
2. Choose **Download ZIP**.
3. Right-click the ZIP and **Extract All…**.
4. Note the path — say `C:\Users\you\ap-precalc-app`.

**Option B — Use git:**

1. Install Git from [https://git-scm.com/](https://git-scm.com/) (Next through every screen).
2. In the terminal:

```powershell
cd C:\Users\you
git clone https://github.com/YOUR-USERNAME/ap-precalc-app.git
```

### 3. Install dependencies

In the terminal, change into the project folder and install:

```powershell
cd C:\Users\you\ap-precalc-app
npm install
```

This takes 30–60 seconds the first time. You may see a few "warn" lines — those are normal, ignore them. You should NOT see any lines starting with "error".

### 4. Start the dev server

```powershell
npm run dev
```

You'll see something like:

```
  VITE v5.4.21  ready in 894 ms
  ➜  Local:   http://localhost:5173/
```

Open your browser and go to **http://localhost:5173/**. The app should load.

To stop the server later: press **Ctrl + C** in the terminal.

---

## Production build

```powershell
npm run build
```

The optimized build lands in `dist/`. Preview it locally:

```powershell
npm run preview
```

---

## Deploying

### Option 1 — GitHub Pages (recommended; matches this repo's existing setup)

1. Push your code to a GitHub repo named `ap-precalc-app` (or any name — adjust below).
2. In `package.json`, set `"homepage"` if you want a clean URL; leaving `"."` works fine for project pages.
3. Run:

```powershell
npm run deploy
```

   This builds the app and pushes `dist/` to a branch called `gh-pages`.

4. On GitHub, go to **Settings → Pages**. Under "Build and deployment", set **Source = Deploy from a branch**, **Branch = gh-pages**, **Folder = / (root)**. Hit **Save**.
5. Wait ~30 seconds. Your site goes live at `https://YOUR-USERNAME.github.io/ap-precalc-app/`.

The app uses HashRouter (URLs look like `/#/lesson/1.5`) precisely so this works without server-side routing config.

### Option 2 — Vercel (one click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR-USERNAME%2Fap-precalc-app)

1. Click the button above (after pushing the repo to GitHub).
2. Sign in to Vercel with GitHub.
3. Click **Deploy**. Vercel detects Vite automatically — no config needed.

### Option 3 — Netlify, Cloudflare Pages, S3, etc.

Any static host works. Build command: `npm run build`. Publish directory: `dist`.

---

## Project structure

```
ap-precalc-app/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json + tsconfig.app.json + tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx              ← React + HashRouter entry
    ├── App.tsx               ← layout, nav, route table, dark mode
    ├── index.css             ← Tailwind base + design tokens
    ├── routes/
    │   ├── Home.tsx
    │   ├── Unit.tsx
    │   ├── Lesson.tsx
    │   ├── Graph.tsx
    │   ├── UnitCircle.tsx
    │   ├── Practice.tsx
    │   ├── Flashcards.tsx
    │   ├── Exam.tsx
    │   └── Dashboard.tsx
    ├── components/
    │   ├── Grapher.tsx       ← Plotly + mathjs wrapper
    │   ├── UnitCircleSim.tsx ← SVG, drag, snap-to-special-angles
    │   ├── Math.tsx          ← KaTeX wrappers + RichText helper
    │   ├── ProblemCard.tsx
    │   └── TutorChat.tsx
    ├── data/
    │   ├── curriculum.ts     ← All 44 topics with LOs/EKs/skills
    │   ├── problems.ts       ← ~350 practice problems
    │   ├── vocab.ts          ← Flashcard deck
    │   └── mockExams.ts      ← Two full exam forms
    ├── lib/
    │   ├── sm2.ts            ← Spaced-repetition algorithm
    │   ├── grader.ts         ← Lenient answer matching
    │   ├── mathParser.ts     ← mathjs wrapper + sampling helpers
    │   └── tutor.ts          ← puter.js wrapper with fallback
    └── store/
        └── progress.ts       ← Zustand store, persisted to localStorage
```

---

## Adding your own content

- **A new problem.** Open `src/data/problems.ts`, find the topic section, and append a new entry using the `mc(...)` or `fr(...)` helper. Each problem needs `id`, `topicId`, `skill`, `difficulty`, `calculatorAllowed`, and either choices/correctIndex (MC) or expectedAnswer (FR), plus a `solution` array of steps.
- **A new vocab term.** Add to `src/data/vocab.ts` and reference its id from `topic.vocab` in `curriculum.ts`.
- **A new mock exam form.** Edit `src/data/mockExams.ts` — the helper `buildExam` will pick MC problems for you given seeds. Define FRQs inline with parts and rubrics.

---

## Credits

- Curriculum source: [College Board AP Precalculus Course and Exam Description (CED)](https://apcentral.collegeboard.org/media/pdf/ap-precalculus-course-and-exam-description.pdf). All Learning Objectives and Essential Knowledge statements have been paraphrased in our own words; the official CED is the source of truth.
- This app is **not endorsed by, sponsored by, or affiliated with** the College Board or the AP Program.
- AI tutor powered by [puter.js](https://js.puter.com/), which is free to use and requires no API key.

## License

MIT. Use freely for personal study or teaching.
