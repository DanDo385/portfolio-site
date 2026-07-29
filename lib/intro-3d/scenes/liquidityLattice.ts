import * as THREE from 'three';
import { makeChartFrame, makeDepthBar, makeDeskFloor, makeTextLabel } from '../charts';
import {
  FALLBACK_MARKET_SNAPSHOT,
  formatAsOf,
  formatDepthTape,
  type IntroMarketSnapshot,
} from '../market-data';
import {
  COLORS,
  applyTrailerGrade,
  createSceneKit,
  driveCutCamera,
  easeOutCubic,
  makeDustField,
  makeFlashBurst,
  makeHorizonGlow,
  makeLightShaft,
  makeRippleSet,
  makeScanBeam,
  makeSparkBurst,
  makeTickerStrip,
  runTimedScene,
  setIntroBeat,
  setIntroTitleCard,
  setScanBeamOpacity,
  syncIntroChrome,
  updateDustField,
  updateRippleSet,
  updateSparkBurst,
  type CameraShot,
} from '../shared';
import type { IntroSceneController } from '../types';

function normalizeSizes(sizes: number[], targetMax = 4.2): number[] {
  const max = Math.max(...sizes, 0.01);
  return sizes.map((s) => Math.max(0.25, (s / max) * targetMax));
}

/** Cinematic depth-of-market trailer driven by Coinbase (or fallback) book. */
export function createLiquidityLatticeScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void,
  snapshot: IntroMarketSnapshot = FALLBACK_MARKET_SNAPSHOT
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.02);
  root.add(makeDeskFloor(28));
  root.add(makeHorizonGlow(26, 12));

  const dust = makeDustField(260, 18, 0xc9a05a);
  root.add(dust);

  const shaftL = makeLightShaft(11, COLORS.bid);
  shaftL.position.set(-4.5, 1.2, -1.5);
  shaftL.rotation.z = 0.12;
  root.add(shaftL);
  const shaftR = makeLightShaft(11, COLORS.ask);
  shaftR.position.set(4.5, 1.2, -1.5);
  shaftR.rotation.z = -0.12;
  root.add(shaftR);

  const spot = new THREE.PointLight(COLORS.gold, 0.85, 22);
  spot.position.set(0, 4.6, 4);
  scene.add(spot);
  const bidLight = new THREE.PointLight(COLORS.bid, 0.45, 14);
  bidLight.position.set(-3.8, 1.6, 2.2);
  scene.add(bidLight);
  const askLight = new THREE.PointLight(COLORS.ask, 0.45, 14);
  askLight.position.set(3.8, 1.6, 2.2);
  scene.add(askLight);

  const desk = new THREE.Group();
  root.add(desk);

  const scan = makeScanBeam(7.6, COLORS.goldLight);
  desk.add(scan);

  const frame = makeChartFrame(11.2, 7.2, 8, 6);
  desk.add(frame);

  const eth = snapshot.eth;
  const midPx = eth.mid;
  const tick = eth.tick;
  const levels = Math.min(12, eth.bids.length, eth.asks.length);
  const bidSizes = normalizeSizes(eth.bids.slice(0, levels).map((l) => l.size));
  const askSizes = normalizeSizes(eth.asks.slice(0, levels).map((l) => l.size));
  const spreadPx = Number(
    Math.max(
      tick,
      (eth.asks[0]?.price ?? midPx + tick) - (eth.bids[0]?.price ?? midPx - tick)
    ).toFixed(2)
  );
  const asOf = formatAsOf(snapshot.asOf);
  const tapeText = formatDepthTape(eth, snapshot.marks, snapshot.yields.tenY);

  const tape = makeTickerStrip(10.6, COLORS.gold, tapeText);
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

  const asOfTag = makeTextLabel(`AS OF ${asOf}`, {
    color: '#6b7a94',
    fontSize: 12,
    align: 'right',
    maxWidth: 2.2,
    opacity: 0.7,
  });
  asOfTag.position.set(5.0, 2.95, 0.06);
  desk.add(asOfTag);

  const bars: THREE.Mesh[] = [];
  const sizeLabels: THREE.Object3D[] = [];

  for (let i = 0; i < levels; i++) {
    const y = 2.2 - i * 0.38;
    const bidPx = eth.bids[i]?.price ?? midPx - tick * (i + 1);
    const askPx = eth.asks[i]?.price ?? midPx + tick * (i + 1);
    const bidSz = bidSizes[i]!;
    const askSz = askSizes[i]!;
    const bidQtyRaw = eth.bids[i]?.size ?? 0;
    const askQtyRaw = eth.asks[i]?.size ?? 0;

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

    const bidLabel = makeTextLabel(bidPx.toFixed(2), {
      color: '#5fad92',
      fontSize: 17,
      align: 'right',
      maxWidth: 0.95,
      opacity: 0.82,
    });
    bidLabel.position.set(-5.1, y, 0.07);
    desk.add(bidLabel);

    const askLabel = makeTextLabel(askPx.toFixed(2), {
      color: '#c47a86',
      fontSize: 17,
      align: 'left',
      maxWidth: 0.95,
      opacity: 0.82,
    });
    askLabel.position.set(5.1, y, 0.07);
    desk.add(askLabel);

    const bidQty = makeTextLabel(bidQtyRaw.toFixed(2), {
      color: '#4a7a68',
      fontSize: 13,
      align: 'right',
      maxWidth: 0.65,
      opacity: 0.55,
    });
    bidQty.position.set(-4.15, y, 0.07);
    bidQty.scale.setScalar(0.01);
    sizeLabels.push(bidQty);
    desk.add(bidQty);

    const askQty = makeTextLabel(askQtyRaw.toFixed(2), {
      color: '#8a5560',
      fontSize: 13,
      align: 'left',
      maxWidth: 0.65,
      opacity: 0.55,
    });
    askQty.position.set(4.15, y, 0.07);
    askQty.scale.setScalar(0.01);
    sizeLabels.push(askQty);
    desk.add(askQty);
  }

  const midY = 2.48;
  const midLine = new THREE.Mesh(
    new THREE.BoxGeometry(10.4, 0.028, 0.016),
    new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.85 })
  );
  midLine.position.set(0, midY, 0.06);
  midLine.scale.x = 0.001;
  desk.add(midLine);

  const lastTick = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.36, 0.06),
    new THREE.MeshBasicMaterial({ color: COLORS.goldLight, transparent: true, opacity: 0.98 })
  );
  lastTick.position.set(0, midY, 0.1);
  lastTick.scale.setScalar(0.01);
  desk.add(lastTick);

  const flash = makeFlashBurst(COLORS.goldLight);
  flash.position.set(0, midY, 0.12);
  desk.add(flash);

  const sparks = makeSparkBurst(48, COLORS.goldLight);
  desk.add(sparks);

  const ripples = makeRippleSet(COLORS.gold, 3);
  ripples.position.set(0, midY, 0.13);
  desk.add(ripples);

  const lastBeat = `LAST  ${midPx.toFixed(2)}`;
  const spreadBeat = `SPREAD  ${spreadPx.toFixed(2)}`;
  const lastLabel = makeTextLabel(lastBeat, {
    color: '#c9a05a',
    fontSize: 24,
    align: 'center',
    maxWidth: 2.6,
  });
  lastLabel.position.set(0, midY + 0.4, 0.1);
  lastLabel.scale.setScalar(0.01);
  desk.add(lastLabel);

  const spread = makeTextLabel(
    `${spreadBeat}   ·   ${eth.bidNotionalM.toFixed(1)}M BID / ${eth.askNotionalM.toFixed(1)}M ASK`,
    {
      color: '#6b7a94',
      fontSize: 16,
      align: 'center',
      maxWidth: 5.2,
      opacity: 0.78,
    }
  );
  spread.position.set(0, -3.2, 0.07);
  spread.scale.setScalar(0.01);
  desk.add(spread);

  const bidHdr = makeTextLabel('BID', { color: '#5fad92', fontSize: 18, maxWidth: 0.5, opacity: 0.88 });
  bidHdr.position.set(-3.1, 2.9, 0.07);
  desk.add(bidHdr);
  const askHdr = makeTextLabel('ASK', { color: '#c47a86', fontSize: 18, maxWidth: 0.5, opacity: 0.88 });
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

  const shots: CameraShot[] = [
    { at: 0, radius: 16.5, height: 5.8, yaw: -0.55, lookY: 0.2, fov: 40, dutch: 0.04 },
    { at: 0.14, radius: 13.2, height: 4.4, yaw: -0.35, lookY: 0.15, fov: 34 },
    { at: 0.48, radius: 9.2, height: 3.2, yaw: -0.08, lookX: 0, lookY: midY * 0.15, fov: 28, dutch: -0.02 },
    { at: 0.58, radius: 10.4, height: 3.5, yaw: 0.12, lookY: 0.2, fov: 30 },
    { at: 0.84, radius: 14.8, height: 5.2, yaw: 0.35, lookY: 0.1, fov: 36 },
  ];

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      const act = applyTrailerGrade(kit, t);
      syncIntroChrome(overlay, act);
      updateDustField(dust, kit.clock.elapsedTime, 0.12);
      (dust.material as THREE.PointsMaterial).opacity =
        act === 'assemble' || act === 'insert' || act === 'climax' ? 0.18 : 0.08;

      const showTitle = act === 'title';
      setIntroTitleCard(overlay, 'DEPTH OF MARKET', showTitle, `ETH-USD · AS OF ${asOf}`);

      const rise = easeOutCubic(Math.min(1, Math.max(0, (t - 0.14) / 0.3)));
      for (const bar of bars) bar.scale.x = rise * (bar.userData.target as number);
      for (const lbl of sizeLabels) lbl.scale.setScalar(0.01 + rise * 0.99);

      const scanT = Math.min(1, Math.max(0, (t - 0.16) / 0.32));
      scan.position.x = -5.3 + scanT * 10.6;
      setScanBeamOpacity(scan, act === 'assemble' && scanT > 0 && scanT < 1 ? 0.55 : 0);

      midLine.scale.x = easeOutCubic(Math.min(1, Math.max(0, (t - 0.18) / 0.22)));
      const lock = easeOutCubic(Math.min(1, Math.max(0, (t - 0.48) / 0.14)));
      lastLabel.scale.setScalar(0.01 + lock * 0.99);
      lastTick.scale.setScalar(0.01 + lock * 0.99);
      spread.scale.setScalar(0.01 + lock * 0.99);
      tape.scale.setScalar(0.01 + easeOutCubic(Math.min(1, Math.max(0, (t - 0.12) / 0.18))) * 0.99);
      tape.position.x = Math.sin(kit.clock.elapsedTime * 0.35) * 0.08;
      (cumBid.material as THREE.LineBasicMaterial).opacity = lock * 0.45;
      (cumAsk.material as THREE.LineBasicMaterial).opacity = lock * 0.45;

      if (act === 'insert' || (act === 'climax' && t < 0.68)) {
        const flashT = Math.min(1, Math.max(0, (t - 0.48) / 0.14));
        (flash.material as THREE.MeshBasicMaterial).opacity = Math.sin(flashT * Math.PI) * 0.7;
        flash.scale.setScalar(0.5 + flashT * 2.2);
      } else {
        (flash.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      updateSparkBurst(sparks, new THREE.Vector3(0, midY, 0.15), 0.5, t, 0.22);
      if (act === 'insert' || act === 'climax') {
        updateRippleSet(ripples, Math.min(1, (t - 0.5) / 0.28), 4.2);
      }

      if (act === 'climax' && bars[0] && bars[1]) {
        const pulse = 1 + Math.sin(t * 16) * 0.04;
        bars[0].scale.x = (bars[0].userData.target as number) * rise * pulse;
        bars[1].scale.x = (bars[1].userData.target as number) * rise * pulse;
        lastTick.position.y = midY + Math.sin(t * 14) * 0.03;
      }

      if (act === 'black' || act === 'title' || act === 'out') setIntroBeat(overlay, '', false);
      else if (act === 'assemble') setIntroBeat(overlay, 'ORDER BOOK', true);
      else if (act === 'insert') setIntroBeat(overlay, lastBeat, true);
      else setIntroBeat(overlay, spreadBeat, t < 0.86);

      (shaftL.material as THREE.MeshBasicMaterial).opacity = 0.03 + rise * 0.05;
      (shaftR.material as THREE.MeshBasicMaterial).opacity = 0.03 + rise * 0.05;
      spot.intensity = 0.35 + lock * 0.7;
      bidLight.intensity = 0.2 + rise * 0.35;
      askLight.intensity = 0.2 + rise * 0.35;
      if (act === 'climax') kit.setBloom(0.55 + lock * 0.4);
      driveCutCamera(camera, desk, t, shots);
    },
  });
}
