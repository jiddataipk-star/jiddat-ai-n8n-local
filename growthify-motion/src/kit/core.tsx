// Growthify Motion Kit: brand tokens, easing, and base layers.
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const C = {
  bg: '#07150F',
  forest: '#0F2B20',
  lime: '#C8FF40',
  white: '#FFFFFF',
  white75: 'rgba(255,255,255,0.75)',
  red: '#EE5B3E',
  border: 'rgba(255,255,255,0.09)',
  grid: 'rgba(255,255,255,0.035)',
};

export const FONT_HEAD = 'Anton, sans-serif';
export const FONT_BODY = 'Montserrat, sans-serif';

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
// Cursor travel: quick start, long settle before the target.
export const EASE_TRAVEL = Easing.bezier(0.45, 0.05, 0.15, 1);

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0→1 (or a→b) over [from, from+dur], eased. */
export const tween = (
  f: number,
  from: number,
  dur: number,
  a = 0,
  b = 1,
  easing: (t: number) => number = EASE_OUT,
) => interpolate(f, [from, from + dur], [a, b], { ...CLAMP, easing });

/** Small-overshoot spring that starts at `at`. */
export const pop = (f: number, at: number, fps: number, damping = 16) =>
  spring({ frame: f - at, fps, config: { damping, stiffness: 190, mass: 0.85 } });

/** Piecewise eased keyframes: [[frame, value], ...]. Equal neighbours give a hold. */
export const keys = (
  f: number,
  k: [number, number][],
  easing: (t: number) => number = EASE_IN_OUT,
) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [f0, v0] = k[i];
    const [f1, v1] = k[i + 1];
    if (f <= f1) return interpolate(f, [f0, f1], [v0, v1], { ...CLAMP, easing });
  }
  return k[k.length - 1][1];
};

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return { W: width, H: height, portrait };
};

/** Night Emerald base with the faint square grid used on every post. */
export const Background: React.FC<{ drift?: number; cell?: number }> = ({ drift = 0, cell }) => {
  const frame = useCurrentFrame();
  const { portrait } = useLayout();
  const g = cell ?? (portrait ? 60 : 64);
  const off = -(frame * 0.15 + drift) % g;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
        backgroundSize: `${g}px ${g}px`,
        backgroundPosition: `${off}px ${off * 0.6}px`,
      }}
    />
  );
};

export const LOGO_RATIO = 1400 / 250;

export const Logo: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img
    src={staticFile('brand/growthify-logo.png')}
    style={{ width, height: width / LOGO_RATIO, display: 'block', ...style }}
  />
);

/** Where the watermark sits for each format (also the end-card loop target). */
export const watermarkBox = (portrait: boolean) =>
  portrait ? { x: 64, y: 236, w: 290 } : { x: 80, y: 60, w: 300 };

export const LogoWatermark: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const { portrait } = useLayout();
  const b = watermarkBox(portrait);
  return (
    <div style={{ position: 'absolute', left: b.x, top: b.y, opacity }}>
      <Logo width={b.w} />
    </div>
  );
};

export const CategoryPill: React.FC<{
  text: string;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
}> = ({ text, style, size, color = C.lime }) => {
  const { portrait } = useLayout();
  const fs = size ?? (portrait ? 25 : 24);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `3px solid ${color}`,
        borderRadius: 999,
        padding: `${fs * 0.5}px ${fs * 1.05}px`,
        fontFamily: FONT_BODY,
        fontWeight: 800,
        fontSize: fs,
        letterSpacing: '0.14em',
        color,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Top header row: watermark left, category pill right. */
export const Header: React.FC<{ pill: string; logoOpacity?: number; pillOpacity?: number }> = ({
  pill,
  logoOpacity = 1,
  pillOpacity = 1,
}) => {
  const { portrait } = useLayout();
  const b = watermarkBox(portrait);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <LogoWatermark opacity={logoOpacity} />
      <div
        style={{
          position: 'absolute',
          right: portrait ? 64 : 80,
          top: b.y + (b.w / LOGO_RATIO) / 2,
          transform: 'translateY(-50%)',
          opacity: pillOpacity,
        }}
      >
        <CategoryPill text={pill} />
      </div>
    </AbsoluteFill>
  );
};

// ---- Icons (Feather-style, MIT) ----
type IconProps = { size: number; color: string; stroke?: number };
export const IconCheck: React.FC<IconProps> = ({ size, color, stroke = 3.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
export const IconX: React.FC<IconProps> = ({ size, color, stroke = 3.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
export const IconPhone: React.FC<IconProps> = ({ size, color, stroke = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
export const IconLock: React.FC<IconProps> = ({ size, color, stroke = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
export const IconBag: React.FC<IconProps> = ({ size, color, stroke = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

/** Solid circle with an icon, e.g. the lime check-circle and numbered circles from the posts. */
export const IconCircle: React.FC<{
  size: number;
  bg: string;
  children: React.ReactNode;
  border?: string;
}> = ({ size, bg, children, border }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);
