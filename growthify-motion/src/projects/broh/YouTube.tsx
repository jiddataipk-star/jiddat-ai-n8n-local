// Growthify Builds: Broh — 16:9 YouTube cut (1920×1080, 72 s).
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Background, C, ColourWipe, Header, WhipTransition } from '../../kit';
import { BuildYT } from './BuildYT';
import { EndScene, HookScene, IncludedScene, IntroScene, LiveScene, ProblemScene } from './scenes';
import timeline from './timeline-yt.json';

const T = timeline.scenes as Record<string, { from: number; dur: number; ev: Record<string, number> }>;

export const YT_FRAMES = timeline.frames;

export const BrohYouTube: React.FC = () => {
  const frame = useCurrentFrame();
  const seq = (id: string, node: React.ReactNode) => (
    <Sequence key={id} from={T[id].from} durationInFrames={T[id].dur} name={id}>
      {node}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />
      {seq('hook', <HookScene ev={T.hook.ev} dur={T.hook.dur} />)}
      {seq(
        'intro',
        <WhipTransition dur={T.intro.dur} exit={8} id="yw-intro">
          <IntroScene ev={T.intro.ev} dur={T.intro.dur} />
        </WhipTransition>,
      )}
      {seq(
        'problem',
        <WhipTransition dur={T.problem.dur} enter={8} exit={8} id="yw-problem">
          <ProblemScene ev={T.problem.ev} dur={T.problem.dur} />
        </WhipTransition>,
      )}
      {seq(
        'build',
        <WhipTransition dur={T.build.dur} enter={8} id="yw-build">
          <BuildYT ev={T.build.ev} dur={T.build.dur} />
        </WhipTransition>,
      )}
      {seq('included', <IncludedScene ev={T.included.ev} dur={T.included.dur} />)}
      {seq('live', <LiveScene ev={T.live.ev} dur={T.live.dur} />)}
      {seq('end', <EndScene ev={T.end.ev} dur={T.end.dur} />)}
      <Header pill="CLIENT PROJECT" logoOpacity={frame < T.end.from ? 1 : 0} />
      <ColourWipe mid={T.intro.from} dir="up" />
      <ColourWipe mid={T.included.from} dir="left" />
      <ColourWipe mid={T.end.from} dir="up" />
    </AbsoluteFill>
  );
};
