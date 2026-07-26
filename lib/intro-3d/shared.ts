import * as THREE from 'three';
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.038);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  const root = new THREE.Group();
  scene.add(root);

  const ambient = new THREE.AmbientLight(0x7a889c, 0.7);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xd8e0ef, 0.85);
  key.position.set(3, 7, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6a8fb8, 0.22);
  fill.position.set(-5, 2, -3);
  scene.add(fill);
  const rim = new THREE.PointLight(COLORS.gold, 0.45, 28);
  rim.position.set(0, 5, 3);
  scene.add(rim);

  const clock = new THREE.Clock();

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  };

  const disposeBase = () => {
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    renderer.dispose();
  };

  return { renderer, scene, camera, root, clock, resize, disposeBase };
}

/**
 * Cinematic orbit: camera arcs around the desk with strong Z-roll (bank)
 * so the board reads as a 3D surface rather than a flat poster.
 */
export function orbitDeskCamera(
  camera: THREE.PerspectiveCamera,
  desk: THREE.Object3D,
  t: number,
  opts: {
    radius?: number;
    height?: number;
    yawSpan?: number;
    rollSpan?: number;
    tiltX?: number;
    lookY?: number;
    zoomIn?: number;
  } = {}
) {
  const e = easeInOutCubic(t);
  const radius = (opts.radius ?? 11.2) - e * (opts.zoomIn ?? 2.8);
  const yaw0 = -(opts.yawSpan ?? 0.95) / 2;
  const yaw = yaw0 + e * (opts.yawSpan ?? 0.95);
  const height = (opts.height ?? 3.4) - e * 0.7;
  const lookY = opts.lookY ?? 0.15;

  camera.position.set(Math.sin(yaw) * radius, height, Math.cos(yaw) * radius);
  camera.lookAt(0, lookY, 0);

  // Board banks around Z as the camera sweeps
  const roll = Math.sin(e * Math.PI) * (opts.rollSpan ?? 0.42);
  desk.rotation.z = roll;
  desk.rotation.x = (opts.tiltX ?? -0.38) + e * 0.08;
  desk.rotation.y = yaw * 0.15;
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
      options.kit.renderer.render(options.kit.scene, options.kit.camera);
      setAlpha(alpha);
      if (sk >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
      return;
    }

    options.update(t, dt);
    // Final 18% fade into the real site
    const fade = t > 0.82 ? 1 - easeInOutCubic((t - 0.82) / 0.18) : 1;
    setAlpha(fade);
    options.kit.renderer.render(options.kit.scene, options.kit.camera);

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
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(size, size, size * 0.55, 6),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.1,
      metalness: 0.25,
      roughness: 0.55,
      transparent: true,
      opacity: 0.85,
    })
  );
  mesh.rotation.y = Math.PI / 6;
  return mesh;
}

/** Thin floating ticker strip (markets tape). */
export function makeTickerStrip(width = 1.4, color = COLORS.gold) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.06, 0.16),
    new THREE.MeshStandardMaterial({
      color: COLORS.ink,
      metalness: 0.1,
      roughness: 0.65,
      transparent: true,
      opacity: 0.9,
    })
  );
  const dash = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.5, 0.015, 0.03),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
  );
  dash.position.set(-width * 0.12, 0.04, 0.09);
  group.add(body, dash);
  return group;
}

/** Agent / neural node with a soft shell. */
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

