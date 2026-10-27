// Growthify Motion Kit: kinetic type.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, EASE_IN, EASE_OUT, FONT_BODY, FONT_HEAD, tween } from './core';

type Unit = { text: string; kind: 'plain' | 'lime' | 'red' | 'limeText' };

/**
 * Headline markup, one string:
 *   "YOUR MENU.|THEIR PHONE.|YOUR [ORDER.]"
 *   |  line break      [x] lime highlight box (one per headline)
 *   {x} red box (problem words only)      <x> lime-coloured text, no box
 */
export const parseHeadline = (src: string): Unit[][] =>
  src.split('|').map((line) => {
    const out: Unit[] = [];
    const re = /\[([^\]]+)\]|\{([^}]+)\}|<([^>]+)>|(\S+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m[1]) out.push({ text: m[1], kind: 'lime' });
      else if (m[2]) out.push({ text: m[2], kind: 'red' });
      else if (m[3]) out.push({ text: m[3], kind: 'limeText' });
      else out.push({ text: m[4], kind: 'plain' });
    }
    return out;
  });

export const headlineWordCount = (src: string) =>
  parseHeadline(src).reduce((n, l) => n + l.reduce((k, u) => k + u.text.split(' ').length, 0), 0);

export type KineticHeadlineProps = {
  text: string;
  size: number;
  start?: number; // local frame the first word starts rising
  stagger?: number; // frames between words
  lineStarts?: number[]; // explicit start per line (overrides continuous stagger)
  hlAt?: number; // when the highlight box wipes in (default: after its word lands)
  outAt?: number; // when the words exit
  align?: 'left' | 'center';
  color?: string;
  lineHeight?: number;
  style?: React.CSSProperties;
};

const RISE = 12; // frames for a word to rise into place
const WIPE = 10; // frames for the highlight box wipe

export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  text,
  size,
  start = 0,
  stagger = 3,
  lineStarts,
  hlAt,
  outAt,
  align = 'left',
  color = C.white,
  lineHeight = 1.04,
  style,
}) => {
  const frame = useCurrentFrame();
  const lines = parseHeadline(text);
  let idx = 0;
  let lastLand = start;
  const schedule = lines.map((line, li) => {
    const base = lineStarts?.[li];
    return line.map((u, wi) => {
      const t = base !== undefined ? base + wi * stagger : start + idx * stagger;
      idx++;
      lastLand = Math.max(lastLand, t + RISE);
      return t;
    });
  });
  const totalUnits = idx;

  let unitIndex = 0;
  return (
    <div
      style={{
        fontFamily: FONT_HEAD,
        fontSize: size,
        lineHeight,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.005em',
        textAlign: align,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: 'flex',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
            gap: '0.2em',
            whiteSpace: 'nowrap',
          }}
        >
          {line.map((u, wi) => {
            const t = schedule[li][wi];
            const myIndex = unitIndex++;
            const rise = tween(frame, t, RISE, 1, 0, EASE_OUT);
            const exitT = outAt !== undefined ? outAt + myIndex * 1.5 : Infinity;
            const exit = outAt !== undefined ? tween(frame, exitT, 9, 0, 1, EASE_IN) : 0;
            const y = rise * 112 - exit * 112;
            const boxAt = hlAt ?? t + RISE - 2;
            const wipeIn = tween(frame, boxAt, WIPE, 0, 1, EASE_OUT);
            const wipeOut = outAt !== undefined ? tween(frame, outAt + (totalUnits - 1) * 0.5, 8, 0, 1, EASE_IN) : 0;
            const boxed = u.kind === 'lime' || u.kind === 'red';
            const clip = `inset(0 ${(1 - wipeIn) * 100}% 0 ${wipeOut * 100}%)`;
            return (
              <span key={wi} style={{ position: 'relative', display: 'inline-block' }}>
                <span
                  style={{
                    display: 'inline-block',
                    overflow: 'hidden',
                    padding: '0.08em 0.04em 0.02em',
                    margin: '-0.08em -0.04em -0.02em',
                    verticalAlign: 'top',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      transform: `translateY(${y}%)`,
                      color: u.kind === 'limeText' ? C.lime : undefined,
                    }}
                  >
                    {u.text}
                  </span>
                </span>
                {boxed && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '-0.1em',
                      right: '-0.1em',
                      top: '0.06em',
                      bottom: '-0.02em',
                      background: u.kind === 'red' ? C.red : C.lime,
                      clipPath: clip,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '0.1em',
                        top: '-0.06em',
                        color: u.kind === 'red' ? C.white : C.bg,
                        whiteSpace: 'nowrap',
                        transform: `translateY(${-exit * 112}%)`,
                      }}
                    >
                      {u.text}
                    </span>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Typed text with a 2 Hz caret and slightly uneven rhythm (1–3 frames per character). */
// Deterministic 1–3 frame rhythm; scripts/sfx.py mirrors this to place typing ticks.
export const typeStep = (i: number, seed: string) => 1 + ((i * 7 + seed.length * 3) % 3);

export const typedLength = (frame: number, start: number, text: string, seed = 'type') => {
  let t = start;
  for (let i = 0; i < text.length; i++) {
    if (frame < t) return i;
    t += typeStep(i, seed);
  }
  return text.length;
};

/** Frame each character lands, for syncing typing ticks. */
export const typedFrames = (start: number, text: string, seed = 'type') => {
  const out: number[] = [];
  let t = start;
  for (let i = 0; i < text.length; i++) {
    out.push(t);
    t += typeStep(i, seed);
  }
  return out;
};

export const TypingText: React.FC<{
  text: string;
  start: number;
  seed?: string;
  caret?: boolean;
  caretColor?: string;
  caretUntil?: number;
  style?: React.CSSProperties;
}> = ({ text, start, seed = 'type', caret = true, caretColor = C.lime, caretUntil, style }) => {
  const frame = useCurrentFrame();
  const n = typedLength(frame, start, text, seed);
  const typing = n < text.length && frame >= start;
  const blinkOn = typing || Math.floor(frame / 15) % 2 === 0;
  const showCaret = caret && frame >= start - 6 && (caretUntil === undefined || frame < caretUntil);
  return (
    <span style={{ whiteSpace: 'pre', ...style }}>
      {text.slice(0, n)}
      {showCaret && (
        <span
          style={{
            display: 'inline-block',
            width: '0.08em',
            height: '1.05em',
            marginLeft: '0.06em',
            verticalAlign: '-0.15em',
            background: caretColor,
            opacity: blinkOn ? 1 : 0,
          }}
        />
      )}
    </span>
  );
};

/** Uppercase wide-tracked label, e.g. "CONTACT US ON WHATSAPP". */
export const Label: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size,
  color = C.lime,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT_BODY,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      lineHeight: 1.2,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Supporting line in Montserrat that fades/slides up. */
export const SubLine: React.FC<{
  text: string;
  size: number;
  at: number;
  outAt?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ text, size, at, outAt, color = C.white75, weight = 600, style }) => {
  const frame = useCurrentFrame();
  const inP = tween(frame, at, 12);
  const outP = outAt !== undefined ? tween(frame, outAt, 8, 0, 1, EASE_IN) : 0;
  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.3,
        color,
        opacity: inP * (1 - outP),
        transform: `translateY(${(1 - inP) * 24 - outP * 16}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
