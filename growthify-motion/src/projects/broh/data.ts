// Broh project data: screen files, measured element boxes (CSS px) and contact details.
import desktopBoxes from '../../../public/clients/broh/desktop/boxes.json';
import mobileBoxes from '../../../public/clients/broh/mobile/boxes.json';

export type Box = { x: number; y: number; w: number; h: number; vy: number };

export const BROH = {
  d: (name: string) => `clients/broh/desktop/${name}.png`,
  m: (name: string) => `clients/broh/mobile/${name}.png`,
  logo: 'clients/broh/broh-logo.png',
  // Growthify's WhatsApp number, shown on the end card at the client's request.
  contact: '0335 6600844',
  desktop: desktopBoxes as unknown as Record<string, Box> & { clickScroll: number; searchScroll: number },
  mobile: mobileBoxes as unknown as Record<string, Box> & { clickScroll: number; searchScroll: number },
};

export const center = (b: Box) => ({ x: b.x + b.w / 2, y: b.vy + b.h / 2 });
