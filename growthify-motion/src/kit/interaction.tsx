// Growthify Motion Kit: cursor, taps, callouts, toasts, chat bubbles, search UI.
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE_IN, EASE_OUT, EASE_TRAVEL, FONT_BODY, IconBag, pop, tween } from './core';
import { TypingText } from './type';

export type CursorKey = { f: number; x: number; y: number; click?: boolean };

const cursorPos = (frame: number, path: CursorKey[]) => {
  if (frame <= path[0].f) return { x: path[0].x, y: path[0].y };
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (frame <= b.f) {
      const t = EASE_TRAVEL(Math.min(1, Math.max(0, (frame - a.f) / Math.max(1, b.f - a.f))));
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const sign = i % 2 === 0 ? 1 : -1;
      // Curved travel: quadratic Bézier with a perpendicular control point.
      const cx = (a.x + b.x) / 2 - dy * 0.18 * sign;
      const cy = (a.y + b.y) / 2 + dx * 0.18 * sign;
      const u = 1 - t;
      return { x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y };
    }
  }
  const l = path[path.length - 1];
  return { x: l.x, y: l.y };
};

/** Lime pointer (desktop) or touch dot (mobile) that travels on curves and clicks with a ripple. */
export const Cursor: React.FC<{
  path: CursorKey[];
  variant?: 'pointer' | 'touch';
  size?: number;
  showAt?: number;
  hideAt?: number;
}> = ({ path, variant = 'pointer', size = 54, showAt, hideAt }) => {
  const frame = useCurrentFrame();
  const appear = tween(frame, showAt ?? path[0].f - 8, 8);
  const vanish = hideAt !== undefined ? tween(frame, hideAt, 8, 0, 1, EASE_IN) : 0;
  const op = appear * (1 - vanish);
  if (op <= 0) return null;
  const { x, y } = cursorPos(frame, path);
  let press = 1;
  const ripples: React.ReactNode[] = [];
  path.forEach((k, i) => {
    if (!k.click) return;
    const d = frame - k.f;
    if (d >= 0 && d <= 8) press = Math.min(press, 1 - 0.1 * Math.sin((Math.PI * d) / 8));
    if (d >= 0 && d <= 18) {
      const p = EASE_OUT(d / 18);
      const r = size * (0.3 + p * 1.1);
      ripples.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: k.x - r,
            top: k.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: `${Math.max(3, size * 0.07)}px solid ${C.lime}`,
            opacity: (1 - p) * 0.95,
          }}
        />,
      );
    }
  });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: op }}>
      {ripples}
      {variant === 'pointer' ? (
        <svg
          width={size * 0.72}
          height={size}
          viewBox="0 0 26 36"
          style={{
            position: 'absolute',
            left: x - (2 / 26) * size * 0.72,
            top: y - (2 / 36) * size,
            transform: `scale(${press})`,
            transformOrigin: '8% 6%',
            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))',
          }}
        >
          <path d="M2 2 L2 30 L9.5 23 L14.5 34 L19.5 31.8 L14.5 21.2 L24.5 21.2 Z" fill={C.lime} stroke={C.bg} strokeWidth={2.2} strokeLinejoin="round" />
        </svg>
      ) : (
        <div
          style={{
            position: 'absolute',
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'rgba(200,255,64,0.88)',
            border: `3px solid ${C.bg}`,
            transform: `scale(${press * 0.96})`,
            boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
          }}
        />
      )}
    </div>
  );
};

export type Rect = { x: number; y: number; w: number; h: number };

/** Lime outline on a UI detail plus a short label tag. */
export const CalloutTag: React.FC<{
  rect: Rect;
  label: string;
  at: number;
  outAt?: number;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: number;
  pad?: number;
  radius?: number;
}> = ({ rect, label, at, outAt, side = 'top', size = 30, pad = 10, radius = 16 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = tween(frame, at, 10);
  const tag = pop(frame, at + 5, fps);
  const out = outAt !== undefined ? tween(frame, outAt, 8, 0, 1, EASE_IN) : 0;
  if (frame < at) return null;
  const r = { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 };
  const gap = size * 0.9;
  const tagStyle: React.CSSProperties = { position: 'absolute' };
  if (side === 'top') Object.assign(tagStyle, { left: r.x, top: r.y - gap, transform: `translateY(-100%) scale(${tag})`, transformOrigin: 'left bottom' });
  if (side === 'bottom') Object.assign(tagStyle, { left: r.x, top: r.y + r.h + gap, transform: `scale(${tag})`, transformOrigin: 'left top' });
  if (side === 'left') Object.assign(tagStyle, { left: r.x - gap, top: r.y + r.h / 2, transform: `translate(-100%, -50%) scale(${tag})`, transformOrigin: 'right center' });
  if (side === 'right') Object.assign(tagStyle, { left: r.x + r.w + gap, top: r.y + r.h / 2, transform: `translateY(-50%) scale(${tag})`, transformOrigin: 'left center' });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 1 - out }}>
      <div
        style={{
          position: 'absolute',
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          borderRadius: radius,
          border: `${Math.max(4, size * 0.14)}px solid ${C.lime}`,
          transform: `scale(${0.92 + draw * 0.08})`,
          opacity: draw,
        }}
      />
      <div
        style={{
          ...tagStyle,
          background: C.lime,
          color: C.bg,
          fontFamily: FONT_BODY,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: `${size * 0.42}px ${size * 0.7}px`,
          borderRadius: 999,
          whiteSpace: 'nowrap',
          lineHeight: 1,
          boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Zoom-in callout: wraps content and pushes the camera towards a target rect. */
export const CalloutZoom: React.FC<{
  children: React.ReactNode;
  width: number;
  height: number;
  target: Rect;
  at: number;
  dur?: number;
  scale: number;
  outAt?: number;
}> = ({ children, width, height, target, at, dur = 16, scale, outAt }) => {
  const frame = useCurrentFrame();
  const p = tween(frame, at, dur) * (outAt !== undefined ? 1 - tween(frame, outAt, dur, 0, 1) : 1);
  const s = 1 + (scale - 1) * p;
  const cx = target.x + target.w / 2;
  const cy = target.y + target.h / 2;
  const tx = (width / 2 - cx) * p;
  const ty = (height / 2 - cy) * p;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: `${cx}px ${cy}px` }}>
      {children}
    </div>
  );
};

/** Growthify-styled notification card. */
export const NotificationToast: React.FC<{
  title: string;
  sub: string;
  at: number;
  width: number;
  size?: number;
  outAt?: number;
}> = ({ title, sub, at, width, size = 34, outAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, at, fps, 14);
  const out = outAt !== undefined ? tween(frame, outAt, 10, 0, 1, EASE_IN) : 0;
  if (frame < at) return null;
  return (
    <div
      style={{
        width,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.6,
        padding: `${size * 0.6}px ${size * 0.7}px`,
        background: C.forest,
        border: `2px solid rgba(200,255,64,0.35)`,
        borderRadius: size * 0.8,
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        transform: `translateY(${(1 - s) * -60 - out * 40}px) scale(${0.9 + 0.1 * s})`,
        opacity: Math.min(1, s * 1.4) * (1 - out),
        fontFamily: FONT_BODY,
      }}
    >
      <div style={{ width: size * 2, height: size * 2, borderRadius: size * 0.5, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconBag size={size * 1.1} color={C.bg} stroke={2.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.white, fontWeight: 800, fontSize: size, lineHeight: 1.2 }}>{title}</div>
        <div style={{ color: C.white75, fontWeight: 600, fontSize: size * 0.8, lineHeight: 1.3, marginTop: 4 }}>{sub}</div>
      </div>
      <div style={{ color: C.lime, fontWeight: 700, fontSize: size * 0.72, alignSelf: 'flex-start' }}>now</div>
    </div>
  );
};

/** WhatsApp-style conversation in brand colours. Never put real numbers or names in it. */
export const ChatBubbleFlow: React.FC<{
  messages: { from: 'them' | 'us'; text: string; at: number }[];
  width: number;
  size?: number;
}> = ({ messages, width, size = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', gap: size * 0.5, fontFamily: FONT_BODY }}>
      {messages.map((m, i) => {
        if (frame < m.at) return null;
        const s = pop(frame, m.at, fps, 15);
        const them = m.from === 'them';
        return (
          <div
            key={i}
            style={{
              alignSelf: them ? 'flex-start' : 'flex-end',
              maxWidth: width * 0.8,
              background: them ? C.white : '#1d5a3f',
              color: them ? C.bg : C.white,
              fontWeight: 600,
              fontSize: size,
              lineHeight: 1.3,
              padding: `${size * 0.45}px ${size * 0.6}px`,
              borderRadius: size * 0.55,
              transform: `scale(${s})`,
              transformOrigin: them ? 'left bottom' : 'right bottom',
            }}
          >
            {m.text}
          </div>
        );
      })}
    </div>
  );
};

/** Floating pill search bar with typed query (generic UI, for stories told through search). */
export const SearchBar: React.FC<{ query: string; typeAt: number; width: number; size?: number; placeholder?: string }> = ({
  query,
  typeAt,
  width,
  size = 40,
  placeholder = 'Search',
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height: size * 2.2,
        borderRadius: 999,
        background: C.forest,
        border: `2px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.5,
        padding: `0 ${size * 0.8}px`,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: size,
        color: C.white,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth={2.6} strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      {frame < typeAt ? <span style={{ color: 'rgba(255,255,255,0.4)' }}>{placeholder}</span> : <TypingText text={query} start={typeAt} />}
    </div>
  );
};

/** Dropdown list that opens under a control. */
export const Dropdown: React.FC<{ items: string[]; at: number; width: number; size?: number; active?: number }> = ({
  items,
  at,
  width,
  size = 34,
  active,
}) => {
  const frame = useCurrentFrame();
  const open = tween(frame, at, 10);
  if (frame < at) return null;
  return (
    <div
      style={{
        width,
        background: C.forest,
        border: `2px solid ${C.border}`,
        borderRadius: size * 0.7,
        padding: size * 0.3,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: size,
        color: C.white,
        clipPath: `inset(0 0 ${(1 - open) * 100}% 0 round ${size * 0.7}px)`,
      }}
    >
      {items.map((it, i) => (
        <div key={i} style={{ padding: `${size * 0.35}px ${size * 0.5}px`, borderRadius: size * 0.4, background: i === active ? 'rgba(200,255,64,0.14)' : undefined }}>
          {it}
        </div>
      ))}
    </div>
  );
};
