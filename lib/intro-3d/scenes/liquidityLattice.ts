import * as THREE from 'three';
import {
  depthSizes,
  makeChartFrame,
  makeDepthBar,
  makeDeskFloor,
  makeTextLabel,
} from '../charts';
import {
  COLORS,
  createSceneKit,
  easeInOutCubic,
  easeOutCubic,
  orbitDeskCamera,
  runTimedScene,
} from '../shared';
import type { IntroSceneController } from '../types';

/** Depth-of-market board with orbital camera and quiet terminal styling. */
export function createLiquidityLatticeScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.032);
  root.add(makeDeskFloor(24));

  const desk = new THREE.Group();
  root.add(desk);

  const frame = makeChartFrame(11.2, 7.2, 8, 6);
  desk.add(frame);

  const title = makeTextLabel('ETH-USD  ·  DEPTH OF MARKET', {
    color: '#b8893d',
    fontSize: 24,
    maxWidth: 4.0,
  });
  title.position.set(-4.8, 3.15, 0.06);
  desk.add(title);

  const midPx = 3247.5;
  const tick = 0.5;
  const levels = 12;
  const bidSizes = depthSizes(levels, 11);
  const askSizes = depthSizes(levels, 29);
  const bars: THREE.Mesh[] = [];

  for (let i = 0; i < levels; i++) {
    const y = 2.35 - i * 0.4;
    const bidPx = midPx - tick * (i + 1);
    const askPx = midPx + tick * (i + 1);

    const bid = makeDepthBar(bidSizes[i]!, COLORS.bid, 'left');
    bid.position.set(-0.1, y, 0.05);
    bid.scale.x = 0.001;
    bid.userData.target = bidSizes[i]!;
    bars.push(bid);
    desk.add(bid);

    const ask = makeDepthBar(askSizes[i]!, COLORS.ask, 'right');
    ask.position.set(0.1, y, 0.05);
    ask.scale.x = 0.001;
    ask.userData.target = askSizes[i]!;
    bars.push(ask);
    desk.add(ask);

    const bidLabel = makeTextLabel(bidPx.toFixed(1), {
      color: '#5fad92',
      fontSize: 18,
      align: 'right',
      maxWidth: 0.8,
      opacity: 0.75,
    });
    bidLabel.position.set(-5.05, y, 0.07);
    desk.add(bidLabel);

    const askLabel = makeTextLabel(askPx.toFixed(1), {
      color: '#c47a86',
      fontSize: 18,
      align: 'left',
      maxWidth: 0.8,
      opacity: 0.75,
    });
    askLabel.position.set(5.05, y, 0.07);
    desk.add(askLabel);
  }

  const midY = 2.35 + 0.26;
  const midLine = new THREE.Mesh(
    new THREE.BoxGeometry(10.4, 0.018, 0.01),
    new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.65 })
  );
  midLine.position.set(0, midY, 0.06);
  midLine.scale.x = 0.001;
  desk.add(midLine);

  const lastLabel = makeTextLabel(`LAST  ${midPx.toFixed(1)}`, {
    color: '#c9a05a',
    fontSize: 22,
    align: 'center',
    maxWidth: 2.2,
  });
  lastLabel.position.set(0, midY + 0.34, 0.08);
  lastLabel.scale.setScalar(0.01);
  desk.add(lastLabel);

  const spread = makeTextLabel('SPREAD  0.50   ·   1.2M BID / 1.1M ASK', {
    color: '#6b7a94',
    fontSize: 16,
    align: 'center',
    maxWidth: 4.4,
    opacity: 0.7,
  });
  spread.position.set(0, -3.2, 0.07);
  spread.scale.setScalar(0.01);
  desk.add(spread);

  const bidHdr = makeTextLabel('BID', { color: '#5fad92', fontSize: 18, maxWidth: 0.5, opacity: 0.8 });
  bidHdr.position.set(-3.1, 3.1, 0.07);
  desk.add(bidHdr);
  const askHdr = makeTextLabel('ASK', { color: '#c47a86', fontSize: 18, maxWidth: 0.5, opacity: 0.8 });
  askHdr.position.set(2.6, 3.1, 0.07);
  desk.add(askHdr);

  const cumBidPts: THREE.Vector3[] = [new THREE.Vector3(-0.1, 2.55, 0.03)];
  const cumAskPts: THREE.Vector3[] = [new THREE.Vector3(0.1, 2.55, 0.03)];
  let cumB = 0;
  let cumA = 0;
  for (let i = 0; i < levels; i++) {
    cumB += bidSizes[i]!;
    cumA += askSizes[i]!;
    const y = 2.35 - i * 0.4;
    cumBidPts.push(new THREE.Vector3(-0.1 - cumB * 0.5, y, 0.03));
    cumAskPts.push(new THREE.Vector3(0.1 + cumA * 0.5, y, 0.03));
  }
  const cumBid = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(cumBidPts),
    new THREE.LineBasicMaterial({ color: COLORS.bid, transparent: true, opacity: 0 })
  );
  const cumAsk = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(cumAskPts),
    new THREE.LineBasicMaterial({ color: COLORS.ask, transparent: true, opacity: 0 })
  );
  desk.add(cumBid, cumAsk);

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      const rise = easeOutCubic(Math.min(1, t / 0.45));
      for (const bar of bars) {
        bar.scale.x = rise * (bar.userData.target as number);
      }
      midLine.scale.x = easeOutCubic(Math.min(1, Math.max(0, (t - 0.12) / 0.3)));
      const lock = easeOutCubic(Math.min(1, Math.max(0, (t - 0.35) / 0.25)));
      lastLabel.scale.setScalar(0.01 + lock * 0.99);
      spread.scale.setScalar(0.01 + lock * 0.99);
      (cumBid.material as THREE.LineBasicMaterial).opacity = lock * 0.35;
      (cumAsk.material as THREE.LineBasicMaterial).opacity = lock * 0.35;

      if (t > 0.4 && t < 0.85) {
        const pulse = 1 + Math.sin(t * 18) * 0.025;
        bars[0]!.scale.x = (bars[0]!.userData.target as number) * rise * pulse;
        bars[1]!.scale.x = (bars[1]!.userData.target as number) * rise * pulse;
      }

      orbitDeskCamera(camera, desk, t, {
        radius: 12.2,
        height: 4.2,
        yawSpan: 1.15,
        rollSpan: 0.48,
        tiltX: -0.42,
        zoomIn: 3.2,
      });

      if (t > 0.78) {
        const fade = easeInOutCubic((t - 0.78) / 0.22);
        for (const bar of bars) {
          const m = bar.material as THREE.MeshBasicMaterial;
          m.opacity = 0.55 * (1 - fade);
        }
      }
    },
  });
}
