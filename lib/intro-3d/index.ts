import type { IntroSceneController, IntroSceneId } from './types';
import { createLiquidityLatticeScene } from './scenes/liquidityLattice';
import { createSettlementScene } from './scenes/settlement';
import { createMacroFieldScene } from './scenes/macroField';

export function createIntroScene(
  id: IntroSceneId,
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void
): IntroSceneController {
  switch (id) {
    case 'liquidityLattice':
      return createLiquidityLatticeScene(canvas, overlay, onComplete);
    case 'settlement':
      return createSettlementScene(canvas, overlay, onComplete);
    case 'macroField':
      return createMacroFieldScene(canvas, overlay, onComplete);
    default:
      return createLiquidityLatticeScene(canvas, overlay, onComplete);
  }
}

export { INTRO_SCENES, pickRandomIntroScene, INTRO_DURATION_MS, INTRO_STORAGE_KEY } from './types';
export type { IntroSceneId, IntroSceneController } from './types';
