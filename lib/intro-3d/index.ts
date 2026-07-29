import type { IntroSceneController, IntroSceneId } from './types';
import type { IntroMarketSnapshot } from './market-data';
import { FALLBACK_MARKET_SNAPSHOT } from './market-data';
import { createLiquidityLatticeScene } from './scenes/liquidityLattice';
import { createSettlementScene } from './scenes/settlement';
import { createMacroFieldScene } from './scenes/macroField';
import { createProgrammableMoneyScene } from './scenes/programmableMoney';

export function createIntroScene(
  id: IntroSceneId,
  canvas: HTMLCanvasElement,
  overlay: HTMLElement | null,
  onComplete: () => void,
  snapshot: IntroMarketSnapshot = FALLBACK_MARKET_SNAPSHOT
): IntroSceneController {
  switch (id) {
    case 'liquidityLattice':
      return createLiquidityLatticeScene(canvas, overlay, onComplete, snapshot);
    case 'settlement':
      return createSettlementScene(canvas, overlay, onComplete);
    case 'macroField':
      return createMacroFieldScene(canvas, overlay, onComplete, snapshot);
    case 'programmableMoney':
      return createProgrammableMoneyScene(canvas, overlay, onComplete);
    default:
      return createLiquidityLatticeScene(canvas, overlay, onComplete, snapshot);
  }
}

export { INTRO_SCENES, pickRandomIntroScene, INTRO_DURATION_MS, INTRO_STORAGE_KEY } from './types';
export type { IntroSceneId, IntroSceneController } from './types';
export type { IntroMarketSnapshot } from './market-data';
export { FALLBACK_MARKET_SNAPSHOT } from './market-data';
