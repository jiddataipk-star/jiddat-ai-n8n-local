// Broh 16:9: the longer walkthrough. Text column left, device right, one explanation line per section.
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
  ScreenLayer,
  SubLine,
  tween,
  typedLength,
  TypingText,
} from '../../kit';
import { BROH } from './data';
import { SceneProps } from './scenes';

const BX = 760;
const BW = 1080;
const BAR = 56;
const BH = BW / 1.6;
const BY = (1080 - (BH + BAR)) / 2 + 20;
const K = BW / 1440;
const CY = BY + BAR; // top of browser content on the canvas
const SCROLL_B = 1900;

const D = BROH.desktop;
// Desktop CSS (viewport) → canvas
const cv = (x: number, y: number) => ({ x: BX + x * K, y: CY + y * K });
const rect = (x: number, y: number, w: number, h: number) => ({ x: BX + x * K, y: CY + y * K, w: w * K, h: h * K });

const Section: React.FC<{ head: string; sub: string; at: number; out: number }> = ({ head, sub, at, out }) => {
  return (
    <div style={{ position: 'absolute', left: 96, top: 300, width: 600 }}>
      <KineticHeadline text={head} size={100} start={at} outAt={out} />
      <SubLine text={sub} size={34} at={at + 14} outAt={out} style={{ marginTop: 26, maxWidth: 560 }} />
    </div>
  );
};

export const BuildYT: React.FC<SceneProps> = ({ ev, dur }) => {
  const frame = useCurrentFrame();
  const tilt = tween(frame, 0, 24, 12, 0);
  const push = 1 + tween(frame, 10, 130, 0, 0.025);

  // Page scroll on the long screenshot (phases A–C)
  const scroll = keys(frame, [
    [0, 0],
    [ev.scrollB, 0],
    [ev.scrollBEnd, SCROLL_B],
    [ev.scrollC, SCROLL_B],
    [ev.scrollCEnd, D.searchScroll],
  ]);
  const slide2 = 1 - tween(frame, ev.slideSwap, 6);
  const searchN = frame >= ev.type ? typedLength(frame, ev.type, 'smash', 'search') : 0;
  const showSearch = frame >= ev.scrollCEnd && frame < ev.pD + 6;
  const searchFade = tween(frame, ev.scrollCEnd, 4);

  // Phase D/E: product popup → added
  const clickBg = frame >= ev.pD && frame < ev.pG + 8; // stays under the cart drawer until the next screen covers it
  const clickBgIn = tween(frame, ev.pD, 6);
  const modalIn = tween(frame, ev.modalIn, 9, 0, 1, EASE_OUT);
  const modalOut = tween(frame, ev.added, 6);
  const doubleOn = tween(frame, ev.clickDouble + 2, 3);
  const cleanOn = tween(frame, ev.clean, 8);

  // Phase F: cart drawer (slides in over a dimmed page)
  const cartP = tween(frame, ev.cartIn, 12, 0, 1, EASE_OUT);
  // Phase G: order type
  const otIn = tween(frame, ev.pG, 8);
  const listOn = tween(frame, ev.listIn, 4);
  const selOn = tween(frame, ev.selected, 3);
  // Phase H: checkout
  const ckIn = tween(frame, ev.pH, 8);

  // Phase I: swap to phone
  const out = tween(frame, ev.pI, 12, 0, 1, EASE_IN_OUT);
  const phoneIn = tween(frame, ev.pI + 6, 16, 0, 1, EASE_IN_OUT);
  const mscroll = keys(frame, [
    [0, 0],
    [ev.mScroll, 0],
    [ev.mScrollMid, 1150],
    [ev.mScroll2, 1150],
    [ev.mScrollEnd, 1980],
  ]);

  const tab = cv(D['full.BEEFY VIBES'].x + D['full.BEEFY VIBES'].w / 2, D['full.BEEFY VIBES'].vy + D['full.BEEFY VIBES'].h / 2);
  const badge = D['full.10off'];
  const search = cv(720, D['full.search'].y - D.searchScroll + D['full.search'].h / 2);
  const card = cv(879, D['click.card'].vy - 150);
  const dbl = cv(D['modal.doubleCard'].x + D['modal.doubleCard'].w / 2, D['modal.doubleCard'].vy + D['modal.doubleCard'].h / 2);
  const add = cv(D['modal.addtocart'].x + D['modal.addtocart'].w / 2, D['modal.addtocart'].vy + D['modal.addtocart'].h / 2);
  const vcb = D['added.viewcartBar'];
  const vc = cv(vcb.x + vcb.w / 2, vcb.vy + vcb.h / 2);
  const dd = cv(D['ordertype.dropdown'].x + D['ordertype.dropdown'].w / 2, D['ordertype.dropdown'].vy + D['ordertype.dropdown'].h / 2);
  const area = cv(535, 409);
  const place = cv(D['checkout.place'].x + D['checkout.place'].w / 2, D['checkout.place'].vy + D['checkout.place'].h / 2);

  const bBlur = out * 70;
  const pBlur = (1 - phoneIn) * 70;

  return (
    <AbsoluteFill>
      <Section head="THEIR OWN|[WEBSITE]" sub="Broh's full menu on their own domain, broh.pk." at={6} out={ev.pB - 12} />
      <Section head="THE FULL [MENU]" sub="Every category one tap away, with offers on each item." at={ev.pB + 2} out={ev.pC - 12} />
      <Section head="FIND IT [FAST]" sub="Customers search the menu instead of scrolling." at={ev.pC + 2} out={ev.pD - 12} />
      <Section head="TAP. [CUSTOMISE.]|ADD." sub="Sizes and add-ons, priced live." at={ev.pD + 2} out={ev.pE - 12} />
      <Section head="ADDED|[INSTANTLY]" sub="A View Cart bar follows the customer down the menu." at={ev.pE + 2} out={ev.pF - 12} />
      <Section head="SMART [CART]" sub="Suggests sauces and shows the savings before checkout." at={ev.pF + 2} out={ev.pG - 12} />
      <Section head="DELIVERY OR|[PICK-UP]" sub="Customers pick their area across Faisalabad." at={ev.pG + 2} out={ev.pH - 12} />
      <Section head="ORDERS GO TO|[ADMIN PANEL]" sub="Cash-on-delivery checkout. Every order lands in Broh's admin panel." at={ev.pH + 2} out={ev.pI - 12} />
      <Section head="BUILT FOR [MOBILE]" sub="The same ordering flow, made for phones." at={ev.pI + 6} out={dur + 100} />

      {frame < ev.pI + 14 && (
        <AbsoluteFill style={{ transform: `translateX(${-out * 1900}px)`, filter: bBlur > 0.5 ? 'url(#mb-yt-b)' : undefined }}>
          {bBlur > 0.5 && <MotionBlurFilter id="mb-yt-b" amount={bBlur} />}
          <div style={{ position: 'absolute', left: BX, top: BY, perspective: 2000 }}>
            <div style={{ transform: `rotateX(${tilt}deg) scale(${push})`, transformOrigin: '50% 0%' }}>
              <BrowserFrame width={BW} contentHeight={BH} barHeight={BAR} url={<TypingText text="broh.pk" start={ev.urlType} seed="url" caretUntil={ev.pB} />}>
                <ScreenLayer src={BROH.d('full')} viewWidth={BW} cssWidth={1440} scrollY={scroll} />
                <ScreenLayer src={BROH.d('top-slide2')} viewWidth={BW} cssWidth={1440} style={{ opacity: slide2 }} />
                {showSearch && <ScreenLayer src={BROH.d(`search-${searchN}`)} viewWidth={BW} cssWidth={1440} style={{ opacity: searchFade }} />}
                {clickBg && (
                  <>
                    <ScreenLayer src={BROH.d('click-bg')} viewWidth={BW} cssWidth={1440} style={{ opacity: clickBgIn }} />
                    {frame >= ev.added && (
                      <>
                        <ScreenLayer src={BROH.d('added-toast')} viewWidth={BW} cssWidth={1440} />
                        <ScreenLayer src={BROH.d('added-clean')} viewWidth={BW} cssWidth={1440} style={{ opacity: cleanOn }} />
                      </>
                    )}
                    {frame >= ev.modalIn && frame < ev.added + 6 && (
                      <div style={{ position: 'absolute', inset: 0, opacity: modalIn * (1 - modalOut), transform: `scale(${0.96 + 0.04 * modalIn})` }}>
                        <ScreenLayer src={BROH.d('modal-single')} viewWidth={BW} cssWidth={1440} />
                        <ScreenLayer src={BROH.d('modal-double')} viewWidth={BW} cssWidth={1440} style={{ opacity: doubleOn }} />
                      </div>
                    )}
                  </>
                )}
                {frame >= ev.cartIn && frame < ev.pG + 8 && (
                  <>
                    <ScreenLayer src={BROH.d('cart')} viewWidth={BW} cssWidth={1440} style={{ opacity: cartP, clipPath: 'inset(0 420px 0 0)' }} />
                    <ScreenLayer
                      src={BROH.d('cart')}
                      viewWidth={BW}
                      cssWidth={1440}
                      style={{ clipPath: `inset(0 0 0 ${1020 * K}px)`, transform: `translateX(${(1 - cartP) * 420 * K}px)` }}
                    />
                  </>
                )}
                {frame >= ev.pG && frame < ev.pH + 8 && (
                  <div style={{ position: 'absolute', inset: 0, opacity: otIn }}>
                    <ScreenLayer src={BROH.d('ordertype-delivery')} viewWidth={BW} cssWidth={1440} />
                    <ScreenLayer src={BROH.d('ordertype-dropdown')} viewWidth={BW} cssWidth={1440} style={{ opacity: listOn * (1 - selOn) }} />
                    <ScreenLayer src={BROH.d('ordertype-selected')} viewWidth={BW} cssWidth={1440} style={{ opacity: selOn }} />
                  </div>
                )}
                {frame >= ev.pH && (
                  <ScreenLayer src={BROH.d('checkout')} viewWidth={BW} cssWidth={1440} style={{ opacity: ckIn }} />
                )}
              </BrowserFrame>
            </div>
          </div>
          <CalloutTag rect={rect(badge.x, badge.y - SCROLL_B, badge.w, badge.h)} label="Offers built in" at={ev.tagOffers} outAt={ev.pC - 6} side="right" size={26} pad={8} />
          <CalloutTag rect={rect(vcb.x, vcb.vy, vcb.w, vcb.h)} label="View cart bar" at={ev.tagViewCart} outAt={ev.pF} side="top" size={26} pad={8} radius={40} />
          <CalloutTag rect={rect(1030, 262, 400, 196)} label="Upsells" at={ev.tagUpsell} outAt={ev.pG - 6} side="left" size={26} pad={6} />
          <CalloutTag rect={rect(1036, 712, 390, 50)} label="Savings shown" at={ev.tagSave} outAt={ev.pG - 6} side="left" size={26} pad={6} />
          <CalloutTag rect={rect(628, 385, 184, 37)} label="Delivery + pick-up" at={ev.tagToggle} outAt={ev.pH - 6} side="right" size={26} pad={10} radius={14} />
          <Cursor path={[{ f: ev.clickTab - 22, x: 1500, y: 900 }, { f: ev.clickTab, x: tab.x, y: tab.y, click: true }]} hideAt={ev.clickTab + 16} size={58} />
          <Cursor path={[{ f: ev.clickSearch - 20, x: 1600, y: 700 }, { f: ev.clickSearch, x: search.x - 120, y: search.y, click: true }]} hideAt={ev.pD - 10} size={58} />
          <Cursor
            path={[
              { f: ev.clickCard - 22, x: 1250, y: 860 },
              { f: ev.clickCard, x: card.x, y: card.y, click: true },
              { f: ev.clickDouble, x: dbl.x, y: dbl.y, click: true },
              { f: ev.clickAdd, x: add.x, y: add.y, click: true },
            ]}
            hideAt={ev.clickAdd + 14}
            size={58}
          />
          <Cursor path={[{ f: ev.clickViewCart - 20, x: vc.x + 200, y: vc.y - 160 }, { f: ev.clickViewCart, x: vc.x, y: vc.y, click: true }]} hideAt={ev.clickViewCart + 14} size={58} />
          <Cursor
            path={[
              { f: ev.clickDropdown - 22, x: 1500, y: 880 },
              { f: ev.clickDropdown, x: dd.x, y: dd.y, click: true },
              { f: ev.clickArea, x: area.x, y: area.y, click: true },
            ]}
            hideAt={ev.clickArea + 14}
            size={58}
          />
          <Cursor path={[{ f: ev.clickPlace - 24, x: 1300, y: 900 }, { f: ev.clickPlace, x: place.x, y: place.y, click: true }]} hideAt={ev.clickPlace + 18} size={58} />
          <div style={{ position: 'absolute', left: 1170, top: 270 }}>
            <NotificationToast title="New order received" sub="Smash Divine · Double" at={ev.toast} outAt={ev.pI - 4} width={620} size={30} />
          </div>
        </AbsoluteFill>
      )}

      {frame >= ev.pI && (
        <AbsoluteFill style={{ transform: `translateX(${(1 - phoneIn) * 1300}px)`, filter: pBlur > 0.5 ? 'url(#mb-yt-p)' : undefined }}>
          {pBlur > 0.5 && <MotionBlurFilter id="mb-yt-p" amount={pBlur} />}
          <div style={{ position: 'absolute', left: 1040, top: 130, perspective: 2000 }}>
            <div style={{ transform: `rotateY(${-10 + phoneIn * 4}deg) rotateZ(2deg)` }}>
              <PhoneFrame screenWidth={400}>
                <ScreenLayer src={BROH.m('full')} viewWidth={400} cssWidth={390} scrollY={mscroll} />
              </PhoneFrame>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 1500, top: 300, perspective: 2000, opacity: tween(frame, ev.pI + 20, 14) }}>
            <div style={{ transform: `rotateY(-14deg) rotateZ(4deg) translateY(${(1 - tween(frame, ev.pI + 20, 18)) * 120}px)` }}>
              <PhoneFrame screenWidth={300}>
                <ScreenLayer src={BROH.m('modal-double')} viewWidth={300} cssWidth={390} />
              </PhoneFrame>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
