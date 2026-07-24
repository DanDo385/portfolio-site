/**
 * Daily close for the intro simulation seed.
 * Swap the body for Alpha Vantage / Yahoo Finance later; keep the signature stable.
 */
export async function fetchDailyClosePrice(
  _symbol: string = 'SPX'
): Promise<number> {
  // Hardcoded institutional index level for offline / portfolio demos.
  return 5234.18;
}
