// Brand fonts, bundled locally. Rendering is cancelled if they fail: no system-font fallback.
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import { cancelRender, continueRender, delayRender } from 'remotion';

const FACES = ['400 100px Anton', '500 40px Montserrat', '600 40px Montserrat', '700 40px Montserrat', '800 40px Montserrat'];

const handle = delayRender('Loading Anton + Montserrat');
Promise.all(FACES.map((f) => document.fonts.load(f, 'AB09')))
  .then(() => {
    const missing = FACES.filter((f) => !document.fonts.check(f, 'AB09'));
    if (missing.length) throw new Error(`Fonts not loaded: ${missing.join(', ')}`);
    continueRender(handle);
  })
  .catch((e) => cancelRender(e));
