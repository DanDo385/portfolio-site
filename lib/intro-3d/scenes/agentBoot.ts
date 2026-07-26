import * as THREE from 'three';
import {
  depthSizes,
  generateCandles,
  layoutCandles,
  makeCandle,
  makeChartFrame,
  makeDepthBar,
  makeDeskFloor,
  makeTextLabel,
} from '../charts';
import {
  COLORS,
  createSceneKit,
  easeOutCubic,
  orbitDeskCamera,
  runTimedScene,
} from '../shared';
import type { IntroSceneController } from '../types';

/** Three-pane agent desk with angled monitors and orbital camera. */
export function createAgentBootScene(
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

  const center = new THREE.Group();
  center.add(makeChartFrame(4.2, 4.6, 4, 4));
  desk.add(center);

  const cTitle = makeTextLabel('AGENT RUNTIME', {
    color: '#b8893d',
    fontSize: 20,
    align: 'center',
    maxWidth: 2.5,
  });
  cTitle.position.set(0, 1.95, 0.07);
  center.add(cTitle);

  const steps = [
    { t: 'LOAD CONTEXT', d: 'market + book + news' },
    { t: 'CALL TOOLS', d: 'rpc · depth · funding' },
    { t: 'REASON', d: 'regime + edge check' },
    { t: 'VERIFY', d: 'risk · size · limits' },
    { t: 'EMIT', d: 'order intent + rationale' },
  ];
  const stepRows: THREE.Group[] = [];
  steps.forEach((s, i) => {
    const row = new THREE.Group();
    const y = 1.2 - i * 0.52;
    const bullet = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.03),
      new THREE.MeshBasicMaterial({
        color: COLORS.teal,
        transparent: true,
        opacity: 0.65,
      })
    );
    bullet.position.set(-1.6, y, 0.07);
    row.add(bullet);

    const label = makeTextLabel(s.t, {
      color: '#c8d0e0',
      fontSize: 16,
      maxWidth: 1.8,
      opacity: 0.88,
    });
    label.position.set(-1.35, y + 0.05, 0.07);
    row.add(label);

    const detail = makeTextLabel(s.d, {
      color: '#6b7a94',
      fontSize: 12,
      maxWidth: 2.2,
      opacity: 0.65,
    });
    detail.position.set(-1.35, y - 0.14, 0.07);
    row.add(detail);

    row.scale.setScalar(0.01);
    stepRows.push(row);
    center.add(row);
  });

  const loop = makeTextLabel('LOOP  idle → observe → act', {
    color: '#4a9e9e',
    fontSize: 14,
    align: 'center',
    maxWidth: 2.8,
    opacity: 0.75,
  });
  loop.position.set(0, -1.95, 0.08);
  loop.scale.setScalar(0.01);
  center.add(loop);

  const left = new THREE.Group();
  left.position.set(-4.55, 0, -0.15);
  left.rotation.y = 0.32;
  desk.add(left);
  left.add(makeChartFrame(3.4, 4.6, 3, 4));
  const lTitle = makeTextLabel('CONTEXT  ·  ETH', {
    color: '#6a8fb8',
    fontSize: 14,
    maxWidth: 1.8,
  });
  lTitle.position.set(-1.3, 1.95, 0.07);
  left.add(lTitle);

  const raw = generateCandles(12, 55, 3242);
  const laid = layoutCandles(raw, 3.2, 0.1);
  const pitch = 0.22;
  const sx = -((raw.length - 1) * pitch) / 2;
  laid.candles.forEach((c, i) => {
    const g = makeCandle(c, 0.16);
    g.position.set(sx + i * pitch, 0, 0.06);
    g.scale.setScalar(0.01);
    g.userData.candle = true;
    left.add(g);
  });

  const right = new THREE.Group();
  right.position.set(4.55, 0, -0.15);
  right.rotation.y = -0.32;
  desk.add(right);
  right.add(makeChartFrame(3.4, 4.6, 3, 4));
  const rTitle = makeTextLabel('TOOL  ·  DOM', {
    color: '#5fad92',
    fontSize: 14,
    maxWidth: 1.6,
  });
  rTitle.position.set(-1.2, 1.95, 0.07);
  right.add(rTitle);

  const bids = depthSizes(8, 3);
  const asks = depthSizes(8, 17);
  const depthBars: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const y = 1.35 - i * 0.34;
    const b = makeDepthBar(bids[i]! * 0.5, COLORS.bid, 'left');
    b.position.set(-0.04, y, 0.06);
    b.scale.x = 0.001;
    b.userData.target = bids[i]! * 0.5;
    depthBars.push(b);
    right.add(b);
    const a = makeDepthBar(asks[i]! * 0.5, COLORS.ask, 'right');
    a.position.set(0.04, y, 0.06);
    a.scale.x = 0.001;
    a.userData.target = asks[i]! * 0.5;
    depthBars.push(a);
    right.add(a);
  }

  const logs = [
    'tool.depth(ETH-USD)  ok',
    'tool.funding()  +0.012%',
    'risk.check(size=0.4)  pass',
    'intent.limit(3247.0)  queued',
  ];
  const logLines: THREE.Object3D[] = [];
  logs.forEach((line, i) => {
    const l = makeTextLabel(line, {
      color: i === logs.length - 1 ? '#c9a05a' : '#6b7a94',
      fontSize: 12,
      maxWidth: 4.2,
      opacity: 0.7,
    });
    l.position.set(-2.0, -2.55, 0.15);
    l.scale.setScalar(0.01);
    l.userData.logIndex = i;
    logLines.push(l);
    desk.add(l);
  });

  left.scale.setScalar(0.01);
  right.scale.setScalar(0.01);
  center.scale.setScalar(0.01);

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      const assemble = easeOutCubic(Math.min(1, t / 0.35));
      center.scale.setScalar(0.01 + assemble * 0.99);
      left.scale.setScalar(0.01 + easeOutCubic(Math.min(1, Math.max(0, (t - 0.08) / 0.3))) * 0.99);
      right.scale.setScalar(0.01 + easeOutCubic(Math.min(1, Math.max(0, (t - 0.12) / 0.3))) * 0.99);

      left.traverse((o) => {
        if (o.userData.candle) o.scale.setScalar(assemble);
      });
      depthBars.forEach((b) => {
        b.scale.x = assemble * (b.userData.target as number);
      });

      stepRows.forEach((row, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.15 - i * 0.07) / 0.22)));
        row.scale.setScalar(0.01 + local * 0.99);
      });
      loop.scale.setScalar(
        0.01 + easeOutCubic(Math.min(1, Math.max(0, (t - 0.45) / 0.25))) * 0.99
      );

      logLines.forEach((line, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.35 - i * 0.08) / 0.2)));
        line.scale.setScalar(0.01 + local * 0.99);
        line.position.y = -2.55 + i * 0.26 * local;
      });

      orbitDeskCamera(camera, desk, t, {
        radius: 12.4,
        height: 4.1,
        yawSpan: 1.18,
        rollSpan: 0.52,
        tiltX: -0.4,
        zoomIn: 3.3,
      });
    },
  });
}
