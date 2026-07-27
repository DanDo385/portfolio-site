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
  driveTrailerCamera,
  easeOutCubic,
  makeTickerStrip,
  runTimedScene,
  setIntroBeat,
} from '../shared';
import type { IntroSceneController } from '../types';

/** Theatrical depth-of-market trailer: readable ladder, last print, spread. */
export function createLiquidityLatticeScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.03);
  root.add(makeDeskFloor(24));

  const spot = new THREE.PointLight(COLORS.gold, 0.55, 18);
  spot.position.set(0, 4.2, 3.5);
  scene.add(spot);

  const desk = new THREE.Group();
  root.add(desk);

  const frame = makeChartFrame(11.2, 7.2, 8, 6);
  desk.add(frame);

  const tape = makeTickerStrip(
    10.6,
    COLORS.gold,
    'ETH-USD  3247.50  +0.42%   ·   BTC  97,420   ·   SOL  178.20   ·   US10Y  4.18%'
  );
  tape.position.set(0, 3.45, 0.12);
  tape.scale.setScalar(0.01);
  desk.add(tape);

  const title = makeTextLabel('ETH-USD  ·  DEPTH OF MARKET', {
    color: '#b8893d',
    fontSize: 24,
    maxWidth: 4.2,
  });
  title.position.set(-4.8, 2.95, 0.06);
  desk.add(title);

  const midPx = 3247.5;
  const tick = 0.5;
  const levels = 12;
  const bidSizes = depthSizes(levels, 11);
  const askSizes = depthSizes(levels, 29);
  const bars: THREE.Mesh[] = [];
  const sizeLabels: THREE.Object3D[] = [];

  for (let i = 0; i < levels; i++) {
    const y = 2.2 - i * 0.38;
    const bidPx = midPx - tick * (i + 1);
    const askPx = midPx + tick * (i + 1);
    const bidSz = bidSizes[i]!;
    const askSz = askSizes[i]!;

    const bid = makeDepthBar(bidSz, COLORS.bid, 'left');
    bid.position.set(-0.15, y, 0.05);
    bid.scale.x = 0.001;
    bid.userData.target = bidSz;
    bars.push(bid);
    desk.add(bid);

    const ask = makeDepthBar(askSz, COLORS.ask, 'right');
    ask.position.set(0.15, y, 0.05);
    ask.scale.x = 0.001;
    ask.userData.target = askSz;
    bars.push(ask);
    desk.add(ask);

    const bidLabel = makeTextLabel(bidPx.toFixed(1), {
      color: '#5fad92',
      fontSize: 17,
      align: 'right',
      maxWidth: 0.85,
      opacity: 0.8,
    });
    bidLabel.position.set(-5.1, y, 0.07);
    desk.add(bidLabel);

    const askLabel = makeTextLabel(askPx.toFixed(1), {
      color: '#c47a86',
      fontSize: 17,
      align: 'left',
      maxWidth: 0.85,
      opacity: 0.8,
    });
    askLabel.position.set(5.1, y, 0.07);
    desk.add(askLabel);

    const bidQty = makeTextLabel((12.4 - i * 0.7).toFixed(1), {
      color: '#4a7a68',
      fontSize: 13,
      align: 'right',
      maxWidth: 0.55,
      opacity: 0.55,
    });
    bidQty.position.set(-4.15, y, 0.07);
    bidQty.scale.setScalar(0.01);
    sizeLabels.push(bidQty);
    desk.add(bidQty);

    const askQty = makeTextLabel((11.1 - i * 0.65).toFixed(1), {
      color: '#8a5560',
      fontSize: 13,
      align: 'left',
      maxWidth: 0.55,
      opacity: 0.55,
    });
    askQty.position.set(4.15, y, 0.07);
    askQty.scale.setScalar(0.01);
    sizeLabels.push(askQty);
    desk.add(askQty);
  }

  const midY = 2.2 + 0.28;
  const midLine = new THREE.Mesh(
    new THREE.BoxGeometry(10.4, 0.02, 0.012),
    new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.7 })
  );
  midLine.position.set(0, midY, 0.06);
  midLine.scale.x = 0.001;
  desk.add(midLine);

  const lastTick = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.28, 0.04),
    new THREE.MeshBasicMaterial({ color: COLORS.goldLight, transparent: true, opacity: 0.9 })
  );
  lastTick.position.set(0, midY, 0.1);
  lastTick.scale.setScalar(0.01);
  desk.add(lastTick);

  const lastLabel = makeTextLabel(`LAST  ${midPx.toFixed(1)}`, {
    color: '#c9a05a',
    fontSize: 24,
    align: 'center',
    maxWidth: 2.4,
  });
  lastLabel.position.set(0, midY + 0.38, 0.1);
  lastLabel.scale.setScalar(0.01);
  desk.add(lastLabel);

  const spread = makeTextLabel('SPREAD  0.50   ·   1.2M BID / 1.1M ASK', {
    color: '#6b7a94',
    fontSize: 16,
    align: 'center',
    maxWidth: 4.6,
    opacity: 0.75,
  });
  spread.position.set(0, -3.2, 0.07);
  spread.scale.setScalar(0.01);
  desk.add(spread);

  const bidHdr = makeTextLabel('BID', {
    color: '#5fad92',
    fontSize: 18,
    maxWidth: 0.5,
    opacity: 0.85,
  });
  bidHdr.position.set(-3.1, 2.9, 0.07);
  desk.add(bidHdr);
  const askHdr = makeTextLabel('ASK', {
    color: '#c47a86',
    fontSize: 18,
    maxWidth: 0.5,
    opacity: 0.85,
  });
  askHdr.position.set(2.6, 2.9, 0.07);
  desk.add(askHdr);

  const cumBidPts: THREE.Vector3[] = [new THREE.Vector3(-0.15, 2.4, 0.03)];
  const cumAskPts: THREE.Vector3[] = [new THREE.Vector3(0.15, 2.4, 0.03)];
  let cumB = 0;
  let cumA = 0;
  for (let i = 0; i < levels; i++) {
    cumB += bidSizes[i]!;
    cumA += askSizes[i]!;
    const y = 2.2 - i * 0.38;
    cumBidPts.push(new THREE.Vector3(-0.15 - cumB * 0.48, y, 0.03));
    cumAskPts.push(new THREE.Vector3(0.15 + cumA * 0.48, y, 0.03));
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
      const rise = easeOutCubic(Math.min(1, t / 0.42));
      for (const bar of bars) {
        bar.scale.x = rise * (bar.userData.target as number);
      }
      for (const lbl of sizeLabels) {
        lbl.scale.setScalar(0.01 + rise * 0.99);
      }

      midLine.scale.x = easeOutCubic(Math.min(1, Math.max(0, (t - 0.1) / 0.28)));
      const lock = easeOutCubic(Math.min(1, Math.max(0, (t - 0.32) / 0.22)));
      lastLabel.scale.setScalar(0.01 + lock * 0.99);
      lastTick.scale.setScalar(0.01 + lock * 0.99);
      spread.scale.setScalar(0.01 + lock * 0.99);
      tape.scale.setScalar(0.01 + easeOutCubic(Math.min(1, t / 0.25)) * 0.99);
      (cumBid.material as THREE.LineBasicMaterial).opacity = lock * 0.4;
      (cumAsk.material as THREE.LineBasicMaterial).opacity = lock * 0.4;

      if (t > 0.38 && t < 0.82) {
        const pulse = 1 + Math.sin(t * 16) * 0.03;
        bars[0]!.scale.x = (bars[0]!.userData.target as number) * rise * pulse;
        bars[1]!.scale.x = (bars[1]!.userData.target as number) * rise * pulse;
        lastTick.position.y = midY + Math.sin(t * 14) * 0.02;
      }

      if (t < 0.28) setIntroBeat(overlay, 'ORDER BOOK', t > 0.05);
      else if (t < 0.55) setIntroBeat(overlay, 'LAST  3247.50', true);
      else setIntroBeat(overlay, 'SPREAD  0.50', t < 0.88);

      spot.intensity = 0.35 + lock * 0.45;
      driveTrailerCamera(camera, desk, t, 'frontalPush', { lookY: 0.15 });
    },
  });
}
