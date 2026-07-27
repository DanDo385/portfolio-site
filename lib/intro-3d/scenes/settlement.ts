import * as THREE from 'three';
import { makeChartFrame, makeDeskFloor, makeTextLabel } from '../charts';
import {
  COLORS,
  createSceneKit,
  driveTrailerCamera,
  easeInOutCubic,
  easeOutCubic,
  makeChainBlock,
  runTimedScene,
  setIntroBeat,
} from '../shared';
import type { IntroSceneController } from '../types';

/** Theatrical settlement trailer: hex blocks, tx path, finality beat. */
export function createSettlementScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.028);
  root.add(makeDeskFloor(24));

  const spot = new THREE.PointLight(COLORS.gold, 0.4, 16);
  spot.position.set(0, 3.8, 2.8);
  scene.add(spot);

  const desk = new THREE.Group();
  root.add(desk);

  const frame = makeChartFrame(12.2, 5.6, 6, 3);
  desk.add(frame);

  const title = makeTextLabel('ETH  ·  SETTLEMENT PIPELINE', {
    color: '#b8893d',
    fontSize: 22,
    maxWidth: 4.4,
  });
  title.position.set(-5.5, 2.35, 0.07);
  desk.add(title);

  const network = makeTextLabel('MAINNET  ·  SLOT  9,284,105', {
    color: '#6b7a94',
    fontSize: 14,
    align: 'right',
    maxWidth: 3.2,
    opacity: 0.75,
  });
  network.position.set(5.4, 2.35, 0.07);
  desk.add(network);

  const stages = [
    { label: 'MEMPOOL', height: 'pending', color: COLORS.slate, size: 0.52 },
    { label: 'PROPOSED', height: '#19284102', color: COLORS.blue, size: 0.55 },
    { label: 'INCLUDED', height: '#19284103', color: COLORS.teal, size: 0.58 },
    { label: 'ATTESTED', height: '#19284104', color: COLORS.gold, size: 0.6 },
    { label: 'FINALIZED', height: '#19284105', color: COLORS.goldLight, size: 0.62 },
  ];

  const blocks: THREE.Group[] = [];
  const pathPts: THREE.Vector3[] = [];
  const stageMats: THREE.MeshStandardMaterial[] = [];

  stages.forEach((stage, i) => {
    const g = new THREE.Group();
    const x = -4.6 + i * 2.3;
    g.position.set(x, -0.35, 0.1);
    pathPts.push(new THREE.Vector3(x, 0.85, 0.55));

    const hex = makeChainBlock(stage.color, stage.size);
    hex.rotation.x = Math.PI / 2;
    hex.position.y = 0.15;
    const body = hex.children[0] as THREE.Mesh;
    if (body?.material instanceof THREE.MeshStandardMaterial) {
      stageMats.push(body.material);
    }
    g.add(hex);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.78, 0.08, 6),
      new THREE.MeshStandardMaterial({
        color: COLORS.ink,
        metalness: 0.2,
        roughness: 0.7,
        transparent: true,
        opacity: 0.85,
      })
    );
    platform.position.y = -0.35;
    platform.rotation.y = Math.PI / 6;
    g.add(platform);

    const hdr = makeTextLabel(stage.label, {
      color: '#c8d0e0',
      fontSize: 13,
      align: 'center',
      maxWidth: 1.35,
      opacity: 0.9,
    });
    hdr.position.set(0, -0.72, 0.2);
    g.add(hdr);

    const h = makeTextLabel(stage.height, {
      color: '#6b7a94',
      fontSize: 11,
      align: 'center',
      maxWidth: 1.4,
      opacity: 0.7,
    });
    h.position.set(0, -0.95, 0.2);
    g.add(h);

    if (i < stages.length - 1) {
      const link = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.03, 0.03),
        new THREE.MeshBasicMaterial({
          color: COLORS.gold,
          transparent: true,
          opacity: 0.35,
        })
      );
      link.position.set(1.05, 0.15, 0.05);
      g.add(link);
    }

    g.scale.setScalar(0.01);
    blocks.push(g);
    desk.add(g);
  });

  const tx = new THREE.Group();
  const capsule = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.42, 4, 8),
    new THREE.MeshStandardMaterial({
      color: COLORS.goldLight,
      emissive: COLORS.gold,
      emissiveIntensity: 0.35,
      metalness: 0.35,
      roughness: 0.4,
      transparent: true,
      opacity: 0.95,
    })
  );
  capsule.rotation.z = Math.PI / 2;
  tx.add(capsule);

  const txGlow = new THREE.PointLight(COLORS.gold, 0.8, 3.5);
  tx.add(txGlow);

  const txLabel = makeTextLabel('0xA3…F91  ·  1.2 ETH', {
    color: '#c9a05a',
    fontSize: 14,
    align: 'center',
    maxWidth: 2.1,
    opacity: 0.9,
  });
  txLabel.position.set(0, 0.42, 0);
  tx.add(txLabel);
  desk.add(tx);

  const statusPending = makeTextLabel('STATUS  PENDING', {
    color: '#6b7a94',
    fontSize: 16,
    align: 'center',
    maxWidth: 2.8,
    opacity: 0,
  });
  statusPending.position.set(0, -2.35, 0.08);
  desk.add(statusPending);

  const statusIncluded = makeTextLabel('STATUS  INCLUDED', {
    color: '#4a9e9e',
    fontSize: 16,
    align: 'center',
    maxWidth: 2.8,
    opacity: 0,
  });
  statusIncluded.position.set(0, -2.35, 0.08);
  desk.add(statusIncluded);

  const finalBanner = makeTextLabel('FINALITY  CONFIRMED', {
    color: '#5fad92',
    fontSize: 24,
    align: 'center',
    maxWidth: 3.6,
  });
  finalBanner.position.set(0, 2.3, 0.14);
  finalBanner.scale.setScalar(0.01);
  desk.add(finalBanner);

  const pendingMat = statusPending.material as THREE.MeshBasicMaterial;
  const includedMat = statusIncluded.material as THREE.MeshBasicMaterial;

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      blocks.forEach((b, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - i * 0.05) / 0.22)));
        b.scale.setScalar(0.01 + local * 0.99);
        b.rotation.y = (1 - local) * 0.4;
      });

      const travel = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.12) / 0.52)));
      const idx = travel * (pathPts.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(pathPts.length - 1, i0 + 1);
      const frac = idx - i0;
      tx.position.lerpVectors(pathPts[i0]!, pathPts[i1]!, frac);
      tx.position.y += Math.sin(t * 10) * 0.025;

      const stageIdx = Math.min(stages.length - 1, Math.floor(travel * stages.length + 0.01));
      stageMats.forEach((mat, i) => {
        mat.emissiveIntensity = i <= stageIdx ? 0.22 + (i === stageIdx ? 0.2 : 0) : 0.06;
        mat.opacity = i <= stageIdx ? 0.95 : 0.55;
      });

      if (stageIdx <= 1) {
        pendingMat.opacity = 0.85;
        includedMat.opacity = 0;
        setIntroBeat(overlay, 'STATUS  PENDING', t > 0.08);
      } else if (stageIdx < 4) {
        pendingMat.opacity = 0;
        includedMat.opacity = 0.9;
        setIntroBeat(overlay, 'STATUS  INCLUDED', true);
      } else {
        pendingMat.opacity = 0;
        includedMat.opacity = 0;
        setIntroBeat(overlay, 'FINALITY  CONFIRMED', t < 0.9);
      }

      if (t > 0.68) {
        const settle = easeOutCubic(Math.min(1, (t - 0.68) / 0.22));
        finalBanner.scale.setScalar(0.01 + settle * 0.99);
        spot.intensity = 0.35 + settle * 0.7;
        spot.position.set(pathPts[4]!.x, 3.2, 2.5);
      }

      tx.visible = t < 0.9;
      driveTrailerCamera(camera, desk, t, 'pipelineTrack', {
        lookY: 0.1,
        trackX: tx.position.x,
      });
    },
  });
}
