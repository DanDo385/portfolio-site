import * as THREE from 'three';
import { makeChartFrame, makeDeskFloor, makeTextLabel, mulberry32 } from '../charts';
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

/** Yield curve board: thin stems, soft markers, orbital sweep. */
export function createMacroFieldScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.028);
  root.add(makeDeskFloor(24));

  const desk = new THREE.Group();
  root.add(desk);

  const frame = makeChartFrame(11.2, 6.2, 8, 5);
  desk.add(frame);

  const title = makeTextLabel('USD RATES  ·  YIELD CURVE', {
    color: '#b8893d',
    fontSize: 22,
    maxWidth: 4.0,
  });
  title.position.set(-5.0, 2.75, 0.07);
  desk.add(title);

  const tenors = [
    { label: '1M', yld: 5.32 },
    { label: '3M', yld: 5.28 },
    { label: '6M', yld: 5.15 },
    { label: '2Y', yld: 4.62 },
    { label: '5Y', yld: 4.21 },
    { label: '10Y', yld: 4.18 },
    { label: '20Y', yld: 4.45 },
    { label: '30Y', yld: 4.38 },
  ];

  const yMin = 3.8;
  const yMax = 5.5;
  const chartBottom = -2.3;
  const chartTop = 2.1;
  const xLeft = -4.7;
  const xRight = 4.7;
  const scaleY = (v: number) =>
    chartBottom + ((v - yMin) / (yMax - yMin)) * (chartTop - chartBottom);

  for (const tick of [4.0, 4.5, 5.0, 5.5]) {
    const y = scaleY(tick);
    const lbl = makeTextLabel(`${tick.toFixed(1)}%`, {
      color: '#5a6a82',
      fontSize: 12,
      align: 'right',
      maxWidth: 0.65,
      opacity: 0.65,
    });
    lbl.position.set(-5.2, y, 0.07);
    desk.add(lbl);
    desk.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(xLeft, y, 0.03),
          new THREE.Vector3(xRight, y, 0.03),
        ]),
        new THREE.LineBasicMaterial({ color: COLORS.grid, transparent: true, opacity: 0.28 })
      )
    );
  }

  const pts: THREE.Vector3[] = [];
  const fairPts: THREE.Vector3[] = [];
  const nodes: THREE.Mesh[] = [];
  const bars: THREE.Mesh[] = [];
  const rand = mulberry32(77);

  tenors.forEach((tenor, i) => {
    const x = xLeft + ((xRight - xLeft) * i) / (tenors.length - 1);
    const y = scaleY(tenor.yld);
    const fair = tenor.yld + (rand() - 0.5) * 0.12;
    pts.push(new THREE.Vector3(x, y, 0.09));
    fairPts.push(new THREE.Vector3(x, scaleY(fair), 0.07));

    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({
        color: COLORS.gold,
        emissive: COLORS.gold,
        emissiveIntensity: 0.15,
        metalness: 0.2,
        roughness: 0.55,
      })
    );
    node.position.set(x, y, 0.11);
    node.scale.setScalar(0.01);
    nodes.push(node);
    desk.add(node);

    const stemH = y - chartBottom;
    const geo = new THREE.BoxGeometry(0.06, 1, 0.03);
    geo.translate(0, 0.5, 0);
    const stem = new THREE.Mesh(geo, makeFlatMaterial(COLORS.blue, 0.28));
    stem.position.set(x, chartBottom, 0.05);
    stem.scale.y = 0.001;
    stem.userData.target = stemH;
    bars.push(stem);
    desk.add(stem);

    const tl = makeTextLabel(tenor.label, {
      color: '#6b7a94',
      fontSize: 14,
      align: 'center',
      maxWidth: 0.5,
      opacity: 0.75,
    });
    tl.position.set(x, chartBottom - 0.32, 0.07);
    desk.add(tl);

    const yl = makeTextLabel(tenor.yld.toFixed(2), {
      color: '#b8c2d6',
      fontSize: 12,
      align: 'center',
      maxWidth: 0.6,
      opacity: 0.7,
    });
    yl.position.set(x, y + 0.24, 0.11);
    yl.scale.setScalar(0.01);
    yl.userData.nodeLabel = true;
    desk.add(yl);
  });

  const marketCurve = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.022, 8, false),
    new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      emissive: COLORS.gold,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0,
      metalness: 0.15,
      roughness: 0.5,
    })
  );
  desk.add(marketCurve);

  const fairCurve = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(fairPts),
    new THREE.LineDashedMaterial({
      color: COLORS.teal,
      dashSize: 0.12,
      gapSize: 0.09,
      transparent: true,
      opacity: 0,
    })
  );
  fairCurve.computeLineDistances();
  desk.add(fairCurve);

  const legend = makeTextLabel('MARKET  ——     FAIR VALUE  - - -', {
    color: '#6b7a94',
    fontSize: 14,
    align: 'right',
    maxWidth: 3.6,
    opacity: 0.7,
  });
  legend.position.set(4.9, 2.75, 0.07);
  desk.add(legend);

  const callout = makeTextLabel('10Y  4.18%   ·   2s10s  -44bp', {
    color: '#c9a05a',
    fontSize: 18,
    align: 'center',
    maxWidth: 3.8,
  });
  callout.position.set(0, -2.85, 0.08);
  callout.scale.setScalar(0.01);
  desk.add(callout);

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      const rise = easeOutCubic(Math.min(1, t / 0.4));
      bars.forEach((b) => {
        b.scale.y = rise * (b.userData.target as number);
      });
      nodes.forEach((n, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - i * 0.04) / 0.25)));
        n.scale.setScalar(0.01 + local * 0.99);
      });
      desk.traverse((o) => {
        if (o.userData.nodeLabel) {
          const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.2) / 0.3)));
          o.scale.setScalar(0.01 + local * 0.99);
        }
      });

      const reveal = easeOutCubic(Math.min(1, Math.max(0, (t - 0.2) / 0.35)));
      (marketCurve.material as THREE.MeshStandardMaterial).opacity = reveal * 0.85;
      (fairCurve.material as THREE.LineDashedMaterial).opacity = reveal * 0.55;

      const lock = easeOutCubic(Math.min(1, Math.max(0, (t - 0.5) / 0.25)));
      callout.scale.setScalar(0.01 + lock * 0.99);

      if (t > 0.55) {
        const pulse = 1 + Math.sin(t * 10) * 0.08;
        nodes[5]!.scale.setScalar(pulse);
      }

      orbitDeskCamera(camera, desk, t, {
        radius: 12.3,
        height: 4.0,
        yawSpan: 1.2,
        rollSpan: 0.48,
        tiltX: -0.4,
        zoomIn: 3.2,
      });

      if (t > 0.8) {
        const fade = easeInOutCubic((t - 0.8) / 0.2);
        (marketCurve.material as THREE.MeshStandardMaterial).opacity = 0.85 * (1 - fade);
        (fairCurve.material as THREE.LineDashedMaterial).opacity = 0.55 * (1 - fade);
      }
    },
  });
}
