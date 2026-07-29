import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { INTRO_DURATION_MS, INTRO_SKIP_FADE_MS, type IntroSceneController } from './types';

export const COLORS = {
  bg: 0x070b12,
  gold: 0xb8893d,
  goldLight: 0xc9a05a,
  slate: 0x6b7a94,
  blue: 0x6a8fb8,
  teal: 0x4a9e9e,
  rose: 0xc47a86,
  bid: 0x3d9b7a,
  ask: 0xc45c6a,
  grid: 0x1c2436,
  white: 0xd4dae6,
  panel: 0x0b1018,
  ink: 0x151c2a,
};

export function easeInOutCubic(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

export function easeOutCubic(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

export type SceneKit = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  root: THREE.Group;
  clock: THREE.Clock;
  bloom: UnrealBloomPass;
  setBloom: (strength: number) => void;
  setFilmGrade: (grain: number, chroma?: number) => void;
  render: () => void;
  resize: () => void;
  disposeBase: () => void;
};

export function createSceneKit(canvas: HTMLCanvasElement): SceneKit {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(COLORS.bg, 1);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.024);
  scene.background = new THREE.Color(COLORS.bg);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 160);
  const root = new THREE.Group();
  scene.add(root);

  const ambient = new THREE.AmbientLight(0x5a6a80, 0.42);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xf0f4fa, 1.15);
  key.position.set(4.5, 9, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x4a88b8, 0.4);
  fill.position.set(-7, 2, -4);
  scene.add(fill);
  const rim = new THREE.PointLight(COLORS.gold, 0.95, 36);
  rim.position.set(0, 6, 4.5);
  scene.add(rim);
  const under = new THREE.PointLight(0x1a3a5a, 0.4, 26);
  under.position.set(0, -2.8, 2.2);
  scene.add(under);

  const clock = new THREE.Clock();

  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.42, 0.5, 0.78);
  composer.addPass(bloom);
  const film = new FilmPass(0.08, false);
  composer.addPass(film);
  const chroma = new ShaderPass(RGBShiftShader);
  chroma.uniforms.amount.value = 0;
  chroma.uniforms.angle.value = 0.35;
  composer.addPass(chroma);
  composer.addPass(new OutputPass());

  const setBloom = (strength: number) => {
    bloom.strength = Math.max(0, Math.min(1.85, strength));
  };

  const setFilmGrade = (grain: number, chromaAmount = 0) => {
    const filmUniforms = film.uniforms as {
      intensity: { value: number };
      grayscale: { value: boolean };
      time: { value: number };
    };
    filmUniforms.intensity.value = Math.max(0, Math.min(0.55, grain));
    chroma.uniforms['amount']!.value = Math.max(0, Math.min(0.006, chromaAmount));
  };

  const resize = () => {
    const rw = canvas.clientWidth || window.innerWidth;
    const rh = canvas.clientHeight || window.innerHeight;
    renderer.setSize(rw, rh, false);
    camera.aspect = rw / Math.max(rh, 1);
    camera.updateProjectionMatrix();
    composer.setSize(rw, rh);
    bloom.resolution.set(rw, rh);
  };

  const disposeBase = () => {
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    composer.dispose();
    renderer.dispose();
  };

  return {
    renderer,
    scene,
    camera,
    root,
    clock,
    bloom,
    setBloom,
    setFilmGrade,
    render: () => composer.render(),
    resize,
    disposeBase,
  };
}

/** Editorial acts for every trailer. */
export type IntroAct = 'black' | 'title' | 'assemble' | 'insert' | 'climax' | 'out';

export function getIntroAct(t: number): IntroAct {
  if (t < 0.05) return 'black';
  if (t < 0.14) return 'title';
  if (t < 0.48) return 'assemble';
  if (t < 0.58) return 'insert';
  if (t < 0.84) return 'climax';
  return 'out';
}

/** Shared grade: quiet middle, film punch on insert/climax. */
export function applyTrailerGrade(kit: SceneKit, t: number) {
  const act = getIntroAct(t);
  if (act === 'black' || act === 'out') {
    kit.setBloom(0.15);
    kit.setFilmGrade(0.04, 0);
    kit.renderer.toneMappingExposure = 0.75;
    return act;
  }
  if (act === 'title') {
    kit.setBloom(0.32);
    kit.setFilmGrade(0.1, 0.0006);
    kit.renderer.toneMappingExposure = 0.95;
    return act;
  }
  if (act === 'assemble') {
    kit.setBloom(0.38);
    kit.setFilmGrade(0.09, 0.0004);
    kit.renderer.toneMappingExposure = 1.05;
    return act;
  }
  const punch = act === 'insert' ? easeOutCubic((t - 0.48) / 0.1) : easeOutCubic(Math.min(1, (t - 0.58) / 0.12));
  kit.setBloom(0.48 + punch * 0.55);
  kit.setFilmGrade(0.12 + punch * 0.28, 0.0008 + punch * 0.0024);
  kit.renderer.toneMappingExposure = 1.08 + punch * 0.18;
  return act;
}

export function syncIntroChrome(overlay: HTMLElement | null, act: IntroAct) {
  if (!overlay) return;
  if (overlay.dataset.introAct !== act) overlay.dataset.introAct = act;
}

export function setIntroBlackout(overlay: HTMLElement | null, amount: number) {
  const el = overlay?.querySelector('[data-intro-blackout]');
  if (!(el instanceof HTMLElement)) return;
  el.style.opacity = String(Math.max(0, Math.min(1, amount)));
}

/**
 * Multi-act camera progress: cold open → assemble → poster hold → exit push.
 */
export function trailerCamProgress(t: number): number {
  if (t < 0.14) return easeInOutCubic(t / 0.14) * 0.1;
  if (t < 0.48) return 0.1 + easeInOutCubic((t - 0.14) / 0.34) * 0.38;
  if (t < 0.84) return 0.48;
  return 0.48 + easeInOutCubic((t - 0.84) / 0.16) * 0.52;
}

export type TrailerCameraMode = 'frontalPush' | 'pipelineTrack' | 'curveArc' | 'dualRail';

/** Hard-cut shot list. Each shot snaps in with a short settle. */
export type CameraShot = {
  at: number;
  radius: number;
  height: number;
  yaw: number;
  lookX?: number;
  lookY?: number;
  lookZ?: number;
  fov?: number;
  dutch?: number;
};

export function driveCutCamera(
  camera: THREE.PerspectiveCamera,
  desk: THREE.Object3D,
  t: number,
  shots: CameraShot[]
) {
  if (!shots.length) return;
  let idx = 0;
  for (let i = 0; i < shots.length; i++) {
    if (t >= shots[i]!.at) idx = i;
  }
  const shot = shots[idx]!;
  const nextAt = shots[idx + 1]?.at ?? 1;
  const local = Math.min(1, Math.max(0, (t - shot.at) / Math.max(0.001, nextAt - shot.at)));
  const settle = easeOutCubic(Math.min(1, local / 0.18));

  const prev = shots[Math.max(0, idx - 1)]!;
  const radius = prev.radius + (shot.radius - prev.radius) * (idx === 0 ? 1 : settle);
  const height = prev.height + (shot.height - prev.height) * (idx === 0 ? 1 : settle);
  const yaw = prev.yaw + (shot.yaw - prev.yaw) * (idx === 0 ? 1 : settle);
  const lookX =
    (prev.lookX ?? 0) + ((shot.lookX ?? 0) - (prev.lookX ?? 0)) * (idx === 0 ? 1 : settle);
  const lookY =
    (prev.lookY ?? 0.1) + ((shot.lookY ?? 0.1) - (prev.lookY ?? 0.1)) * (idx === 0 ? 1 : settle);
  const lookZ =
    (prev.lookZ ?? 0) + ((shot.lookZ ?? 0) - (prev.lookZ ?? 0)) * (idx === 0 ? 1 : settle);
  const fov = (prev.fov ?? 34) + ((shot.fov ?? 34) - (prev.fov ?? 34)) * (idx === 0 ? 1 : settle);
  const dutch =
    (prev.dutch ?? 0) + ((shot.dutch ?? 0) - (prev.dutch ?? 0)) * (idx === 0 ? 1 : settle);

  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.position.set(Math.sin(yaw) * radius, height, Math.cos(yaw) * radius);
  camera.lookAt(lookX, lookY, lookZ);
  camera.rotation.z = dutch;
  desk.rotation.set(-0.28 + settle * 0.06, yaw * 0.08, dutch * 0.35);
}

/**
 * Legacy continuous cameras (fallback). Prefer driveCutCamera.
 */
export function driveTrailerCamera(
  camera: THREE.PerspectiveCamera,
  desk: THREE.Object3D,
  t: number,
  mode: TrailerCameraMode,
  opts: {
    lookY?: number;
    trackX?: number;
  } = {}
) {
  const e = trailerCamProgress(t);
  const lookY = opts.lookY ?? 0.12;
  const cold = Math.max(0, 1 - t / 0.14);
  const fovBase = 34 + cold * 8;
  const fovPunch = t > 0.55 && t < 0.78 ? 1.05 : 1;
  camera.fov = fovBase / fovPunch;
  camera.updateProjectionMatrix();

  if (mode === 'pipelineTrack') {
    const trackX = opts.trackX ?? 0;
    const radius = 14.5 - e * 4.4 - cold * 2.5;
    const height = 4.6 - e * 1.1 + cold * 1.2;
    const yaw = -0.55 + e * 0.95 + cold * 0.25;
    camera.position.set(Math.sin(yaw) * radius + trackX * 0.45, height, Math.cos(yaw) * radius);
    camera.lookAt(trackX * 0.55, lookY + 0.08, 0);
    desk.rotation.set(-0.32 + e * 0.1, yaw * 0.12, Math.sin(e * Math.PI) * 0.1);
    return;
  }

  if (mode === 'curveArc') {
    const radius = 15.0 - e * 4.8 - cold * 2.2;
    const height = 4.9 - e * 1.2 + cold * 1.4;
    const yaw = -0.95 + e * 1.55 + cold * 0.3;
    camera.position.set(Math.sin(yaw) * radius, height, Math.cos(yaw) * radius);
    camera.lookAt(0, lookY, 0);
    desk.rotation.set(-0.38 + e * 0.12, yaw * 0.14, Math.sin(e * Math.PI) * 0.12);
    return;
  }

  if (mode === 'dualRail') {
    const radius = 14.8 - e * 4.6 - cold * 2.4;
    const height = 5.0 - e * 1.35 + cold * 1.3;
    const yaw = -0.72 + e * 1.25 + cold * 0.28;
    camera.position.set(Math.sin(yaw) * radius, height, Math.cos(yaw) * radius);
    camera.lookAt(0, lookY + 0.05, 0);
    desk.rotation.set(-0.4 + e * 0.14, yaw * 0.1, Math.sin(e * Math.PI) * 0.1);
    return;
  }

  const radius = 14.2 - e * 4.8 - cold * 2.8;
  const height = 4.7 - e * 1.15 + cold * 1.5;
  const yaw = -0.48 + e * 0.78 + cold * 0.35;
  camera.position.set(Math.sin(yaw) * radius, height, Math.cos(yaw) * radius);
  camera.lookAt(0, lookY + cold * 0.2, 0);
  desk.rotation.set(-0.36 + e * 0.1, yaw * 0.14, Math.sin(e * Math.PI) * 0.12);
}

/** @deprecated Prefer driveTrailerCamera. */
export function orbitDeskCamera(
  camera: THREE.PerspectiveCamera,
  desk: THREE.Object3D,
  t: number,
  _opts: Record<string, unknown> = {}
) {
  void _opts;
  driveTrailerCamera(camera, desk, t, 'frontalPush');
}

export function setIntroBeat(overlay: HTMLElement | null, text: string, visible = true) {
  const el = overlay?.querySelector('[data-intro-beat]');
  if (!(el instanceof HTMLElement)) return;
  if (el.textContent !== text) el.textContent = text;
  el.style.opacity = visible ? '1' : '0';
}

/** Center title-card / act label (cold open + climax). */
export function setIntroTitleCard(
  overlay: HTMLElement | null,
  text: string,
  visible = true,
  sub = ''
) {
  const card = overlay?.querySelector('[data-intro-titlecard]');
  const title = overlay?.querySelector('[data-intro-act]');
  const subtitle = overlay?.querySelector('[data-intro-act-sub]');
  if (!(card instanceof HTMLElement) || !(title instanceof HTMLElement)) return;
  if (title.textContent !== text) title.textContent = text;
  if (subtitle instanceof HTMLElement && subtitle.textContent !== sub) {
    subtitle.textContent = sub;
  }
  card.style.opacity = visible ? '1' : '0';
  card.style.transform = visible ? 'scale(1)' : 'scale(1.04)';
}

/** Soft floating dust / spark field for depth and atmosphere. */
export function makeDustField(count = 280, spread = 16, color = 0xc9a05a) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.7 - 1.5;
    phases[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: 0.04,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.userData.phases = phases;
  points.userData.base = positions.slice();
  return points;
}

export function updateDustField(points: THREE.Points, elapsed: number, drift = 0.14) {
  const pos = points.geometry.getAttribute('position') as THREE.BufferAttribute;
  const phases = points.userData.phases as Float32Array;
  const base = points.userData.base as Float32Array;
  for (let i = 0; i < pos.count; i++) {
    const p = phases[i]!;
    pos.setXYZ(
      i,
      base[i * 3]! + Math.sin(elapsed * 0.38 + p) * drift,
      base[i * 3 + 1]! + Math.cos(elapsed * 0.3 + p * 1.3) * drift * 0.65,
      base[i * 3 + 2]! + Math.sin(elapsed * 0.22 + p * 0.7) * drift * 0.45
    );
  }
  pos.needsUpdate = true;
}

/** Expanding spark burst for prints / finality. */
export function makeSparkBurst(count = 48, color = COLORS.goldLight) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = 0.8 + Math.random() * 2.2;
    velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    velocities[i * 3 + 2] = Math.cos(phi) * speed;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: 0.06,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.userData.velocities = velocities;
  points.userData.born = -1;
  return points;
}

/** Fire spark burst from origin; call each frame with scene t and elapsed. */
export function updateSparkBurst(
  points: THREE.Points,
  origin: THREE.Vector3,
  fireAt: number,
  t: number,
  life = 0.28
) {
  const mat = points.material as THREE.PointsMaterial;
  if (t < fireAt) {
    mat.opacity = 0;
    points.userData.born = -1;
    return;
  }
  if (points.userData.born < 0) points.userData.born = fireAt;
  const age = (t - (points.userData.born as number)) / life;
  if (age > 1) {
    mat.opacity = 0;
    return;
  }
  const pos = points.geometry.getAttribute('position') as THREE.BufferAttribute;
  const vel = points.userData.velocities as Float32Array;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      origin.x + vel[i * 3]! * age,
      origin.y + vel[i * 3 + 1]! * age,
      origin.z + vel[i * 3 + 2]! * age * 0.6
    );
  }
  pos.needsUpdate = true;
  mat.opacity = (1 - age) * 0.95;
  mat.size = 0.05 + (1 - age) * 0.04;
}

/** Soft gold horizon wash behind the desk. */
export function makeHorizonGlow(width = 24, height = 12) {
  const group = new THREE.Group();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      color: COLORS.gold,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  back.position.set(0, 0.5, -5.2);
  group.add(back);

  const band = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.9, 0.35),
    new THREE.MeshBasicMaterial({
      color: COLORS.goldLight,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    })
  );
  band.position.set(0, -0.8, -4.8);
  group.add(band);
  return group;
}

/** Volumetric-feeling light shaft (tall soft plane). */
export function makeLightShaft(height = 10, color = COLORS.gold) {
  const shaft = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, height),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  shaft.position.z = -1.2;
  return shaft;
}

/** Thin vertical scan beam that can sweep across the board. */
export function makeScanBeam(height = 7.5, color = COLORS.goldLight) {
  const group = new THREE.Group();
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, height, 0.02),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  const glow = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, height, 0.01),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  group.add(beam, glow);
  group.position.z = 0.22;
  group.userData.beam = beam;
  group.userData.glow = glow;
  return group;
}

export function setScanBeamOpacity(group: THREE.Group, opacity: number) {
  const beam = group.userData.beam as THREE.Mesh;
  const glow = group.userData.glow as THREE.Mesh;
  (beam.material as THREE.MeshBasicMaterial).opacity = opacity;
  (glow.material as THREE.MeshBasicMaterial).opacity = opacity * 0.25;
}

/** Expanding shockwave ring for finality / 10Y beats. */
export function makeShockwaveRing(color = COLORS.goldLight) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.2, 64),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  return ring;
}

/** Bright print / inclusion flash sprite. */
export function makeFlashBurst(color = COLORS.goldLight) {
  const flash = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  return flash;
}

/** Secondary concentric rings for richer shockwaves. */
export function makeRippleSet(color = COLORS.goldLight, count = 3) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const ring = makeShockwaveRing(color);
    group.add(ring);
  }
  return group;
}

export function updateRippleSet(group: THREE.Group, progress: number, maxScale = 5) {
  group.children.forEach((child, i) => {
    const delay = i * 0.12;
    const local = Math.min(1, Math.max(0, (progress - delay) / (1 - delay * 0.5)));
    const mesh = child as THREE.Mesh;
    (mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(local * Math.PI) * 0.55;
    mesh.scale.setScalar(0.3 + local * maxScale);
  });
}

export function runTimedScene(options: {
  kit: SceneKit;
  overlay?: HTMLElement | null;
  durationMs?: number;
  onComplete: () => void;
  update: (t: number, dt: number) => void;
}): IntroSceneController {
  const durationMs = options.durationMs ?? INTRO_DURATION_MS;
  let raf = 0;
  let done = false;
  let skipping = false;
  let skipStart = 0;
  let skipFrom = 1;
  let started = false;

  const setAlpha = (a: number) => {
    const alpha = Math.max(0, Math.min(1, a));
    if (options.overlay) options.overlay.style.opacity = String(alpha);
    options.kit.renderer.domElement.style.opacity = '1';
  };

  const finish = () => {
    if (done) return;
    done = true;
    if (raf) cancelAnimationFrame(raf);
    options.onComplete();
  };

  const frame = () => {
    if (done) return;
    const dt = options.kit.clock.getDelta();
    const elapsed = options.kit.clock.elapsedTime;
    const t = Math.min(1, (elapsed * 1000) / durationMs);

    if (skipping) {
      const sk = Math.min(1, (performance.now() - skipStart) / INTRO_SKIP_FADE_MS);
      const alpha = skipFrom * (1 - easeInOutCubic(sk));
      options.update(Math.min(1, t + 0.15), dt);
      options.kit.render();
      setIntroBlackout(options.overlay ?? null, sk);
      setAlpha(alpha);
      if (sk >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
      return;
    }

    options.update(t, dt);

    // Black bookends: veil up at start/end; full chrome fade only at the very end.
    const blackIn = t < 0.05 ? 1 - easeOutCubic(t / 0.05) : 0;
    const blackOut = t > 0.86 ? easeInOutCubic((t - 0.86) / 0.14) : 0;
    setIntroBlackout(options.overlay ?? null, Math.max(blackIn, blackOut));
    const fade = t > 0.94 ? 1 - easeInOutCubic((t - 0.94) / 0.06) : 1;
    setAlpha(fade);
    options.kit.render();

    if (t >= 1) {
      finish();
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (started) return;
      started = true;
      options.kit.resize();
      options.kit.clock.start();
      setIntroBlackout(options.overlay ?? null, 1);
      setAlpha(1);
      raf = requestAnimationFrame(frame);
    },
    skip() {
      if (done || skipping) return;
      skipping = true;
      skipStart = performance.now();
      skipFrom = options.overlay
        ? Number.parseFloat(options.overlay.style.opacity || '1') || 1
        : 1;
    },
    destroy() {
      done = true;
      if (raf) cancelAnimationFrame(raf);
      options.kit.disposeBase();
    },
    resize() {
      options.kit.resize();
    },
  };
}

export function makeBarMaterial(color: number, opacity = 0.72) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.08,
    roughness: 0.72,
    transparent: true,
    opacity,
    emissive: color,
    emissiveIntensity: 0.03,
  });
}

export function makeFlatMaterial(color: number, opacity = 0.78) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

export function makeLineMaterial(color: number, opacity = 0.4) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
}

/** Hex prism block used as a chain / settlement unit. */
export function makeChainBlock(color = COLORS.gold, size = 0.45) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(size, size, size * 0.55, 6),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.22,
      metalness: 0.32,
      roughness: 0.42,
      transparent: true,
      opacity: 0.92,
    })
  );
  body.rotation.y = Math.PI / 6;
  group.add(body);

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 1.08, size * 1.08, size * 0.06, 6),
    new THREE.MeshBasicMaterial({
      color: COLORS.goldLight,
      transparent: true,
      opacity: 0.45,
    })
  );
  rim.position.y = size * 0.28;
  rim.rotation.y = Math.PI / 6;
  group.add(rim);

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.28, size * 0.28, size * 0.58, 6),
    new THREE.MeshBasicMaterial({
      color: COLORS.goldLight,
      transparent: true,
      opacity: 0.35,
    })
  );
  core.rotation.y = Math.PI / 6;
  group.add(core);
  return group;
}

/** Thin floating ticker strip with optional CanvasTexture glyphs. */
export function makeTickerStrip(width = 1.4, color = COLORS.gold, text?: string) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.09, 0.2),
    new THREE.MeshStandardMaterial({
      color: COLORS.ink,
      metalness: 0.15,
      roughness: 0.55,
      transparent: true,
      opacity: 0.94,
      emissive: COLORS.gold,
      emissiveIntensity: 0.04,
    })
  );
  group.add(body);

  if (text) {
    const c = document.createElement('canvas');
    c.width = 768;
    c.height = 48;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 768, 48);
    ctx.font = '500 22px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = '#c9a05a';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 14, 24);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.94, 0.07),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
    );
    label.position.set(0, 0.01, 0.11);
    group.add(label);
  } else {
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.5, 0.015, 0.03),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
    );
    dash.position.set(-width * 0.12, 0.04, 0.09);
    group.add(dash);
  }
  return group;
}

export function makeAgentNode(color = COLORS.teal, r = 0.14) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(r * 0.7, 0),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.2,
      metalness: 0.2,
      roughness: 0.5,
    })
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(r * 1.25, 1),
    new THREE.MeshStandardMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
  );
  group.add(core, shell);
  return group;
}

export function makeLink(a: THREE.Vector3, b: THREE.Vector3, color: number, opacity = 0.35) {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  return new THREE.Line(geo, makeLineMaterial(color, opacity));
}
