// ─── Nuyen transfer validation (pure, no I/O) ─────────────────────────────────

export const MAX_TRANSFER = 10_000_000;

/**
 * Validate a nuyen transfer.
 * Returns an error string, or null if valid.
 */
export function validateTransfer(senderNuyen: number, amount: number): string | null {
  if (!Number.isInteger(amount) || amount < 1) return "Amount must be a positive integer.";
  if (amount > MAX_TRANSFER) return `Cannot transfer more than ${MAX_TRANSFER.toLocaleString()}¥ at once.`;
  if (amount > senderNuyen) return `Insufficient funds (you have ${senderNuyen.toLocaleString()}¥).`;
  return null;
}
