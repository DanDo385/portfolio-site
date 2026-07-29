import * as THREE from 'three';
import { makeChartFrame, makeDeskFloor, makeTextLabel } from '../charts';
import {
  COLORS,
  applyTrailerGrade,
  createSceneKit,
  driveCutCamera,
  easeInOutCubic,
  easeOutCubic,
  makeChainBlock,
  makeDustField,
  makeFlashBurst,
  makeHorizonGlow,
  makeLightShaft,
  makeRippleSet,
  makeSparkBurst,
  runTimedScene,
  setIntroBeat,
  setIntroTitleCard,
  syncIntroChrome,
  updateDustField,
  updateRippleSet,
  updateSparkBurst,
  type CameraShot,
} from '../shared';
import type { IntroSceneController } from '../types';

/** Cinematic settlement pipeline trailer. */
export function createSettlementScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.018);
  root.add(makeDeskFloor(28));
  root.add(makeHorizonGlow(26, 11));

  const dust = makeDustField(300, 17, 0x8ab4ff);
  root.add(dust);

  const shaft = makeLightShaft(12, COLORS.gold);
  shaft.position.set(0, 1.5, -2);
  root.add(shaft);

  const spot = new THREE.PointLight(COLORS.gold, 0.7, 20);
  spot.position.set(0, 4.2, 3.4);
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
    opacity: 0.78,
  });
  network.position.set(5.4, 2.35, 0.07);
  desk.add(network);

  const stages = [
    { label: 'MEMPOOL', height: 'pending', color: COLORS.slate, size: 0.52 },
    { label: 'PROPOSED', height: '#19284102', color: COLORS.blue, size: 0.55 },
    { label: 'INCLUDED', height: '#19284103', color: COLORS.teal, size: 0.58 },
    { label: 'ATTESTED', height: '#19284104', color: COLORS.gold, size: 0.6 },
    { label: 'FINALIZED', height: '#19284105', color: COLORS.goldLight, size: 0.64 },
  ];

  const blocks: THREE.Group[] = [];
  const pathPts: THREE.Vector3[] = [];
  const stageMats: THREE.MeshStandardMaterial[] = [];
  const linkMats: THREE.MeshBasicMaterial[] = [];

  stages.forEach((stage, i) => {
    const g = new THREE.Group();
    const x = -4.6 + i * 2.3;
    g.position.set(x, -0.35, 0.1);
    pathPts.push(new THREE.Vector3(x, 0.9, 0.6));

    const hex = makeChainBlock(stage.color, stage.size);
    hex.rotation.x = Math.PI / 2;
    hex.position.y = 0.18;
    const body = hex.children[0] as THREE.Mesh;
    if (body?.material instanceof THREE.MeshStandardMaterial) stageMats.push(body.material);
    g.add(hex);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.84, 0.1, 6),
      new THREE.MeshStandardMaterial({
        color: COLORS.ink,
        metalness: 0.3,
        roughness: 0.55,
        transparent: true,
        opacity: 0.92,
        emissive: stage.color,
        emissiveIntensity: 0.08,
      })
    );
    platform.position.y = -0.38;
    platform.rotation.y = Math.PI / 6;
    g.add(platform);

    const hdr = makeTextLabel(stage.label, {
      color: '#c8d0e0',
      fontSize: 13,
      align: 'center',
      maxWidth: 1.35,
      opacity: 0.92,
    });
    hdr.position.set(0, -0.78, 0.22);
    g.add(hdr);

    const h = makeTextLabel(stage.height, {
      color: '#6b7a94',
      fontSize: 11,
      align: 'center',
      maxWidth: 1.4,
      opacity: 0.72,
    });
    h.position.set(0, -1.02, 0.22);
    g.add(h);

    if (i < stages.length - 1) {
      const link = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.05, 0.05),
        new THREE.MeshBasicMaterial({
          color: COLORS.gold,
          transparent: true,
          opacity: 0.25,
        })
      );
      link.position.set(1.1, 0.18, 0.08);
      linkMats.push(link.material as THREE.MeshBasicMaterial);
      g.add(link);

      // Energy pulse along link
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 10, 10),
        new THREE.MeshBasicMaterial({
          color: COLORS.goldLight,
          transparent: true,
          opacity: 0,
        })
      );
      pulse.position.set(0.55, 0.18, 0.12);
      pulse.userData.linkIndex = i;
      g.add(pulse);
      g.userData.pulse = pulse;
    }

    g.scale.setScalar(0.01);
    blocks.push(g);
    desk.add(g);
  });

  const trailHistory: THREE.Vector3[] = [];
  const trail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(Array.from({ length: 24 }, () => new THREE.Vector3())),
    new THREE.LineBasicMaterial({ color: COLORS.goldLight, transparent: true, opacity: 0 })
  );
  desk.add(trail);

  const tx = new THREE.Group();
  const capsule = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.11, 0.52, 6, 12),
    new THREE.MeshStandardMaterial({
      color: COLORS.goldLight,
      emissive: COLORS.gold,
      emissiveIntensity: 0.7,
      metalness: 0.45,
      roughness: 0.28,
      transparent: true,
      opacity: 0.98,
    })
  );
  capsule.rotation.z = Math.PI / 2;
  tx.add(capsule);
  const txGlow = new THREE.PointLight(COLORS.gold, 1.8, 5);
  tx.add(txGlow);
  const txLabel = makeTextLabel('0xA3…F91  ·  1.2 ETH', {
    color: '#c9a05a',
    fontSize: 14,
    align: 'center',
    maxWidth: 2.1,
    opacity: 0.92,
  });
  txLabel.position.set(0, 0.45, 0);
  tx.add(txLabel);
  desk.add(tx);

  const includeFlash = makeFlashBurst(COLORS.teal);
  includeFlash.position.set(pathPts[2]!.x, 0.95, 0.65);
  desk.add(includeFlash);

  const sparks = makeSparkBurst(64, COLORS.goldLight);
  desk.add(sparks);

  const ripples = makeRippleSet(COLORS.goldLight, 4);
  ripples.position.copy(pathPts[4]!);
  ripples.rotation.x = -Math.PI / 2.3;
  desk.add(ripples);

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
    fontSize: 26,
    align: 'center',
    maxWidth: 3.8,
  });
  finalBanner.position.set(0, 2.3, 0.14);
  finalBanner.scale.setScalar(0.01);
  desk.add(finalBanner);

  const pendingMat = statusPending.material as THREE.MeshBasicMaterial;
  const includedMat = statusIncluded.material as THREE.MeshBasicMaterial;

  const shots: CameraShot[] = [
    { at: 0, radius: 16.5, height: 5.6, yaw: -0.7, lookY: 0.15, fov: 40, dutch: 0.03 },
    { at: 0.14, radius: 13.4, height: 4.3, yaw: -0.45, lookX: -2.2, lookY: 0.2, fov: 33 },
    { at: 0.48, radius: 9.4, height: 3.1, yaw: 0.05, lookX: 1.5, lookY: 0.35, fov: 28, dutch: -0.02 },
    { at: 0.58, radius: 10.8, height: 3.5, yaw: 0.35, lookX: 3.6, lookY: 0.4, fov: 29 },
    { at: 0.84, radius: 14.6, height: 5.0, yaw: 0.55, lookY: 0.1, fov: 35 },
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
        act === 'black' || act === 'out' ? 0.06 : 0.18;

      setIntroTitleCard(overlay, 'SETTLEMENT', act === 'title', 'MEMPOOL → FINALITY');

      blocks.forEach((b, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.12 - i * 0.035) / 0.16)));
        b.scale.setScalar(0.01 + local * 0.99);
        b.rotation.y = (1 - local) * 0.55;
        const hex = b.children[0];
        if (hex) hex.rotation.z = kit.clock.elapsedTime * (0.35 + i * 0.08) * local;

        const pulse = b.userData.pulse as THREE.Mesh | undefined;
        if (pulse) {
          const linkProgress = Math.min(1, Math.max(0, (t - 0.18 - i * 0.07) / 0.3));
          pulse.position.x = 0.2 + linkProgress * 1.7;
          (pulse.material as THREE.MeshBasicMaterial).opacity =
            linkProgress > 0 && linkProgress < 1 ? 0.8 : 0;
        }
      });

      const travel = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.16) / 0.42)));
      const idx = travel * (pathPts.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(pathPts.length - 1, i0 + 1);
      const frac = idx - i0;
      tx.position.lerpVectors(pathPts[i0]!, pathPts[i1]!, frac);
      tx.position.y += Math.sin(t * 12) * 0.025;

      // Steadicam follow: bias insert/climax look toward tx
      if (act === 'assemble' || act === 'insert') {
        shots[1]!.lookX = tx.position.x * 0.55;
        shots[2]!.lookX = tx.position.x * 0.7;
      }

      trailHistory.unshift(tx.position.clone());
      if (trailHistory.length > 24) trailHistory.pop();
      const arr = Array.from({ length: 24 }, (_, i) => trailHistory[i] ?? tx.position.clone());
      (trail.geometry as THREE.BufferGeometry).setFromPoints(arr);
      (trail.material as THREE.LineBasicMaterial).opacity = travel > 0.04 && t < 0.86 ? 0.55 : 0;

      const stageIdx = Math.min(stages.length - 1, Math.floor(travel * stages.length + 0.01));
      stageMats.forEach((mat, i) => {
        const active = i <= stageIdx;
        mat.emissiveIntensity = active ? 0.28 + (i === stageIdx ? 0.4 : 0) : 0.05;
        mat.opacity = active ? 0.98 : 0.45;
      });
      linkMats.forEach((mat, i) => {
        mat.opacity = i < stageIdx ? 0.7 : 0.2;
      });

      if (stageIdx >= 2 && stageIdx < 4 && act !== 'climax') {
        const pulse = 0.45 + Math.sin(kit.clock.elapsedTime * 8) * 0.25;
        (includeFlash.material as THREE.MeshBasicMaterial).opacity = pulse * 0.4;
        includeFlash.scale.setScalar(1.05 + pulse);
      } else {
        (includeFlash.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      if (act === 'black' || act === 'title' || act === 'out') {
        setIntroBeat(overlay, '', false);
        pendingMat.opacity = 0;
        includedMat.opacity = 0;
      } else if (stageIdx <= 1) {
        pendingMat.opacity = 0.88;
        includedMat.opacity = 0;
        setIntroBeat(overlay, 'STATUS  PENDING', true);
      } else if (stageIdx < 4) {
        pendingMat.opacity = 0;
        includedMat.opacity = 0.92;
        setIntroBeat(overlay, 'STATUS  INCLUDED', true);
      } else {
        pendingMat.opacity = 0;
        includedMat.opacity = 0;
        setIntroBeat(overlay, 'FINALITY  CONFIRMED', t < 0.86);
      }

      if (act === 'climax' || (act === 'insert' && stageIdx >= 4)) {
        const settle = easeOutCubic(Math.min(1, Math.max(0, (t - 0.55) / 0.14)));
        finalBanner.scale.setScalar(0.01 + settle * 0.99);
        spot.intensity = 0.4 + settle * 1.1;
        spot.position.set(pathPts[4]!.x, 3.4, 2.6);
        updateRippleSet(ripples, Math.min(1, (t - 0.58) / 0.28), 5.0);
        if (act === 'climax') kit.setBloom(0.6 + settle * 0.45);
      }

      updateSparkBurst(sparks, pathPts[4]!.clone(), 0.62, t, 0.24);

      (shaft.material as THREE.MeshBasicMaterial).opacity = 0.025 + travel * 0.07;
      tx.visible = t < 0.88;
      txGlow.intensity = 1.0 + Math.sin(kit.clock.elapsedTime * 6) * 0.35;
      driveCutCamera(camera, desk, t, shots);
    },
  });
}
