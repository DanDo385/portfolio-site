import * as THREE from 'three';
import { makeChartFrame, makeDeskFloor, makeTextLabel } from '../charts';
import {
  fairValueYields,
  formatAsOf,
  formatYieldBeat,
  FALLBACK_MARKET_SNAPSHOT,
  type IntroMarketSnapshot,
} from '../market-data';
import {
  COLORS,
  applyTrailerGrade,
  createSceneKit,
  driveCutCamera,
  easeOutCubic,
  makeDustField,
  makeFlatMaterial,
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

/** Cinematic yield-curve trailer driven by FRED (or fallback) snapshot. */
export function createMacroFieldScene(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void,
  snapshot: IntroMarketSnapshot = FALLBACK_MARKET_SNAPSHOT
): IntroSceneController {
  const kit = createSceneKit(canvas);
  const { root, camera, scene } = kit;
  scene.fog = new THREE.FogExp2(COLORS.bg, 0.017);
  root.add(makeDeskFloor(28));
  root.add(makeHorizonGlow(26, 12));

  const dust = makeDustField(220, 17, 0xc9a05a);
  root.add(dust);

  const shaft = makeLightShaft(12, COLORS.gold);
  shaft.position.set(1.5, 1.4, -2);
  shaft.rotation.z = -0.08;
  root.add(shaft);

  const spot = new THREE.PointLight(COLORS.gold, 0.55, 18);
  spot.position.set(1.2, 4.0, 3.4);
  scene.add(spot);

  const desk = new THREE.Group();
  root.add(desk);

  const frame = makeChartFrame(11.2, 6.2, 8, 5);
  desk.add(frame);

  const tenors = snapshot.yields.tenors;
  const fairYlds = fairValueYields(tenors);
  const beats = formatYieldBeat(snapshot.yields.tenY, snapshot.yields.spread2s10sBp);
  const asOfLabel = formatAsOf(snapshot.asOf);
  const srcNote =
    snapshot.source === 'fallback' ? 'DESK SNAPSHOT' : snapshot.source.toUpperCase().replace('+', ' · ');

  const title = makeTextLabel('USD RATES  ·  YIELD CURVE', {
    color: '#b8893d',
    fontSize: 22,
    maxWidth: 4.2,
  });
  title.position.set(-5.0, 2.75, 0.07);
  desk.add(title);

  const session = makeTextLabel(`TREASURY  ·  AS OF ${asOfLabel}`, {
    color: '#6b7a94',
    fontSize: 13,
    align: 'right',
    maxWidth: 3.2,
    opacity: 0.72,
  });
  session.position.set(4.9, 2.75, 0.07);
  desk.add(session);

  const sourceTag = makeTextLabel(srcNote, {
    color: '#5a6a82',
    fontSize: 11,
    align: 'right',
    maxWidth: 2.6,
    opacity: 0.55,
  });
  sourceTag.position.set(4.9, 2.48, 0.07);
  desk.add(sourceTag);

  const yMin = Math.min(...tenors.map((t) => t.yld), ...fairYlds) - 0.25;
  const yMax = Math.max(...tenors.map((t) => t.yld), ...fairYlds) + 0.25;
  const chartBottom = -2.3;
  const chartTop = 2.1;
  const xLeft = -4.7;
  const xRight = 4.7;
  const scaleY = (v: number) =>
    chartBottom + ((v - yMin) / (yMax - yMin)) * (chartTop - chartBottom);

  const tickStep = yMax - yMin > 1.2 ? 0.5 : 0.25;
  const tickStart = Math.ceil(yMin / tickStep) * tickStep;
  for (let tick = tickStart; tick <= yMax + 1e-6; tick += tickStep) {
    const y = scaleY(tick);
    const lbl = makeTextLabel(`${tick.toFixed(2)}%`, {
      color: '#5a6a82',
      fontSize: 12,
      align: 'right',
      maxWidth: 0.75,
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
        new THREE.LineBasicMaterial({ color: COLORS.grid, transparent: true, opacity: 0.3 })
      )
    );
  }

  // Faint 10Y history ribbon (left gutter sparkline)
  const hist = snapshot.yields.tenYHistory;
  if (hist.length > 2) {
    const hMin = Math.min(...hist);
    const hMax = Math.max(...hist);
    const hPts: THREE.Vector3[] = hist.map((v, i) => {
      const x = -5.35 + (i / (hist.length - 1)) * 1.15;
      const y = -2.05 + ((v - hMin) / Math.max(0.01, hMax - hMin)) * 0.9;
      return new THREE.Vector3(x, y, 0.05);
    });
    const histLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(hPts),
      new THREE.LineBasicMaterial({ color: COLORS.slate, transparent: true, opacity: 0.45 })
    );
    desk.add(histLine);
    const histLbl = makeTextLabel('10Y PATH', {
      color: '#5a6a82',
      fontSize: 10,
      maxWidth: 1.0,
      opacity: 0.55,
    });
    histLbl.position.set(-5.35, -1.05, 0.06);
    desk.add(histLbl);
  }

  const pts: THREE.Vector3[] = [];
  const fairPts: THREE.Vector3[] = [];
  const nodes: THREE.Mesh[] = [];
  const bars: THREE.Mesh[] = [];
  const nodeLabels: THREE.Object3D[] = [];
  const tenIdx = tenors.findIndex((t) => t.label === '10Y');
  const twoIdx = tenors.findIndex((t) => t.label === '2Y');

  tenors.forEach((tenor, i) => {
    const x = xLeft + ((xRight - xLeft) * i) / (tenors.length - 1);
    const y = scaleY(tenor.yld);
    pts.push(new THREE.Vector3(x, y, 0.09));
    fairPts.push(new THREE.Vector3(x, scaleY(fairYlds[i]!), 0.07));

    const isTen = i === tenIdx;
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(isTen ? 0.11 : 0.07, 18, 18),
      new THREE.MeshStandardMaterial({
        color: COLORS.gold,
        emissive: COLORS.gold,
        emissiveIntensity: isTen ? 0.55 : 0.16,
        metalness: 0.35,
        roughness: 0.38,
      })
    );
    node.position.set(x, y, 0.11);
    node.scale.setScalar(0.01);
    nodes.push(node);
    desk.add(node);

    const stemH = y - chartBottom;
    const geo = new THREE.BoxGeometry(0.08, 1, 0.03);
    geo.translate(0, 0.5, 0);
    const stem = new THREE.Mesh(geo, makeFlatMaterial(COLORS.blue, 0.34));
    stem.position.set(x, chartBottom, 0.05);
    stem.scale.y = 0.001;
    stem.userData.target = stemH;
    bars.push(stem);
    desk.add(stem);

    const tl = makeTextLabel(tenor.label, {
      color: isTen ? '#c9a05a' : '#6b7a94',
      fontSize: isTen ? 16 : 14,
      align: 'center',
      maxWidth: 0.55,
      opacity: 0.82,
    });
    tl.position.set(x, chartBottom - 0.32, 0.07);
    desk.add(tl);

    const yl = makeTextLabel(tenor.yld.toFixed(2), {
      color: '#b8c2d6',
      fontSize: 12,
      align: 'center',
      maxWidth: 0.6,
      opacity: 0.78,
    });
    yl.position.set(x, y + 0.28, 0.11);
    yl.scale.setScalar(0.01);
    nodeLabels.push(yl);
    desk.add(yl);
  });

  const curve = new THREE.CatmullRomCurve3(pts);
  const marketCurve = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 120, 0.032, 12, false),
    new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      emissive: COLORS.gold,
      emissiveIntensity: 0.28,
      transparent: true,
      opacity: 0,
      metalness: 0.28,
      roughness: 0.35,
    })
  );
  desk.add(marketCurve);

  const areaPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const p = curve.getPoint(u);
    areaPts.push(new THREE.Vector3(p.x, chartBottom, 0.04));
    areaPts.push(new THREE.Vector3(p.x, p.y, 0.04));
  }
  const areaGeo = new THREE.BufferGeometry().setFromPoints(areaPts);
  const indices: number[] = [];
  for (let i = 0; i < 40; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  areaGeo.setIndex(indices);
  areaGeo.computeVertexNormals();
  const area = new THREE.Mesh(
    areaGeo,
    new THREE.MeshBasicMaterial({
      color: COLORS.gold,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  desk.add(area);

  const drawDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 14, 14),
    new THREE.MeshBasicMaterial({ color: COLORS.goldLight, transparent: true, opacity: 0 })
  );
  desk.add(drawDot);
  const drawLight = new THREE.PointLight(COLORS.gold, 1.0, 3.5);
  desk.add(drawLight);

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
    fontSize: 13,
    align: 'center',
    maxWidth: 3.8,
    opacity: 0.72,
  });
  legend.position.set(0, -2.55, 0.07);
  desk.add(legend);

  const calloutText = `${beats.tenY}   ·   ${beats.spread}`;
  const callout = makeTextLabel(calloutText, {
    color: '#c9a05a',
    fontSize: 20,
    align: 'center',
    maxWidth: 4.4,
  });
  callout.position.set(0, -2.95, 0.1);
  callout.scale.setScalar(0.01);
  desk.add(callout);

  const tenY = pts[Math.max(0, tenIdx)]!;
  const twoY = pts[Math.max(0, twoIdx)]!;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.2, 0.3, 48),
    new THREE.MeshBasicMaterial({
      color: COLORS.goldLight,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
  );
  ring.position.set(tenY.x, tenY.y, 0.14);
  desk.add(ring);

  const ripples = makeRippleSet(COLORS.gold, 4);
  ripples.position.set(tenY.x, tenY.y, 0.16);
  desk.add(ripples);

  const sparks = makeSparkBurst(40, COLORS.goldLight);
  desk.add(sparks);

  const spreadBand = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.abs(tenY.x - twoY.x), 0.1),
    new THREE.MeshBasicMaterial({
      color: COLORS.rose,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  spreadBand.position.set((twoY.x + tenY.x) / 2, (twoY.y + tenY.y) / 2 - 0.4, 0.08);
  desk.add(spreadBand);

  const spreadLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(twoY.x, twoY.y, 0.12),
      new THREE.Vector3(tenY.x, tenY.y, 0.12),
    ]),
    new THREE.LineBasicMaterial({ color: COLORS.rose, transparent: true, opacity: 0 })
  );
  desk.add(spreadLine);

  const highlightIdx = tenIdx >= 0 ? tenIdx : Math.floor(tenors.length / 2);

  const shots: CameraShot[] = [
    { at: 0, radius: 17.2, height: 6.2, yaw: -1.05, lookY: 0.15, fov: 42, dutch: 0.05 },
    { at: 0.14, radius: 13.8, height: 4.6, yaw: -0.55, lookY: 0.1, fov: 34 },
    {
      at: 0.48,
      radius: 8.6,
      height: 3.0,
      yaw: -0.05,
      lookX: tenY.x * 0.55,
      lookY: tenY.y * 0.35,
      fov: 26,
      dutch: -0.025,
    },
    { at: 0.58, radius: 10.8, height: 3.6, yaw: 0.2, lookX: tenY.x * 0.25, lookY: 0.05, fov: 30 },
    { at: 0.84, radius: 15.2, height: 5.4, yaw: 0.55, lookY: 0.05, fov: 36 },
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
        act === 'black' || act === 'out' ? 0.06 : 0.16;

      setIntroTitleCard(
        overlay,
        'YIELD CURVE',
        act === 'title',
        `USD TREASURY · ${asOfLabel}`
      );

      const rise = easeOutCubic(Math.min(1, Math.max(0, (t - 0.14) / 0.28)));
      bars.forEach((b) => {
        b.scale.y = rise * (b.userData.target as number);
      });
      nodes.forEach((n, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.14 - i * 0.024) / 0.16)));
        n.scale.setScalar(0.01 + local * 0.99);
      });
      nodeLabels.forEach((lbl, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, (t - 0.2 - i * 0.02) / 0.18)));
        lbl.scale.setScalar(0.01 + local * 0.99);
      });

      // Continuous draw during assemble (signature take)
      const drawEnd = 0.5;
      const reveal = easeOutCubic(Math.min(1, Math.max(0, (t - 0.18) / 0.3)));
      (marketCurve.material as THREE.MeshStandardMaterial).opacity = reveal * 0.96;
      (marketCurve.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.14 + reveal * 0.22;
      (fairCurve.material as THREE.LineDashedMaterial).opacity = reveal * 0.55;
      (area.material as THREE.MeshBasicMaterial).opacity = reveal * 0.1;

      if (t > 0.16 && t < drawEnd) {
        const drawT = (t - 0.16) / (drawEnd - 0.16);
        const p = curve.getPoint(Math.min(1, drawT));
        drawDot.position.copy(p);
        drawDot.position.z += 0.06;
        (drawDot.material as THREE.MeshBasicMaterial).opacity = 0.95;
        drawLight.position.copy(p);
        drawLight.intensity = 1.35;
      } else {
        (drawDot.material as THREE.MeshBasicMaterial).opacity = 0;
        drawLight.intensity = 0;
      }

      const lock = easeOutCubic(Math.min(1, Math.max(0, (t - 0.5) / 0.14)));
      callout.scale.setScalar(0.01 + lock * 0.99);
      (ring.material as THREE.MeshBasicMaterial).opacity = lock * 0.75;
      (spreadBand.material as THREE.MeshBasicMaterial).opacity = lock * 0.35;
      (spreadLine.material as THREE.LineBasicMaterial).opacity = lock * 0.65;

      if (act === 'insert' || act === 'climax') {
        const pulse = 1 + Math.sin(t * 12) * 0.1;
        nodes[highlightIdx]!.scale.setScalar(pulse);
        ring.scale.setScalar(0.75 + Math.sin(t * 10) * 0.18);
        spot.intensity = 0.35 + lock * 0.85;
        spot.position.set(tenY.x, tenY.y + 2.0, 2.6);
        updateRippleSet(ripples, Math.min(1, (t - 0.52) / 0.28), 4.4);
        if (act === 'climax') kit.setBloom(0.55 + lock * 0.45);
      }

      updateSparkBurst(sparks, new THREE.Vector3(tenY.x, tenY.y, 0.2), 0.56, t, 0.22);

      if (act === 'black' || act === 'title' || act === 'out') setIntroBeat(overlay, '', false);
      else if (act === 'assemble') setIntroBeat(overlay, 'USD RATES', true);
      else if (act === 'insert') setIntroBeat(overlay, beats.tenY, true);
      else setIntroBeat(overlay, beats.spread, t < 0.86);

      (shaft.material as THREE.MeshBasicMaterial).opacity = 0.03 + reveal * 0.07;
      driveCutCamera(camera, desk, t, shots);
    },
  });
}
