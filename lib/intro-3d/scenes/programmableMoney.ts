import * as THREE from 'three';
import { makeChartFrame, makeDeskFloor, makeTextLabel } from '../charts';
import {
  COLORS,
  applyTrailerGrade,
  createSceneKit,
  driveCutCamera,
  easeInOutCubic,
  easeOutCubic,
  makeDustField,
  makeFlatMaterial,
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

function makeRailNode(color: number, radius = 0.28) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.22,
      metalness: 0.4,
      roughness: 0.35,
    })
  );
  g.add(core);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.35, 0.035, 10, 36),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
  );
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  return g;
}

function makeTokenCoin() {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.08, 36),
    new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      emissive: COLORS.gold,
      emissiveIntensity: 0.45,
      metalness: 0.55,
      roughness: 0.28,
    })
  );
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.03, 8, 40),
    new THREE.MeshBasicMaterial({ color: COLORS.goldLight, transparent: true, opacity: 0.85 })
  );
  g.add(rim);
  return g;
}

/** Dual-rail trailer: legacy T+ settlement vs programmable atomic money. */
export function createProgrammableMoneyScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.017);
  root.add(makeDeskFloor(28));
  root.add(makeHorizonGlow(26, 12));

  const dust = makeDustField(240, 17, 0x8ab4ff);
  root.add(dust);

  const shaftL = makeLightShaft(11, COLORS.slate);
  shaftL.position.set(-3.2, 1.3, -2);
  shaftL.rotation.z = 0.1;
  root.add(shaftL);
  const shaftR = makeLightShaft(11, COLORS.gold);
  shaftR.position.set(3.2, 1.3, -2);
  shaftR.rotation.z = -0.1;
  root.add(shaftR);

  const spot = new THREE.PointLight(COLORS.gold, 0.7, 20);
  spot.position.set(2.5, 4.2, 3.2);
  scene.add(spot);

  const desk = new THREE.Group();
  root.add(desk);

  const frame = makeChartFrame(12.4, 6.4, 7, 4);
  desk.add(frame);

  const title = makeTextLabel('PROGRAMMABLE MONEY', {
    color: '#b8893d',
    fontSize: 24,
    maxWidth: 4.6,
  });
  title.position.set(-5.4, 2.7, 0.07);
  desk.add(title);

  const subtitle = makeTextLabel('LEGACY RAIL  vs  ON-CHAIN CLAIM', {
    color: '#6b7a94',
    fontSize: 13,
    align: 'right',
    maxWidth: 4.0,
    opacity: 0.78,
  });
  subtitle.position.set(5.5, 2.7, 0.07);
  desk.add(subtitle);

  // Legacy rail (top): T+1 / delayed hops
  const legacyY = 1.15;
  const progY = -0.85;
  const legacyStages = ['BANK', 'CLEAR', 'SETTLE T+1'];
  const progStages = ['MINT', 'TRANSFER', 'ATOMIC FINAL'];

  const legacyNodes: THREE.Group[] = [];
  const progNodes: THREE.Group[] = [];
  const legacyLinks: THREE.Mesh[] = [];
  const progLinks: THREE.Mesh[] = [];

  legacyStages.forEach((label, i) => {
    const x = -4.2 + i * 4.2;
    const node = makeRailNode(COLORS.slate, 0.26);
    node.position.set(x, legacyY, 0.12);
    node.scale.setScalar(0.01);
    legacyNodes.push(node);
    desk.add(node);

    const lbl = makeTextLabel(label, {
      color: '#8a96aa',
      fontSize: 14,
      align: 'center',
      maxWidth: 1.8,
      opacity: 0.8,
    });
    lbl.position.set(x, legacyY - 0.62, 0.1);
    desk.add(lbl);

    if (i < legacyStages.length - 1) {
      const link = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.04, 0.04),
        makeFlatMaterial(COLORS.slate, 0.35)
      );
      link.position.set(x + 2.1, legacyY, 0.08);
      link.scale.x = 0.001;
      legacyLinks.push(link);
      desk.add(link);
    }
  });

  progStages.forEach((label, i) => {
    const x = -4.2 + i * 4.2;
    const color = i === 2 ? COLORS.goldLight : COLORS.gold;
    const node = makeRailNode(color, i === 2 ? 0.32 : 0.26);
    node.position.set(x, progY, 0.12);
    node.scale.setScalar(0.01);
    progNodes.push(node);
    desk.add(node);

    const lbl = makeTextLabel(label, {
      color: i === 2 ? '#c9a05a' : '#9aa8bc',
      fontSize: i === 2 ? 15 : 14,
      align: 'center',
      maxWidth: 2.0,
      opacity: 0.88,
    });
    lbl.position.set(x, progY - 0.68, 0.1);
    desk.add(lbl);

    if (i < progStages.length - 1) {
      const link = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.05, 0.05),
        makeFlatMaterial(COLORS.gold, 0.55)
      );
      link.position.set(x + 2.1, progY, 0.08);
      link.scale.x = 0.001;
      progLinks.push(link);
      desk.add(link);
    }
  });

  const legacyHdr = makeTextLabel('FIAT / T+ RAIL', {
    color: '#6b7a94',
    fontSize: 12,
    maxWidth: 2.2,
    opacity: 0.7,
  });
  legacyHdr.position.set(-5.5, legacyY + 0.55, 0.08);
  desk.add(legacyHdr);

  const progHdr = makeTextLabel('PROGRAMMABLE RAIL', {
    color: '#c9a05a',
    fontSize: 12,
    maxWidth: 2.6,
    opacity: 0.85,
  });
  progHdr.position.set(-5.5, progY + 0.55, 0.08);
  desk.add(progHdr);

  // Slow packet on legacy rail
  const legacyPacket = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.18, 0.12),
    new THREE.MeshStandardMaterial({
      color: COLORS.blue,
      emissive: COLORS.blue,
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.5,
    })
  );
  legacyPacket.position.set(-4.2, legacyY, 0.35);
  legacyPacket.scale.setScalar(0.01);
  desk.add(legacyPacket);

  // Programmable token
  const token = makeTokenCoin();
  token.position.set(-4.2, progY, 0.4);
  token.scale.setScalar(0.01);
  desk.add(token);

  const amount = makeTextLabel('USD  1,000,000', {
    color: '#c9a05a',
    fontSize: 18,
    align: 'center',
    maxWidth: 2.8,
  });
  amount.position.set(0, progY + 0.72, 0.2);
  amount.scale.setScalar(0.01);
  desk.add(amount);

  const condition = makeTextLabel('IF  DELIVERY_CONFIRMED  →  SETTLE', {
    color: '#8a96aa',
    fontSize: 13,
    align: 'center',
    maxWidth: 4.2,
    opacity: 0.75,
  });
  condition.position.set(0, -2.35, 0.08);
  condition.scale.setScalar(0.01);
  desk.add(condition);

  const climax = makeTextLabel('ATOMIC  ·  FINAL', {
    color: '#c9a05a',
    fontSize: 26,
    align: 'center',
    maxWidth: 3.6,
  });
  climax.position.set(0, -2.85, 0.12);
  climax.scale.setScalar(0.01);
  desk.add(climax);

  const flash = makeFlashBurst(COLORS.goldLight);
  flash.position.set(4.2, progY, 0.45);
  desk.add(flash);

  const sparks = makeSparkBurst(56, COLORS.goldLight);
  desk.add(sparks);

  const ripples = makeRippleSet(COLORS.gold, 4);
  ripples.position.set(4.2, progY, 0.2);
  desk.add(ripples);

  const trailPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    trailPts.push(new THREE.Vector3(-4.2 + u * 8.4, progY, 0.22));
  }
  const trail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(trailPts),
    new THREE.LineBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0 })
  );
  desk.add(trail);

  const shots: CameraShot[] = [
    { at: 0, radius: 16.8, height: 6.0, yaw: -0.85, lookY: 0.1, fov: 40, dutch: 0.04 },
    { at: 0.14, radius: 13.5, height: 4.8, yaw: -0.4, lookY: 0.05, fov: 34 },
    { at: 0.48, radius: 9.0, height: 2.8, yaw: 0.15, lookX: 2.2, lookY: progY * 0.2, fov: 27, dutch: -0.03 },
    { at: 0.58, radius: 10.6, height: 3.4, yaw: 0.35, lookX: 3.4, lookY: progY * 0.15, fov: 29 },
    { at: 0.84, radius: 15.0, height: 5.3, yaw: 0.55, lookY: 0, fov: 36 },
  ];

  return runTimedScene({
    kit,
    overlay,
    onComplete,
    update(t) {
      const act = applyTrailerGrade(kit, t);
      syncIntroChrome(overlay, act);
      updateDustField(dust, kit.clock.elapsedTime, 0.1);
      (dust.material as THREE.PointsMaterial).opacity =
        act === 'black' || act === 'out' ? 0.05 : 0.15;

      setIntroTitleCard(
        overlay,
        'PROGRAMMABLE MONEY',
        act === 'title',
        'LEGACY SETTLEMENT  →  ATOMIC CLAIM'
      );

      const rise = easeOutCubic(Math.min(1, Math.max(0, (t - 0.14) / 0.26)));
      legacyNodes.forEach((n, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.14 - i * 0.035) / 0.18)));
        n.scale.setScalar(0.01 + local * 0.99);
      });
      progNodes.forEach((n, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.16 - i * 0.035) / 0.18)));
        n.scale.setScalar(0.01 + local * 0.99);
      });
      legacyLinks.forEach((l) => {
        l.scale.x = rise;
      });
      progLinks.forEach((l, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.2 - i * 0.045) / 0.2)));
        l.scale.x = local;
      });

      // Signature: dim legacy rail as programmable rail goes hot
      const dimLegacy = act === 'insert' || act === 'climax' ? 0.4 : 1;
      legacyNodes.forEach((n) => {
        n.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
          if (mat && 'emissiveIntensity' in mat) {
            mat.emissiveIntensity = 0.1 * dimLegacy;
          }
        });
      });
      if (legacyPacket.material instanceof THREE.MeshStandardMaterial) {
        legacyPacket.material.emissiveIntensity = 0.12 * dimLegacy;
      }

      const legacyProg = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.2) / 0.5)));
      const legacyX = -4.2 + Math.min(0.7, legacyProg) * 8.4;
      legacyPacket.position.set(legacyX, legacyY + Math.sin(t * 6) * 0.02, 0.35);
      legacyPacket.scale.setScalar(0.01 + rise * 0.99);
      legacyPacket.rotation.z = t * 0.9;

      const tokenProg = easeInOutCubic(Math.min(1, Math.max(0, (t - 0.22) / 0.34)));
      const tokenX = -4.2 + tokenProg * 8.4;
      token.position.set(tokenX, progY + Math.sin(t * 12) * 0.03, 0.4);
      token.scale.setScalar(0.01 + rise * 0.99);
      token.rotation.z = t * 4.2;
      token.rotation.y = t * 2.0;

      amount.scale.setScalar(0.01 + easeOutCubic(Math.min(1, Math.max(0, (t - 0.3) / 0.18))) * 0.99);
      amount.position.x = tokenX * 0.3;
      condition.scale.setScalar(0.01 + easeOutCubic(Math.min(1, Math.max(0, (t - 0.42) / 0.16))) * 0.99);

      (trail.material as THREE.LineBasicMaterial).opacity = tokenProg * 0.5;

      const lock = easeOutCubic(Math.min(1, Math.max(0, (t - 0.55) / 0.14)));
      climax.scale.setScalar(0.01 + lock * 0.99);

      if (act === 'insert' || (act === 'climax' && t < 0.7)) {
        const flashT = Math.min(1, Math.max(0, (t - 0.52) / 0.16));
        (flash.material as THREE.MeshBasicMaterial).opacity = Math.sin(flashT * Math.PI) * 0.75;
        flash.scale.setScalar(0.6 + flashT * 2.5);
      } else {
        (flash.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      if (act === 'insert' || act === 'climax') {
        updateRippleSet(ripples, Math.min(1, (t - 0.54) / 0.28), 4.8);
        const pulse = 1 + Math.sin(t * 11) * 0.1;
        progNodes[2]!.scale.setScalar(pulse);
        spot.intensity = 0.4 + lock * 0.95;
        if (act === 'climax') kit.setBloom(0.55 + lock * 0.5);
      }

      updateSparkBurst(sparks, new THREE.Vector3(4.2, progY, 0.45), 0.58, t, 0.24);

      if (act === 'black' || act === 'title' || act === 'out') setIntroBeat(overlay, '', false);
      else if (act === 'assemble') setIntroBeat(overlay, 'T+1  RAIL', true);
      else if (act === 'insert') setIntroBeat(overlay, 'ON-CHAIN  CLAIM', true);
      else setIntroBeat(overlay, 'ATOMIC  ·  FINAL', t < 0.86);

      (shaftL.material as THREE.MeshBasicMaterial).opacity = 0.025 + rise * 0.04 * dimLegacy;
      (shaftR.material as THREE.MeshBasicMaterial).opacity = 0.035 + lock * 0.09;
      driveCutCamera(camera, desk, t, shots);
    },
  });
}
