// Growthify Motion Kit: device frames and screen layers (generic, no brand hardware).
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, FONT_BODY, IconLock } from './core';

const SHADOW = '0 50px 90px rgba(0,0,0,0.45), 0 12px 30px rgba(0,0,0,0.35)';

export const BrowserFrame: React.FC<{
  width: number;
  contentHeight: number;
  url?: React.ReactNode;
  barHeight?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, contentHeight, url, barHeight = 60, children, style }) => {
  const dot = barHeight * 0.22;
  return (
    <div
      style={{
        width,
        borderRadius: 26,
        background: C.forest,
        border: `2px solid ${C.border}`,
        overflow: 'hidden',
        boxShadow: SHADOW,
        ...style,
      }}
    >
      <div style={{ height: barHeight, display: 'flex', alignItems: 'center', padding: `0 ${barHeight * 0.4}px`, position: 'relative' }}>
        <div style={{ display: 'flex', gap: dot * 0.7 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: dot, height: dot, borderRadius: '50%', background: 'rgba(255,255,255,0.22)' }} />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            height: barHeight * 0.62,
            minWidth: width * 0.44,
            borderRadius: 999,
            background: C.bg,
            display: 'flex',
            alignItems: 'center',
            gap: barHeight * 0.16,
            padding: `0 ${barHeight * 0.36}px`,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: barHeight * 0.34,
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          <IconLock size={barHeight * 0.3} color={C.lime} />
          <span>{url}</span>
        </div>
      </div>
      <div style={{ width, height: contentHeight, position: 'relative', overflow: 'hidden', background: '#fff' }}>{children}</div>
    </div>
  );
};

/** Offset from the PhoneFrame's outer top-left to its screen's top-left. */
export const phoneScreenOffset = (screenWidth: number) => Math.round(screenWidth * 0.032) + 2;

export const PhoneFrame: React.FC<{
  screenWidth: number;
  screenHeight?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ screenWidth, screenHeight = (screenWidth * 844) / 390, children, style }) => {
  const bezel = Math.round(screenWidth * 0.032);
  const r = screenWidth * 0.145;
  return (
    <div
      style={{
        width: screenWidth,
        height: screenHeight,
        padding: bezel,
        borderRadius: r,
        background: C.forest,
        border: `2px solid rgba(255,255,255,0.12)`,
        boxShadow: SHADOW,
        position: 'relative',
        boxSizing: 'content-box',
        ...style,
      }}
    >
      <div
        style={{
          width: screenWidth,
          height: screenHeight,
          borderRadius: r - bezel,
          overflow: 'hidden',
          position: 'relative',
          background: '#fff',
        }}
      >
        {children}
        <div
          style={{
            position: 'absolute',
            top: screenWidth * 0.028,
            left: '50%',
            width: screenWidth * 0.034,
            height: screenWidth * 0.034,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: '#06100b',
            boxShadow: '0 0 0 3px rgba(0,0,0,0.12)',
          }}
        />
      </div>
      <div style={{ position: 'absolute', right: -5, top: '22%', width: 5, height: '9%', borderRadius: 3, background: C.forest }} />
    </div>
  );
};

export const LaptopFrame: React.FC<{
  screenWidth: number;
  screenHeight?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ screenWidth, screenHeight = screenWidth / 1.6, children, style }) => {
  const bezel = Math.round(screenWidth * 0.022);
  return (
    <div style={{ width: screenWidth * 1.16, display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      <div
        style={{
          padding: bezel,
          paddingBottom: bezel * 1.6,
          background: C.forest,
          borderRadius: `${bezel * 1.4}px ${bezel * 1.4}px 6px 6px`,
          border: `2px solid rgba(255,255,255,0.12)`,
          boxShadow: SHADOW,
        }}
      >
        <div style={{ width: screenWidth, height: screenHeight, overflow: 'hidden', position: 'relative', background: '#fff', borderRadius: 4 }}>
          {children}
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: screenWidth * 0.03,
          background: '#16392b',
          borderRadius: `2px 2px ${screenWidth * 0.03}px ${screenWidth * 0.03}px`,
          position: 'relative',
          boxShadow: SHADOW,
        }}
      >
        <div style={{ position: 'absolute', left: '50%', top: 0, width: '14%', height: '38%', transform: 'translateX(-50%)', background: C.forest, borderRadius: '0 0 8px 8px' }} />
      </div>
    </div>
  );
};

/**
 * A screenshot laid into a device screen. `cssWidth` is the page width the
 * screenshot was taken at (1440 desktop, 390 mobile); `scrollY` is in CSS px.
 */
export const ScreenLayer: React.FC<{
  src: string;
  viewWidth: number;
  cssWidth: number;
  scrollY?: number;
  style?: React.CSSProperties;
}> = ({ src, viewWidth, cssWidth, scrollY = 0, style }) => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: viewWidth,
        transform: `translateY(${-scrollY * (viewWidth / cssWidth)}px)`,
      }}
    />
  </div>
);

/** Inertial scroll of a long full-page screenshot. Same as ScreenLayer; kept as a named kit part. */
export const ScrollingScreenshot = ScreenLayer;
