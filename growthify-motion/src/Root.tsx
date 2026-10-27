import React from 'react';
import { Composition, Still } from 'remotion';
import './kit/fonts';
import { BrohReel, REEL_FRAMES } from './projects/broh/Reel';
import { BrohCover, BrohThumbnail } from './projects/broh/Stills';
import { BrohYouTube, YT_FRAMES } from './projects/broh/YouTube';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BrohReel" component={BrohReel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BrohYouTube" component={BrohYouTube} durationInFrames={YT_FRAMES} fps={30} width={1920} height={1080} />
    <Still id="BrohCover" component={BrohCover} width={1080} height={1920} />
    <Still id="BrohThumbnail" component={BrohThumbnail} width={1280} height={720} />
  </>
);
