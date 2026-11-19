/** USD per million tokens (Nov 2026). Check current prices on Anthropic's pricing page. */
export const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

export function costUsd(model: string, inputTokens: number, outputTokens: number): number | null {
  const p = PRICES[model];
  if (!p) return null; // e.g. a fallback model we have no price for
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}
