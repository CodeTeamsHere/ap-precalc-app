import { create } from "zustand";
import { persist } from "zustand/middleware";
import { freshCard, isDue, review, type SM2Quality, type SM2State } from "../lib/sm2";

export type Theme = "light" | "dark";

export interface AttemptRecord {
  problemId: string;
  topicId: string;
  skill: string;
  difficulty: number;
  correct: boolean;
  timeMs: number;
  at: string; // ISO timestamp
}

export interface FlashcardEntry extends SM2State {
  id: string; // card id (vocab term or note id)
  lastReviewed: string | null;
}

interface ProgressState {
  theme: Theme;
  toggleTheme: () => void;

  attempts: AttemptRecord[]; // every problem attempt
  recordAttempt: (a: AttemptRecord) => void;

  /** Map from problemId → "correct on first try" boolean. */
  firstTryCorrect: Record<string, boolean>;

  // Per-day activity calendar — ISO date keys ("YYYY-MM-DD") → count.
  activity: Record<string, number>;
  streak: number;
  lastActiveDay: string | null;
  pingActivity: () => void;

  // Flashcards.
  cards: Record<string, FlashcardEntry>;
  ensureCard: (id: string) => FlashcardEntry;
  gradeCard: (id: string, q: SM2Quality) => void;
  dueFlashcardCount: () => number;

  // Mock exam attempts.
  examAttempts: ExamAttempt[];
  recordExamAttempt: (a: ExamAttempt) => void;

  // Per-topic mastery: rolling average over recent attempts.
  topicMastery: (topicId: string) => { attempted: number; correct: number; pct: number };
  skillMastery: (skill: string) => { attempted: number; correct: number; pct: number };

  exportProgress: () => string;
  importProgress: (json: string) => boolean;
  resetProgress: () => void;
}

export interface ExamAttempt {
  examId: string;
  startedAt: string;
  finishedAt: string;
  /** Per-question results, ordered by appearance in the exam. */
  responses: { questionId: string; correct: boolean; selected?: string | null }[];
  rawScore: number;
  maxScore: number;
  predictedAP: 1 | 2 | 3 | 4 | 5;
}

function todayKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayKey(d: Date = new Date()) {
  const yest = new Date(d.getTime() - 24 * 60 * 60 * 1000);
  return todayKey(yest);
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      theme: (typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light") as Theme,
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      attempts: [],
      firstTryCorrect: {},
      recordAttempt: (a) =>
        set((s) => {
          const attempts = [...s.attempts, a];
          const firstTryCorrect = { ...s.firstTryCorrect };
          if (!(a.problemId in firstTryCorrect)) {
            firstTryCorrect[a.problemId] = a.correct;
          }
          const day = todayKey(new Date(a.at));
          const activity = { ...s.activity, [day]: (s.activity[day] || 0) + 1 };
          return { attempts, firstTryCorrect, activity };
        }),

      activity: {},
      streak: 0,
      lastActiveDay: null,
      pingActivity: () =>
        set((s) => {
          const today = todayKey();
          if (s.lastActiveDay === today) return {};
          const newActivity = { ...s.activity };
          newActivity[today] = newActivity[today] || 1;
          let streak = s.streak;
          if (s.lastActiveDay === yesterdayKey()) streak = streak + 1;
          else if (s.lastActiveDay === today) streak = s.streak;
          else streak = 1;
          return { activity: newActivity, streak, lastActiveDay: today };
        }),

      cards: {},
      ensureCard: (id) => {
        const existing = get().cards[id];
        if (existing) return existing;
        const card: FlashcardEntry = { id, lastReviewed: null, ...freshCard() };
        set((s) => ({ cards: { ...s.cards, [id]: card } }));
        return card;
      },
      gradeCard: (id, q) => {
        const current = get().ensureCard(id);
        const next = review(current, q);
        set((s) => ({
          cards: {
            ...s.cards,
            [id]: { ...current, ...next, lastReviewed: new Date().toISOString() },
          },
        }));
      },
      dueFlashcardCount: () => {
        const cards = get().cards;
        let n = 0;
        for (const c of Object.values(cards)) if (isDue(c)) n++;
        return n;
      },

      examAttempts: [],
      recordExamAttempt: (a) =>
        set((s) => ({ examAttempts: [...s.examAttempts, a] })),

      topicMastery: (topicId) => {
        const recent = get().attempts.filter((a) => a.topicId === topicId);
        const attempted = recent.length;
        const correct = recent.filter((a) => a.correct).length;
        const pct = attempted ? Math.round((100 * correct) / attempted) : 0;
        return { attempted, correct, pct };
      },
      skillMastery: (skill) => {
        const recent = get().attempts.filter((a) => a.skill === skill);
        const attempted = recent.length;
        const correct = recent.filter((a) => a.correct).length;
        const pct = attempted ? Math.round((100 * correct) / attempted) : 0;
        return { attempted, correct, pct };
      },

      exportProgress: () => {
        const s = get();
        return JSON.stringify(
          {
            attempts: s.attempts,
            firstTryCorrect: s.firstTryCorrect,
            activity: s.activity,
            streak: s.streak,
            lastActiveDay: s.lastActiveDay,
            cards: s.cards,
            examAttempts: s.examAttempts,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      },
      importProgress: (json) => {
        try {
          const data = JSON.parse(json);
          set((s) => ({
            ...s,
            attempts: data.attempts ?? s.attempts,
            firstTryCorrect: data.firstTryCorrect ?? s.firstTryCorrect,
            activity: data.activity ?? s.activity,
            streak: data.streak ?? s.streak,
            lastActiveDay: data.lastActiveDay ?? s.lastActiveDay,
            cards: data.cards ?? s.cards,
            examAttempts: data.examAttempts ?? s.examAttempts,
          }));
          return true;
        } catch {
          return false;
        }
      },
      resetProgress: () =>
        set({
          attempts: [],
          firstTryCorrect: {},
          activity: {},
          streak: 0,
          lastActiveDay: null,
          cards: {},
          examAttempts: [],
        }),
    }),
    {
      name: "ap-precalc-progress",
      version: 1,
    }
  )
);
