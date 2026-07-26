import * as THREE from 'three';
import {
  generateCandles,
  layoutCandles,
  makeCandle,
  makeChartFrame,
  makeDeskFloor,
  makeTextLabel,
  makeVolumeBar,
} from '../charts';
import {
  COLORS,
  createSceneKit,
  easeInOutCubic,
  easeOutCubic,
  makeFlatMaterial,
  orbitDeskCamera,
  runTimedScene,
} from '../shared';
import type { IntroSceneController } from '../types';

/** Candles + agent scores on angled boards with a sweeping orbit. */
export function createDualRailScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.03);
  root.add(makeDeskFloor(24));

  const desk = new THREE.Group();
  root.add(desk);

  const left = new THREE.Group();
  const right = new THREE.Group();
  left.position.set(-3.5, 0, 0.2);
  right.position.set(3.5, 0, 0.2);
  left.rotation.y = 0.22;
  right.rotation.y = -0.22;
  desk.add(left, right);

  left.add(makeChartFrame(5.4, 4.3, 5, 4));
  const mTitle = makeTextLabel('ETH-USD  ·  1m', {
    color: '#b8893d',
    fontSize: 20,
    maxWidth: 2.2,
  });
  mTitle.position.set(-2.25, 1.85, 0.07);
  left.add(mTitle);

  const raw = generateCandles(18, 91, 3240);
  const laid = layoutCandles(raw, 3.0, 0.12);
  const candlePitch = 0.25;
  const startX = -((raw.length - 1) * candlePitch) / 2;
  const candles: THREE.Group[] = [];
  const volumes: THREE.Mesh[] = [];

  laid.candles.forEach((c, i) => {
    const g = makeCandle(c, 0.18);
    g.position.x = startX + i * candlePitch;
    g.position.y = 0.2;
    g.scale.setScalar(0.01);
    candles.push(g);
    left.add(g);

    const vol = makeVolumeBar(0.12 + Math.abs(raw[i]!.c - raw[i]!.o) * 0.18, c.c >= c.o, 0.18);
    vol.position.set(startX + i * candlePitch, -1.85, 0.05);
    vol.scale.y = 0.001;
    vol.userData.target = 0.18 + (Math.abs(raw[i]!.c - raw[i]!.o) / 2.5) * 0.55;
    volumes.push(vol);
    left.add(vol);
  });

  const lastPx = raw[raw.length - 1]!.c;
  const pxLabel = makeTextLabel(`${lastPx.toFixed(1)}  +0.42%`, {
    color: '#5fad92',
    fontSize: 18,
    maxWidth: 2.0,
  });
  pxLabel.position.set(1.0, 1.85, 0.07);
  left.add(pxLabel);

  const lastY = laid.candles[laid.candles.length - 1]!.c + 0.2;
  const lastLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.5, lastY, 0.06),
      new THREE.Vector3(2.5, lastY, 0.06),
    ]),
    new THREE.LineDashedMaterial({
      color: COLORS.gold,
      dashSize: 0.1,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.45,
    })
  );
  lastLine.computeLineDistances();
  left.add(lastLine);

  right.add(makeChartFrame(5.4, 4.3, 5, 4));
  const aTitle = makeTextLabel('AGENT  ·  SIGNAL STACK', {
    color: '#4a9e9e',
    fontSize: 20,
    maxWidth: 2.8,
  });
  aTitle.position.set(-2.25, 1.85, 0.07);
  right.add(aTitle);

  const signals = [
    { name: 'MOMENTUM', score: 0.78, color: COLORS.bid },
    { name: 'ORDER FLOW', score: 0.64, color: COLORS.gold },
    { name: 'FUNDING', score: 0.41, color: COLORS.blue },
    { name: 'LIQUIDITY', score: 0.71, color: COLORS.teal },
    { name: 'REGIME', score: 0.55, color: COLORS.goldLight },
  ];
  const scoreBars: THREE.Mesh[] = [];
  signals.forEach((s, i) => {
    const y = 1.15 - i * 0.52;
    const name = makeTextLabel(s.name, {
      color: '#6b7a94',
      fontSize: 16,
      maxWidth: 1.5,
      opacity: 0.8,
    });
    name.position.set(-2.3, y, 0.07);
    right.add(name);

    const track = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.1, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x151c2a, transparent: true, opacity: 0.85 })
    );
    track.position.set(0.45, y, 0.05);
    right.add(track);

    const geo = new THREE.BoxGeometry(1, 0.1, 0.03);
    geo.translate(0.5, 0, 0);
    const fill = new THREE.Mesh(geo, makeFlatMaterial(s.color, 0.7));
    fill.position.set(-1.05, y, 0.07);
    fill.scale.x = 0.001;
    fill.userData.target = s.score * 3.0;
    scoreBars.push(fill);
    right.add(fill);

    const pct = makeTextLabel(`${Math.round(s.score * 100)}`, {
      color: '#b8c2d6',
      fontSize: 14,
      maxWidth: 0.4,
      opacity: 0.75,
    });
    pct.position.set(2.2, y, 0.08);
    right.add(pct);
  });

  const verdict = makeTextLabel('NET  BULLISH  ·  CONF  0.68', {
    color: '#c9a05a',
    fontSize: 18,
    align: 'center',
    maxWidth: 3.2,
  });
  verdict.position.set(0, -1.75, 0.08);
  verdict.scale.setScalar(0.01);
  right.add(verdict);

  const fuse = makeTextLabel('MARKETS  ×  AGENTS', {
    color: '#b8893d',
    fontSize: 24,
    align: 'center',
    maxWidth: 3.8,
  });
  fuse.position.set(0, 2.75, 0.3);
  fuse.scale.setScalar(0.01);
  desk.add(fuse);

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      const assemble = easeOutCubic(Math.min(1, t / 0.28));
      left.scale.setScalar(Math.max(0.01, assemble));
      right.scale.setScalar(Math.max(0.01, assemble));

      candles.forEach((c, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - i * 0.018) / 0.28)));
        c.scale.setScalar(0.01 + local * 0.99);
      });
      volumes.forEach((v) => {
        v.scale.y = assemble * (v.userData.target as number);
      });
      scoreBars.forEach((b, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.1 - i * 0.04) / 0.3)));
        b.scale.x = local * (b.userData.target as number);
      });

      const converge = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.28) / 0.4)));
      left.position.x = -3.5 + converge * 1.1;
      right.position.x = 3.5 - converge * 1.1;
      left.rotation.y = 0.22 - converge * 0.18;
      right.rotation.y = -0.22 + converge * 0.18;

      const lock = easeOutCubic(Math.min(1, Math.max(0, (t - 0.55) / 0.25)));
      verdict.scale.setScalar(0.01 + lock * 0.99);
      fuse.scale.setScalar(0.01 + lock * 0.99);

      orbitDeskCamera(camera, desk, t, {
        radius: 12.5,
        height: 4.0,
        yawSpan: 1.2,
        rollSpan: 0.5,
        tiltX: -0.4,
        zoomIn: 3.4,
      });
    },
  });
}
