import * as THREE from 'three';
import { makeChartFrame, makeDeskFloor, makeTextLabel } from '../charts';
import {
  COLORS,
  createSceneKit,
  easeInOutCubic,
  easeOutCubic,
  makeBarMaterial,
  orbitDeskCamera,
  runTimedScene,
} from '../shared';
import type { IntroSceneController } from '../types';

/** Quiet block explorer pipeline with a sweeping orbital view. */
export function createSettlementScene(
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

  const frame = makeChartFrame(12.0, 5.4, 6, 3);
  desk.add(frame);

  const title = makeTextLabel('ETH  ·  SETTLEMENT PIPELINE', {
    color: '#b8893d',
    fontSize: 22,
    maxWidth: 4.2,
  });
  title.position.set(-5.4, 2.3, 0.07);
  desk.add(title);

  const stages = [
    { label: 'MEMPOOL', height: 19_284_101, color: COLORS.slate, txs: 4 },
    { label: 'PROPOSED', height: 19_284_102, color: COLORS.blue, txs: 6 },
    { label: 'INCLUDED', height: 19_284_103, color: COLORS.teal, txs: 8 },
    { label: 'ATTESTED', height: 19_284_104, color: COLORS.gold, txs: 8 },
    { label: 'FINALIZED', height: 19_284_105, color: COLORS.goldLight, txs: 8 },
  ];

  const blocks: THREE.Group[] = [];
  const pathPts: THREE.Vector3[] = [];

  stages.forEach((stage, i) => {
    const g = new THREE.Group();
    const x = -4.5 + i * 2.25;
    g.position.set(x, -0.1, 0.08);
    pathPts.push(new THREE.Vector3(x, 0.7, 0.35));

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 2.15, 0.22),
      makeBarMaterial(stage.color, 0.55)
    );
    body.position.y = 0.05;
    g.add(body);

    const hdr = makeTextLabel(stage.label, {
      color: '#c8d0e0',
      fontSize: 14,
      align: 'center',
      maxWidth: 1.3,
      opacity: 0.85,
    });
    hdr.position.set(0, 0.95, 0.16);
    g.add(hdr);

    const h = makeTextLabel(`#${stage.height}`, {
      color: '#6b7a94',
      fontSize: 12,
      align: 'center',
      maxWidth: 1.4,
      opacity: 0.7,
    });
    h.position.set(0, 0.7, 0.16);
    g.add(h);

    for (let t = 0; t < stage.txs; t++) {
      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.09, 0.04),
        new THREE.MeshBasicMaterial({
          color: t === 2 && i >= 2 ? COLORS.gold : 0x1a2436,
          transparent: true,
          opacity: t === 2 && i >= 2 ? 0.75 : 0.55,
        })
      );
      slot.position.set(0, 0.3 - t * 0.16, 0.14);
      g.add(slot);
    }

    if (i < stages.length - 1) {
      const arrow = makeTextLabel('→', {
        color: '#8a7348',
        fontSize: 22,
        align: 'center',
        maxWidth: 0.35,
        opacity: 0.7,
      });
      arrow.position.set(1.0, 0.15, 0.2);
      g.add(arrow);
    }

    g.scale.setScalar(0.01);
    blocks.push(g);
    desk.add(g);
  });

  const tx = new THREE.Group();
  const capsule = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.08, 0.4, 4, 8),
    new THREE.MeshStandardMaterial({
      color: COLORS.goldLight,
      emissive: COLORS.gold,
      emissiveIntensity: 0.25,
      metalness: 0.3,
      roughness: 0.45,
      transparent: true,
      opacity: 0.9,
    })
  );
  capsule.rotation.z = Math.PI / 2;
  tx.add(capsule);
  const txLabel = makeTextLabel('0xA3…F91  ·  1.2 ETH', {
    color: '#c9a05a',
    fontSize: 14,
    align: 'center',
    maxWidth: 2.0,
    opacity: 0.85,
  });
  txLabel.position.set(0, 0.38, 0);
  tx.add(txLabel);
  desk.add(tx);

  const status = makeTextLabel('STATUS  PENDING', {
    color: '#6b7a94',
    fontSize: 16,
    align: 'center',
    maxWidth: 2.8,
    opacity: 0.7,
  });
  status.position.set(0, -2.25, 0.08);
  desk.add(status);

  const finalBanner = makeTextLabel('FINALITY  CONFIRMED', {
    color: '#5fad92',
    fontSize: 22,
    align: 'center',
    maxWidth: 3.4,
  });
  finalBanner.position.set(0, 2.25, 0.12);
  finalBanner.scale.setScalar(0.01);
  desk.add(finalBanner);

  const statusMat = status.material as THREE.MeshBasicMaterial;

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      blocks.forEach((b, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - i * 0.06) / 0.25)));
        b.scale.setScalar(0.01 + local * 0.99);
      });

      const travel = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.15) / 0.55)));
      const idx = travel * (pathPts.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(pathPts.length - 1, i0 + 1);
      const frac = idx - i0;
      tx.position.lerpVectors(pathPts[i0]!, pathPts[i1]!, frac);
      tx.position.y += Math.sin(t * 8) * 0.02;

      const stageIdx = Math.min(stages.length - 1, Math.floor(travel * stages.length));
      statusMat.opacity = stageIdx <= 1 ? 0.75 : 0.45;

      orbitDeskCamera(camera, desk, t, {
        radius: 12.0,
        height: 3.8,
        yawSpan: 1.25,
        rollSpan: 0.46,
        tiltX: -0.36,
        zoomIn: 3.0,
        lookY: 0.1,
      });

      if (t > 0.7) {
        const settle = easeOutCubic(Math.min(1, (t - 0.7) / 0.25));
        finalBanner.scale.setScalar(0.01 + settle * 0.99);
        tx.visible = t < 0.92;
      }
    },
  });
}
