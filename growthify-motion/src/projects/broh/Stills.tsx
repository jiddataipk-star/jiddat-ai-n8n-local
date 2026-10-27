// Broh: Reel cover (1080×1920, key content inside the centre 1080×1350) and YouTube thumbnail (1280×720).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, BrowserFrame, C, CategoryPill, KineticHeadline, Label, Logo, PhoneFrame, ScreenLayer } from '../../kit';
import { BROH } from './data';

export const BrohCover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Background />
    {/* Everything that matters sits between y=285 and y=1635 (the 4:5 grid crop). */}
    <div style={{ position: 'absolute', left: 64, top: 330 }}>
      <Logo width={290} />
    </div>
    <div style={{ position: 'absolute', right: 64, top: 336 }}>
      <CategoryPill text="CLIENT PROJECT" />
    </div>
    <div style={{ position: 'absolute', left: 64, top: 470 }}>
      <Label size={34} style={{ letterSpacing: '0.22em' }}>
        Growthify Builds: Broh
      </Label>
      <div style={{ marginTop: 24 }}>
        <KineticHeadline text="ORDERING|[WEBSITE]" size={176} start={-100} />
      </div>
    </div>
    <div style={{ position: 'absolute', left: 40, top: 960, perspective: 2000 }}>
      <div style={{ transform: 'rotateY(14deg) rotateZ(-2deg)' }}>
        <BrowserFrame width={820} contentHeight={820 / 1.6} barHeight={52} url="broh.pk">
          <ScreenLayer src={BROH.d('top-slide1')} viewWidth={820} cssWidth={1440} />
        </BrowserFrame>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 690, top: 1010, perspective: 2000 }}>
      <div style={{ transform: 'rotateY(-12deg) rotateZ(3deg)' }}>
        <PhoneFrame screenWidth={290}>
          <ScreenLayer src={BROH.m('modal-double')} viewWidth={290} cssWidth={390} />
        </PhoneFrame>
      </div>
    </div>
  </AbsoluteFill>
);

export const BrohThumbnail: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Background cell={48} />
    <div style={{ position: 'absolute', left: 56, top: 44 }}>
      <Logo width={230} />
    </div>
    <div style={{ position: 'absolute', left: 56, top: 190 }}>
      <Label size={26} style={{ letterSpacing: '0.2em' }}>
        Growthify Builds: Broh
      </Label>
      <div style={{ marginTop: 16 }}>
        <KineticHeadline text="ORDERING|[WEBSITE]" size={150} start={-100} />
      </div>
    </div>
    <div style={{ position: 'absolute', left: 690, top: 150, perspective: 1800 }}>
      <div style={{ transform: 'rotateY(-16deg) rotateZ(2deg)' }}>
        <BrowserFrame width={560} contentHeight={350} barHeight={40} url="broh.pk">
          <ScreenLayer src={BROH.d('top-slide1')} viewWidth={560} cssWidth={1440} />
        </BrowserFrame>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 1030, top: 250, perspective: 1800 }}>
      <div style={{ transform: 'rotateY(-12deg) rotateZ(4deg)' }}>
        <PhoneFrame screenWidth={190}>
          <ScreenLayer src={BROH.m('modal-double')} viewWidth={190} cssWidth={390} />
        </PhoneFrame>
      </div>
    </div>
  </AbsoluteFill>
);
