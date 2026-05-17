import { Fragment } from "react";
import { InlineMath, BlockMath } from "react-katex";

interface MathProps {
  children: string;
  block?: boolean;
  className?: string;
}

// Render a single KaTeX expression (the children are LaTeX source).
export default function Math({ children, block, className }: MathProps) {
  try {
    return (
      <span className={className}>
        {block ? <BlockMath math={children} /> : <InlineMath math={children} />}
      </span>
    );
  } catch {
    return <code className={className}>{children}</code>;
  }
}

export function MathBlock({ children, className }: { children: string; className?: string }) {
  return <Math block className={className}>{children}</Math>;
}

// Parse text into a sequence of plain-text spans and KaTeX spans. Inline math is
// delimited by single `$...$`, block math by `$$...$$`. Unmatched dollars render
// as a literal "$".
type Segment =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

function parseRichText(input: string): Segment[] {
  const segs: Segment[] = [];
  let i = 0;
  const n = input.length;
  let buf = "";
  while (i < n) {
    if (input[i] === "$" && input[i + 1] === "$") {
      // block math
      const end = input.indexOf("$$", i + 2);
      if (end < 0) {
        buf += "$$";
        i += 2;
        continue;
      }
      if (buf) { segs.push({ type: "text", value: buf }); buf = ""; }
      segs.push({ type: "block", value: input.slice(i + 2, end) });
      i = end + 2;
    } else if (input[i] === "$") {
      // inline math — find next unescaped $
      let end = i + 1;
      while (end < n && input[end] !== "$") {
        if (input[end] === "\\" && end + 1 < n) end += 2;
        else end += 1;
      }
      if (end >= n) {
        buf += "$";
        i += 1;
        continue;
      }
      if (buf) { segs.push({ type: "text", value: buf }); buf = ""; }
      segs.push({ type: "inline", value: input.slice(i + 1, end) });
      i = end + 1;
    } else {
      buf += input[i];
      i += 1;
    }
  }
  if (buf) segs.push({ type: "text", value: buf });
  return segs;
}

// Drop-in for any prose that may contain LaTeX between `$...$` markers.
export function RichText({ children, className }: { children: string; className?: string }) {
  const segs = parseRichText(children);
  return (
    <span className={className}>
      {segs.map((s, idx) => {
        if (s.type === "text") return <Fragment key={idx}>{s.value}</Fragment>;
        if (s.type === "block") return <BlockMath key={idx} math={s.value} />;
        return <InlineMath key={idx} math={s.value} />;
      })}
    </span>
  );
}
