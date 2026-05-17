import { lazy, Suspense } from "react";

const UnitCircleSim = lazy(() => import("../components/UnitCircleSim"));

export default function UnitCircle() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header>
        <h1 className="font-display text-4xl">Unit Circle</h1>
        <p className="mt-2 text-[color:var(--ink-soft)] max-w-prose">
          Drag the terminal point to change the angle. Special angles (multiples of π/6 and π/4) snap into place
          and show their exact sine and cosine values. Use arrow keys for fine control.
        </p>
      </header>
      <div className="mt-6 card p-0 overflow-hidden">
        <Suspense fallback={<div className="h-[480px] flex items-center justify-center text-sm text-[color:var(--ink-soft)]">Loading…</div>}>
          <UnitCircleSim size={460} />
        </Suspense>
      </div>
      <section className="mt-8 card">
        <h2 className="font-display text-xl">How to read it</h2>
        <ul className="mt-2 text-sm list-disc ml-6 space-y-1 text-[color:var(--ink-soft)]">
          <li>The amber leg has length |cos θ|; the teal leg has length |sin θ|.</li>
          <li>The quadrant is highlighted to remind you of sign conventions.</li>
          <li>Sin and cos trace plots on the right show what those functions look like as θ sweeps from 0 to the current value.</li>
        </ul>
      </section>
    </div>
  );
}
