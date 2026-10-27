// Broh case study: scenes shared by the 9:16 and 16:9 cuts.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  C,
  CategoryPill,
  Cursor,
  EASE_IN,
  EndCard,
  FeatureChip,
  FONT_BODY,
  IconLock,
  KineticHeadline,
  Label,
  LaptopFrame,
  PhoneFrame,
  pop,
  ProblemCard,
  ScreenLayer,
  SubLine,
  tween,
  TypingText,
  useLayout,
} from '../../kit';
import { BROH } from './data';

export type SceneProps = { ev: Record<string, number>; dur: number };

export const HookScene: React.FC<SceneProps> = ({ ev }) => {
  const frame = useCurrentFrame();
  const { portrait } = useLayout();
  const push = 1 + tween(frame, 0, 84, 0, 0.035);
  const text = 'YOUR MENU.|THEIR PHONE.|YOUR [ORDER.]';
  if (portrait) {
    return (
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div style={{ position: 'absolute', left: 64, top: 700 }}>
          <KineticHeadline text={text} size={156} lineStarts={[ev.l1, ev.l2, ev.l3]} hlAt={ev.hl} />
        </div>
      </AbsoluteFill>
    );
  }
  const phoneIn = tween(frame, 20, 24);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <div style={{ position: 'absolute', left: 96, top: 300 }}>
        <KineticHeadline text={text} size={150} lineStarts={[ev.l1, ev.l2, ev.l3]} hlAt={ev.hl} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1240,
          top: 170,
          perspective: 1800,
          opacity: phoneIn,
          transform: `translateY(${(1 - phoneIn) * 220}px)`,
        }}
      >
        <div style={{ transform: `rotateY(${-16 + phoneIn * 4}deg) rotateZ(3deg)` }}>
          <PhoneFrame screenWidth={360}>
            <ScreenLayer src={BROH.m('top-slide1')} viewWidth={360} cssWidth={390} />
          </PhoneFrame>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const IntroScene: React.FC<SceneProps> = ({ ev }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { portrait, W } = useLayout();
  const card = pop(frame, ev.card, fps, 14);
  const pillIn = tween(frame, ev.pill, 12);
  const cw = portrait ? 620 : 640;
  const ch = portrait ? 300 : 300;
  const top = portrait ? 580 : 170;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top, left: 0, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Label size={portrait ? 34 : 30} style={{ letterSpacing: '0.24em' }}>
          <TypingText text="GROWTHIFY BUILDS" start={ev.label} seed="intro" caretUntil={ev.card + 26} />
        </Label>
        <div
          style={{
            marginTop: portrait ? 44 : 36,
            width: cw,
            height: ch,
            borderRadius: 40,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${0.6 + 0.4 * card}) rotate(${(1 - card) * -6}deg)`,
            opacity: Math.min(1, card * 1.6),
            boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
          }}
        >
          <Img src={staticFile(BROH.logo)} style={{ width: cw * 0.68 }} />
        </div>
        <div style={{ marginTop: portrait ? 56 : 44, opacity: pillIn, transform: `translateY(${(1 - pillIn) * 30}px)` }}>
          <CategoryPill text="FAST FOOD · FAISALABAD" size={portrait ? 30 : 28} />
        </div>
        <SubLine text="Online ordering website" size={portrait ? 46 : 40} at={ev.line} style={{ marginTop: portrait ? 36 : 28 }} />
      </div>
    </AbsoluteFill>
  );
};

const PROBLEMS = ['Busy lines at rush hour', 'Orders lost in DMs', 'Wrong item, wrong price'];

export const ProblemScene: React.FC<SceneProps> = ({ ev }) => {
  const { portrait } = useLayout();
  const head = 'STILL TAKING|ORDERS ON {CALLS?}';
  if (portrait) {
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 64, top: 470 }}>
          <KineticHeadline text={head} size={132} start={ev.head} />
        </div>
        <div style={{ position: 'absolute', left: 64, top: 830, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {PROBLEMS.map((p, i) => (
            <ProblemCard key={p} text={p} at={ev[`c${i + 1}`]} size={44} width={952} />
          ))}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 96, top: 300 }}>
        <KineticHeadline text={head} size={128} start={ev.head} />
      </div>
      <div style={{ position: 'absolute', left: 1010, top: 300, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {PROBLEMS.map((p, i) => (
          <ProblemCard key={p} text={p} at={ev[`c${i + 1}`]} size={40} width={810} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FEATURES = ['Online ordering', 'Delivery + pick-up', 'Smart cart upsells', 'Mobile-first design', 'Orders to admin panel'];

export const IncludedScene: React.FC<SceneProps> = ({ ev }) => {
  const { portrait } = useLayout();
  const head = 'WHAT WE|[DELIVERED]';
  if (portrait) {
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 64, top: 420 }}>
          <KineticHeadline text={head} size={150} start={ev.head} outAt={ev.out} />
        </div>
        <div style={{ position: 'absolute', left: 64, top: 800, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22 }}>
          {FEATURES.map((t, i) => (
            <FeatureChip key={t} text={t} at={ev[`chip${i}`]} size={42} outAt={ev.out + i} />
          ))}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 96, top: 330 }}>
        <KineticHeadline text={head} size={150} start={ev.head} outAt={ev.out} />
      </div>
      <div style={{ position: 'absolute', left: 1000, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22 }}>
        {FEATURES.map((t, i) => (
          <FeatureChip key={t} text={t} at={ev[`chip${i}`]} size={40} outAt={ev.out + i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const UrlBar: React.FC<{ at: number; width: number; size: number; clickAt: number; seed: string }> = ({ at, width, size, clickAt, seed }) => {
  const frame = useCurrentFrame();
  const appear = tween(frame, at - 10, 12);
  const flash = tween(frame, clickAt, 4) * (1 - tween(frame, clickAt + 6, 10));
  return (
    <div
      style={{
        width,
        height: size * 2.3,
        borderRadius: 999,
        background: C.forest,
        border: `3px solid ${flash > 0.01 ? C.lime : C.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.45,
        padding: `0 ${size * 0.9}px`,
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: size,
        color: C.white,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 30}px) scale(${1 + flash * 0.03})`,
        boxSizing: 'border-box',
      }}
    >
      <IconLock size={size * 0.9} color={C.lime} />
      <TypingText text="broh.pk" start={at} seed={seed} caretUntil={clickAt} />
    </div>
  );
};

export const LiveScene: React.FC<SceneProps> = ({ ev, dur }) => {
  const frame = useCurrentFrame();
  const { portrait } = useLayout();
  const out = tween(frame, dur - 6, 6, 0, 1, EASE_IN);
  if (portrait) {
    const barX = (1080 - 760) / 2;
    const barY = 980;
    return (
      <AbsoluteFill style={{ opacity: 1 - out }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
          <KineticHeadline text="LIVE [NOW]" size={240} start={ev.head} align="center" />
        </div>
        <div style={{ position: 'absolute', left: barX, top: barY }}>
          <UrlBar at={ev.urlType} width={760} size={56} clickAt={ev.click} seed="live" />
        </div>
        <Cursor
          path={[
            { f: ev.cursor, x: 930, y: 1420 },
            { f: ev.click, x: barX + 520, y: barY + 70, click: true },
          ]}
          size={72}
        />
      </AbsoluteFill>
    );
  }
  const lap = tween(frame, 8, 22);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: 'absolute', left: 96, top: 300 }}>
        <KineticHeadline text="LIVE [NOW]" size={220} start={ev.head} />
      </div>
      <div style={{ position: 'absolute', left: 96, top: 640 }}>
        <UrlBar at={ev.urlType} width={640} size={48} clickAt={ev.click} seed="live" />
      </div>
      <div style={{ position: 'absolute', left: 900, top: 240, perspective: 2000, opacity: lap }}>
        <div style={{ transform: `rotateY(${-18 + lap * 8}deg) translateX(${(1 - lap) * 160}px)` }}>
          <LaptopFrame screenWidth={820}>
            <ScreenLayer src={BROH.d('top-slide1')} viewWidth={820} cssWidth={1440} />
          </LaptopFrame>
        </div>
      </div>
      <Cursor
        path={[
          { f: ev.cursor, x: 900, y: 900 },
          { f: ev.click, x: 520, y: 694, click: true },
        ]}
        size={64}
      />
    </AbsoluteFill>
  );
};

export const EndScene: React.FC<SceneProps> = ({ dur }) => (
  <EndCard
    dur={dur}
    headline="YOUR RESTAURANT|COULD BE [NEXT]"
    line="for your website"
    contact={BROH.contact}
    handle="@growthifyagencypk"
  />
);
