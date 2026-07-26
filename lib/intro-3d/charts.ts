import * as THREE from 'three';
import { COLORS, makeBarMaterial, makeFlatMaterial } from './shared';

/** Canvas text plane for readable market labels in 3D. */
export function makeTextLabel(
  text: string,
  opts: {
    color?: string;
    fontSize?: number;
    font?: string;
    align?: CanvasTextAlign;
    maxWidth?: number;
    opacity?: number;
  } = {}
) {
  const fontSize = opts.fontSize ?? 26;
  const font = opts.font ?? `500 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
  const color = opts.color ?? '#b8c2d6';
  const padX = 8;
  const padY = 5;

  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = font;
  const metrics = measure.measureText(text);
  const tw = Math.ceil(metrics.width) + padX * 2;
  const th = Math.ceil(fontSize * 1.3) + padY * 2;

  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, tw, th);
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = 'middle';
  const x = opts.align === 'center' ? tw / 2 : opts.align === 'right' ? tw - padX : padX;
  ctx.fillText(text, x, th / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const worldW = opts.maxWidth ?? tw / 95;
  const aspect = tw / th;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(worldW, worldW / aspect),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: opts.opacity ?? 0.88,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  mesh.userData.disposeLabel = () => {
    tex.dispose();
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  };
  return mesh;
}

/** Quiet terminal panel: hairline border, soft fill, fine grid. */
export function makeChartFrame(width: number, height: number, divisionsX = 6, divisionsY = 4) {
  const group = new THREE.Group();

  // Slight thickness so orbit/lighting reads as a board, not a sprite
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.08),
    new THREE.MeshStandardMaterial({
      color: COLORS.panel,
      metalness: 0.12,
      roughness: 0.82,
      transparent: true,
      opacity: 0.94,
    })
  );
  plate.position.z = -0.05;
  group.add(plate);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, height)),
    new THREE.LineBasicMaterial({ color: 0x3a455c, transparent: true, opacity: 0.55 })
  );
  border.position.z = 0.01;
  group.add(border);

  const accent = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.22, 0.018, 0.01),
    new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.55 })
  );
  accent.position.set(-width / 2 + width * 0.14, height / 2 - 0.18, 0.02);
  group.add(accent);

  const lines: THREE.Vector3[] = [];
  for (let i = 1; i < divisionsX; i++) {
    const x = -width / 2 + (width * i) / divisionsX;
    lines.push(new THREE.Vector3(x, -height / 2 + 0.15, 0.015), new THREE.Vector3(x, height / 2 - 0.35, 0.015));
  }
  for (let i = 1; i < divisionsY; i++) {
    const y = -height / 2 + (height * i) / divisionsY;
    lines.push(new THREE.Vector3(-width / 2 + 0.12, y, 0.015), new THREE.Vector3(width / 2 - 0.12, y, 0.015));
  }
  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(lines),
      new THREE.LineBasicMaterial({ color: COLORS.grid, transparent: true, opacity: 0.38 })
    )
  );

  return group;
}

/** Thin DOM depth bar (flat fill, terminal-like). */
export function makeDepthBar(size: number, color: number, toward: 'left' | 'right') {
  const geo = new THREE.BoxGeometry(1, 0.16, 0.04);
  geo.translate(toward === 'left' ? -0.5 : 0.5, 0, 0);
  const mesh = new THREE.Mesh(geo, makeFlatMaterial(color, 0.55));
  mesh.scale.x = Math.max(0.001, size);
  return mesh;
}

export type Candle = { o: number; h: number; l: number; c: number };

/** Flat OHLC candle (screen-like, not chunky blocks). */
export function makeCandle(c: Candle, width = 0.22) {
  const group = new THREE.Group();
  const up = c.c >= c.o;
  const color = up ? COLORS.bid : COLORS.ask;
  const bodyLo = Math.min(c.o, c.c);
  const bodyHi = Math.max(c.o, c.c);
  const bodyH = Math.max(0.03, bodyHi - bodyLo);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.72, bodyH, 0.03),
    makeFlatMaterial(color, 0.82)
  );
  body.position.y = bodyLo + bodyH / 2;
  group.add(body);

  const wickH = Math.max(0.02, c.h - c.l);
  const wick = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.08, wickH, 0.02),
    makeFlatMaterial(color, 0.7)
  );
  wick.position.y = c.l + wickH / 2;
  group.add(wick);

  group.userData.up = up;
  return group;
}

/** Soft volume histogram under a chart. */
export function makeVolumeBar(height: number, up: boolean, width = 0.22) {
  const geo = new THREE.BoxGeometry(width * 0.7, 1, 0.03);
  geo.translate(0, 0.5, 0);
  const mesh = new THREE.Mesh(geo, makeFlatMaterial(up ? COLORS.bid : COLORS.ask, 0.28));
  mesh.scale.y = Math.max(0.001, height);
  return mesh;
}

/** Seeded pseudo-random for repeatable fake market data. */
export function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate a short OHLC series that looks like a real tape. */
export function generateCandles(count: number, seed = 42, start = 100): Candle[] {
  const rand = mulberry32(seed);
  const out: Candle[] = [];
  let px = start;
  for (let i = 0; i < count; i++) {
    const drift = (rand() - 0.48) * 2.2;
    const o = px;
    const c = o + drift;
    const h = Math.max(o, c) + rand() * 0.95;
    const l = Math.min(o, c) - rand() * 0.95;
    out.push({ o, h, l, c });
    px = c;
  }
  return out;
}

/** Normalize candles into a chart-local y range. */
export function layoutCandles(
  candles: Candle[],
  chartH: number,
  pad = 0.15
): { candles: Candle[]; min: number; max: number; scale: (v: number) => number } {
  let min = Infinity;
  let max = -Infinity;
  for (const c of candles) {
    min = Math.min(min, c.l);
    max = Math.max(max, c.h);
  }
  const span = Math.max(0.001, max - min);
  const usable = chartH * (1 - pad * 2);
  const scale = (v: number) => -chartH / 2 + chartH * pad + ((v - min) / span) * usable;
  return {
    candles: candles.map((c) => ({
      o: scale(c.o),
      h: scale(c.h),
      l: scale(c.l),
      c: scale(c.c),
    })),
    min,
    max,
    scale,
  };
}

/** Soft depth-of-book sizes that peak near the touch. */
export function depthSizes(levels: number, seed = 7): number[] {
  const rand = mulberry32(seed);
  const sizes: number[] = [];
  for (let i = 0; i < levels; i++) {
    const near = Math.exp(-i * 0.24);
    sizes.push(0.4 + near * 2.4 + rand() * 0.4);
  }
  return sizes;
}

/** Floor under the desk so orbit reads as physical space. */
export function makeDeskFloor(size = 22) {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(size / 2, 64),
    new THREE.MeshStandardMaterial({
      color: 0x060910,
      metalness: 0.35,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.6;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(size / 2 - 0.04, size / 2, 64),
    new THREE.MeshBasicMaterial({
      color: COLORS.gold,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -3.58;

  const g = new THREE.Group();
  g.add(floor, ring);
  return g;
}
