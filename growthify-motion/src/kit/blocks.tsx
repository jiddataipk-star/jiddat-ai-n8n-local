// Growthify Motion Kit: chips, problem cards, counters, contact row, end card, transitions.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  C,
  EASE_IN,
  EASE_IN_OUT,
  FONT_BODY,
  IconCheck,
  IconCircle,
  IconPhone,
  IconX,
  Logo,
  LOGO_RATIO,
  pop,
  tween,
  watermarkBox,
} from './core';
import { KineticHeadline, Label } from './type';

/** Lime check-circle + feature text on a Deep Forest pill. */
export const FeatureChip: React.FC<{ text: string; at: number; size: number; outAt?: number }> = ({ text, at, size, outAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, at, fps, 15);
  const out = outAt !== undefined ? tween(frame, outAt, 8, 0, 1, EASE_IN) : 0;
  if (frame < at) return null;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.55,
        padding: `${size * 0.42}px ${size * 0.9}px ${size * 0.42}px ${size * 0.42}px`,
        background: C.forest,
        border: `2px solid ${C.border}`,
        borderRadius: 999,
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: size,
        color: C.white,
        whiteSpace: 'nowrap',
        transform: `translateX(${(1 - s) * -40 - out * 30}px) scale(${0.85 + 0.15 * s})`,
        transformOrigin: 'left center',
        opacity: Math.min(1, s * 1.5) * (1 - out),
      }}
    >
      <IconCircle size={size * 1.45} bg={C.lime}>
        <IconCheck size={size * 0.85} color={C.bg} stroke={3.6} />
      </IconCircle>
      {text}
    </div>
  );
};

/** "Before" pain point: red ✕ on a Deep Forest card. Alert Red is only used here. */
export const ProblemCard: React.FC<{ text: string; at: number; size: number; width: number; outAt?: number }> = ({
  text,
  at,
  size,
  width,
  outAt,
}) => {
  const frame = useCurrentFrame();
  const inP = tween(frame, at, 12);
  const out = outAt !== undefined ? tween(frame, outAt, 8, 0, 1, EASE_IN) : 0;
  return (
    <div
      style={{
        width,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.6,
        padding: `${size * 0.6}px ${size * 0.7}px`,
        background: C.forest,
        border: `2px solid ${C.border}`,
        borderRadius: size * 0.55,
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: size,
        color: C.white,
        opacity: inP * (1 - out),
        transform: `translateX(${(1 - inP) * -80 + out * 60}px)`,
      }}
    >
      <IconCircle size={size * 1.5} bg="transparent" border={`3px solid ${C.red}`}>
        <IconX size={size * 0.85} color={C.red} stroke={3.4} />
      </IconCircle>
      {text}
    </div>
  );
};

/** Counts up to a value. Only use with real numbers the client confirmed. */
export const StatCounter: React.FC<{ to: number; at: number; dur?: number; size: number; prefix?: string; suffix?: string }> = ({
  to,
  at,
  dur = 30,
  size,
  prefix = '',
  suffix = '',
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(tween(frame, at, dur, 0, to, EASE_IN_OUT));
  return (
    <span style={{ fontFamily: 'Anton, sans-serif', fontSize: size, color: C.lime }}>
      {prefix}
      {v.toLocaleString('en-US')}
      {suffix}
    </span>
  );
};

/** Lime pill with phone icon: either a number or "Number in profile". */
export const ContactPill: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.45,
      background: C.lime,
      color: C.bg,
      borderRadius: 999,
      padding: `${size * 0.48}px ${size * 0.9}px`,
      fontFamily: FONT_BODY,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}
  >
    <IconPhone size={size * 0.95} color={C.bg} stroke={2.6} />
    {text}
  </div>
);

/** Full-bleed lime / forest wipe across the frame. Covers the frame fully at `mid`. */
export const ColourWipe: React.FC<{ mid: number; dur?: number; dir?: 'up' | 'left'; color?: string; trail?: string }> = ({
  mid,
  dur = 14,
  dir = 'up',
  color = C.lime,
  trail = C.forest,
}) => {
  const frame = useCurrentFrame();
  const half = dur / 2;
  if (frame < mid - half - 2 || frame > mid + half + 4) return null;
  const pIn = interpolate(frame, [mid - half, mid], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT });
  const pOut = interpolate(frame, [mid, mid + half], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT });
  const axis = dir === 'up' ? 'Y' : 'X';
  // The lime panel enters from the far side and leaves the opposite way;
  // the forest panel trails it on the way out.
  const lead = (1 - pIn) * 100 - pOut * 100;
  const trailPos = pOut > 0 ? -Math.min(1, Math.max(0, (pOut - 0.25) / 0.75)) * 100 : (1 - pIn) * 100;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: trail, transform: `translate${axis}(${trailPos}%)` }} />
      <AbsoluteFill style={{ background: color, transform: `translate${axis}(${lead}%)` }} />
    </AbsoluteFill>
  );
};

/** Horizontal whip-pan with directional motion blur, applied to a scene wrapper. */
export const useWhip = (frame: number, dur: number, enterLen: number, exitLen: number, W: number) => {
  // inP: 1 → 0 while entering from the right; outP: 0 → 1 while leaving to the left.
  const inP = enterLen > 0 ? tween(frame, 0, enterLen, 1, 0, EASE_IN_OUT) : 0;
  const outP = exitLen > 0 ? tween(frame, dur - exitLen, exitLen, 0, 1, EASE_IN_OUT) : 0;
  const x = inP * W * 0.55 - outP * W * 0.55;
  const blur = Math.max(inP, outP) * 70;
  return { x, blur };
};

export const MotionBlurFilter: React.FC<{ id: string; amount: number }> = ({ id, amount }) => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <filter id={id} x="-20%" y="0" width="140%" height="100%">
      <feGaussianBlur stdDeviation={`${amount} 0`} />
    </filter>
  </svg>
);

export const WhipTransition: React.FC<{
  children: React.ReactNode;
  dur: number;
  enter?: number;
  exit?: number;
  id: string;
}> = ({ children, dur, enter = 0, exit = 0, id }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const { x, blur } = useWhip(frame, dur, enter, exit, width);
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
      {blur > 0.5 && <MotionBlurFilter id={id} amount={blur} />}
      {children}
    </AbsoluteFill>
  );
};

/** Contact row from the posts: label + short line on one side, contact pill on the other. */
export const ContactRow: React.FC<{ line: string; contact: string; size: number; stacked?: boolean }> = ({ line, contact, size, stacked }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: stacked ? 'column' : 'row',
      alignItems: stacked ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: stacked ? size * 0.9 : size,
      width: '100%',
    }}
  >
    <div>
      <Label size={size * 0.62}>Contact us on WhatsApp</Label>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: size, color: C.white, marginTop: size * 0.2 }}>{line}</div>
    </div>
    <ContactPill text={contact} size={size} />
  </div>
);

/**
 * End card: logo hero, headline, handle and the contact band. In its last
 * `loopFrames` frames everything clears and the logo flies into the watermark
 * slot so the last frame matches frame 0 and the Reel loops.
 */
export const EndCard: React.FC<{
  dur: number;
  headline: string;
  line: string;
  contact: string;
  handle: string;
  loopFrames?: number;
}> = ({ dur, headline, line, contact, handle, loopFrames = 14 }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const portrait = H > W;
  const exitAt = dur - loopFrames;
  const out = tween(frame, exitAt, loopFrames - 4, 0, 1, EASE_IN);
  const logoIn = pop(frame, 2, fps, 18);

  const heroW = portrait ? 700 : 760;
  const hero = portrait ? { x: (W - heroW) / 2, y: 470 } : { x: (W - heroW) / 2, y: 150 };
  const wm = watermarkBox(portrait);
  const fly = tween(frame, exitAt, loopFrames, 0, 1, EASE_IN_OUT);
  const lx = hero.x + (wm.x - hero.x) * fly;
  const ly = hero.y + (wm.y - hero.y) * fly;
  const lw = heroW + (wm.w - heroW) * fly;

  const bandTop = portrait ? 1150 : 860;
  const bandIn = tween(frame, 10, 14);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: bandTop,
          bottom: 0,
          background: C.forest,
          transform: `translateY(${(1 - bandIn) * 100 + out * 110}%)`,
        }}
      >
        <div style={{ padding: portrait ? '60px 64px 0' : '0 80px', height: portrait ? undefined : '100%', display: 'flex', alignItems: 'center', opacity: 1 - out }}>
          <div style={{ width: portrait ? 952 - 76 : '100%' }}>
            <ContactRow line={line} contact={contact} size={portrait ? 46 : 44} stacked={portrait} />
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: lx,
          top: ly,
          transform: `scale(${0.7 + 0.3 * logoIn})`,
          transformOrigin: fly > 0 ? 'left top' : 'center',
          opacity: Math.min(1, logoIn * 1.6),
        }}
      >
        <Logo width={lw} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: portrait ? 64 : 0,
          right: portrait ? 64 : 0,
          top: hero.y + heroW / LOGO_RATIO + (portrait ? 90 : 70),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <KineticHeadline text={headline} size={portrait ? 118 : 104} start={10} align="center" outAt={exitAt - 6} />
        <div
          style={{
            marginTop: portrait ? 34 : 22,
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: portrait ? 40 : 34,
            color: C.white75,
            opacity: tween(frame, 26, 12) * (1 - out),
          }}
        >
          {handle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
