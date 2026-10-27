// Broh 9:16: the build walkthrough. Desktop site first, then the whole order flow on a phone.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  BrowserFrame,
  CalloutTag,
  Cursor,
  EASE_IN_OUT,
  EASE_OUT,
  keys,
  KineticHeadline,
  MotionBlurFilter,
  NotificationToast,
  PhoneFrame,
  phoneScreenOffset,
  ScreenLayer,
  tween,
  TypingText,
} from '../../kit';
import { BROH } from './data';
import { SceneProps } from './scenes';

// Desktop browser geometry (canvas px)
const BX = 48;
const BY = 700;
const BW = 984;
const BAR = 60;
const BH = BW / 1.6;
const K = BW / 1440; // canvas px per desktop CSS px

// Phone geometry
const SW = 460;
const PK = SW / 390; // canvas px per mobile CSS px
const POFF = phoneScreenOffset(SW);
const PX = (1080 - (SW + POFF * 2)) / 2;
const PY = 540;

const D = BROH.desktop;
const SCROLL2 = 1900; // CSS px: Beefy Vibes grid in view
const M = BROH.mobile;

const Caption: React.FC<{ text: string; size: number; at: number; out: number }> = ({ text, size, at, out }) => (
  <div style={{ position: 'absolute', left: 64, top: 380 }}>
    <KineticHeadline text={text} size={size} start={at} outAt={out} />
  </div>
);

/** Slide a screen in from the right/bottom over `len` frames. */
const slideIn = (frame: number, at: number, len = 12) => 1 - tween(frame, at, len, 0, 1, EASE_OUT);

export const BuildReel: React.FC<SceneProps> = ({ ev }) => {
  const frame = useCurrentFrame();

  // ---------- Desktop browser (0 → swap) ----------
  const tilt = tween(frame, 0, 24, 14, 0);
  const push = 1 + tween(frame, 8, 70, 0, 0.03);
  const scroll = keys(frame, [
    [0, 0],
    [ev.scroll1, 0],
    [ev.scroll1End, 640],
    [ev.scroll2, 640],
    [ev.scroll2End, SCROLL2],
  ]);
  const slide2Opacity = 1 - tween(frame, ev.slideSwap, 6);
  // Zoom callout on a "10% OFF" badge in the Beefy Vibes grid.
  // Badge position on the canvas, including the browser's push-in (scale P from its top centre).
  const badge = D['full.10off'];
  const P = 1.03;
  const bx = BX + BW / 2 + (badge.x * K - BW / 2) * P;
  const by = BY + (BAR + (badge.y - SCROLL2) * K) * P;
  const bw = badge.w * K * P;
  const bh = badge.h * K * P;
  const ZS = 1.8;
  const ZX = 540;
  const ZY = 880;
  const z = tween(frame, ev.zoom, 18, 0, 1, EASE_IN_OUT);
  const zs = 1 + (ZS - 1) * z;
  const zcx = bx + bw / 2;
  const zcy = by + bh / 2;
  const ztx = (ZX - zcx) * z;
  const zty = (ZY - zcy) * z;
  // Whip out to the left.
  const whipOut = tween(frame, ev.swap, 10, 0, 1, EASE_IN_OUT);
  const showBrowser = frame < ev.swap + 12;

  // ---------- Phone (swap → end) ----------
  const phoneIn = tween(frame, ev.swap + 4, 14, 0, 1, EASE_IN_OUT);
  const move = tween(frame, ev.phoneMove, 16, 0, 1, EASE_IN_OUT);
  const phoneY = PY + move * 120;
  const phoneS = 1 - move * 0.06;
  const mscroll = keys(frame, [
    [0, 0],
    [ev.mscroll, 0],
    [ev.mscrollEnd, M.clickScroll],
  ]);
  const modalUp = slideIn(frame, ev.modalUp);
  const modalDown = tween(frame, ev.modalDown, 10, 0, 1, EASE_IN_OUT);
  const doubleOn = tween(frame, ev.tapDouble + 2, 3);
  const cleanOn = tween(frame, ev.cap5, 8);
  const cartIn = slideIn(frame, ev.cartIn);
  const ckIn = slideIn(frame, ev.checkoutIn);
  const ckScroll = keys(frame, [
    [0, 0],
    [ev.ckScroll, 0],
    [ev.ckScrollEnd, 496],
  ]);

  // Tap targets in phone-screen px
  const tap = (x: number, y: number) => ({ x: x * PK, y: y * PK });
  const card = tap(102, 345);
  const dbl = tap(M['modal.doubleCard'].x + M['modal.doubleCard'].w / 2, M['modal.doubleCard'].vy + M['modal.doubleCard'].h / 2);
  const add = tap(M['modal.addtocart'].x + M['modal.addtocart'].w / 2, M['modal.addtocart'].vy + M['modal.addtocart'].h / 2);
  const vc = tap(M['added.viewcartBar'].x + M['added.viewcartBar'].w / 2, M['added.viewcartBar'].vy + M['added.viewcartBar'].h / 2);
  const ck = tap(M['cart.checkout'].x + M['cart.checkout'].w / 2, M['cart.checkout'].vy + M['cart.checkout'].h / 2);
  const place = tap(M['checkout.place'].x + M['checkout.place'].w / 2, M['checkout.place'].y - 496 + M['checkout.place'].h / 2);
  const rest = tap(330, 700);

  const screenLayers = (
    <>
      {/* scrolled home page; at clickScroll it matches the click background */}
      <ScreenLayer src={BROH.m('full')} viewWidth={SW} cssWidth={390} scrollY={mscroll} />
      {frame >= ev.modalDown && (
        <>
          <ScreenLayer src={BROH.m('added-toast')} viewWidth={SW} cssWidth={390} />
          <ScreenLayer src={BROH.m('added-clean')} viewWidth={SW} cssWidth={390} style={{ opacity: cleanOn }} />
        </>
      )}
      {frame >= ev.modalUp && frame < ev.modalDown + 12 && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(modalUp + modalDown) * 100}%)` }}>
          <ScreenLayer src={BROH.m('modal-single')} viewWidth={SW} cssWidth={390} />
          <ScreenLayer src={BROH.m('modal-double')} viewWidth={SW} cssWidth={390} style={{ opacity: doubleOn }} />
        </div>
      )}
      {frame >= ev.cartIn && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${cartIn * 100}%)` }}>
          <ScreenLayer src={BROH.m('cart')} viewWidth={SW} cssWidth={390} />
        </div>
      )}
      {frame >= ev.checkoutIn && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${ckIn * 100}%)` }}>
          <ScreenLayer src={BROH.m('checkout-full')} viewWidth={SW} cssWidth={390} scrollY={ckScroll} />
        </div>
      )}
    </>
  );

  const pBlur = (1 - phoneIn) * 70;
  const bBlur = whipOut * 70;

  return (
    <AbsoluteFill>
      {/* Captions */}
      <Caption text="THEIR OWN|[WEBSITE]" size={124} at={6} out={ev.cap2 - 12} />
      <Caption text="THE FULL [MENU]" size={124} at={ev.cap2} out={ev.zoom - 6} />
      <Caption text="BUILT FOR [MOBILE]" size={116} at={ev.cap3} out={ev.cap4 - 12} />
      <Caption text="TAP. [CUSTOMISE.] ADD." size={100} at={ev.cap4} out={ev.cap5 - 12} />
      <Caption text="SMART [CART]" size={124} at={ev.cap5} out={ev.cap6 - 12} />
      <Caption text="ORDERS GO TO|[ADMIN PANEL]" size={112} at={ev.cap6} out={10000} />

      {/* Desktop browser */}
      {showBrowser && (
        <AbsoluteFill
          style={{
            transform: `translateX(${-whipOut * 1300}px)`,
            filter: bBlur > 0.5 ? 'url(#mb-browser)' : undefined,
          }}
        >
          {bBlur > 0.5 && <MotionBlurFilter id="mb-browser" amount={bBlur} />}
          <AbsoluteFill style={{ transform: `translate(${ztx}px, ${zty}px) scale(${zs})`, transformOrigin: `${zcx}px ${zcy}px` }}>
            <div style={{ position: 'absolute', left: BX, top: BY, perspective: 1800 }}>
              <div style={{ transform: `rotateX(${tilt}deg) scale(${push})`, transformOrigin: '50% 0%' }}>
                <BrowserFrame width={BW} contentHeight={BH} barHeight={BAR} url={<TypingText text="broh.pk" start={ev.urlType} seed="url" caretUntil={ev.cap2} />}>
                  <ScreenLayer src={BROH.d('full')} viewWidth={BW} cssWidth={1440} scrollY={scroll} />
                  <ScreenLayer src={BROH.d('top-slide2')} viewWidth={BW} cssWidth={1440} style={{ opacity: slide2Opacity }} />
                </BrowserFrame>
              </div>
            </div>
          </AbsoluteFill>
          <CalloutTag
            rect={{ x: ZX - (bw * ZS) / 2, y: ZY - (bh * ZS) / 2, w: bw * ZS, h: bh * ZS }}
            label="Offers built in"
            at={ev.tagOffers}
            side="bottom"
            size={34}
            pad={14}
          />
        </AbsoluteFill>
      )}

      {/* Phone */}
      {frame >= ev.swap && (
        <AbsoluteFill
          style={{
            transform: `translateX(${(1 - phoneIn) * 1100}px)`,
            filter: pBlur > 0.5 ? 'url(#mb-phone)' : undefined,
          }}
        >
          {pBlur > 0.5 && <MotionBlurFilter id="mb-phone" amount={pBlur} />}
          <div
            style={{
              position: 'absolute',
              left: PX,
              top: phoneY,
              perspective: 1800,
              transform: `scale(${phoneS})`,
              transformOrigin: '50% 0%',
            }}
          >
            <div style={{ transform: `rotateY(${(1 - phoneIn) * -24}deg)` }}>
              <PhoneFrame screenWidth={SW}>{screenLayers}</PhoneFrame>
              <div style={{ position: 'absolute', left: POFF, top: POFF, width: SW, height: (SW * 844) / 390 }}>
                <Cursor
                  variant="touch"
                  size={66}
                  path={[
                    { f: ev.tapCard - 14, x: rest.x, y: rest.y },
                    { f: ev.tapCard, x: card.x, y: card.y, click: true },
                    { f: ev.tapDouble - 14, x: card.x + 40, y: card.y + 120 },
                    { f: ev.tapDouble, x: dbl.x, y: dbl.y, click: true },
                    { f: ev.tapAdd, x: add.x, y: add.y, click: true },
                  ]}
                  hideAt={ev.tapAdd + 10}
                />
                <Cursor
                  variant="touch"
                  size={66}
                  path={[
                    { f: ev.tapViewCart - 12, x: vc.x + 40, y: vc.y - 160 },
                    { f: ev.tapViewCart, x: vc.x, y: vc.y, click: true },
                  ]}
                  hideAt={ev.tapViewCart + 10}
                />
                <Cursor
                  variant="touch"
                  size={66}
                  path={[
                    { f: ev.tapCheckout - 12, x: ck.x - 60, y: ck.y - 150 },
                    { f: ev.tapCheckout, x: ck.x, y: ck.y, click: true },
                    { f: ev.tapPlace - 14, x: place.x + 60, y: place.y - 160 },
                    { f: ev.tapPlace, x: place.x, y: place.y, click: true },
                  ]}
                  hideAt={ev.tapPlace + 12}
                />
                <CalloutTag
                  rect={{ x: 8 * PK, y: 196 * PK, w: 374 * PK, h: 146 * PK }}
                  label="Upsells"
                  at={ev.tagUpsell}
                  outAt={ev.phoneMove}
                  side="top"
                  size={30}
                  pad={6}
                />
                <CalloutTag
                  rect={{ x: 12 * PK, y: 520 * PK, w: 366 * PK, h: 44 * PK }}
                  label="Savings shown"
                  at={ev.tagSave}
                  outAt={ev.phoneMove}
                  side="bottom"
                  size={30}
                  pad={6}
                />
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* New-order toast (illustrates orders reaching the admin panel; the panel itself is not shown) */}
      <div style={{ position: 'absolute', left: 110, top: 660 }}>
        <NotificationToast title="New order received" sub="Smash Divine · Double" at={ev.toast} width={860} size={36} />
      </div>
    </AbsoluteFill>
  );
};
