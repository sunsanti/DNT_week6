const LEAD_MS = 15 * 60 * 1000;
const MIN_DELAY_MS = 5000;

// When to remind: 15 min before start. Started already → null. Already inside the 15 min
// window → a few seconds from now, so booking a soon slot still reminds.
export function reminderTime(startIso: string, now = Date.now()): Date | null {
  const start = new Date(startIso).getTime();
  if (start <= now) return null;
  return new Date(Math.max(start - LEAD_MS, now + MIN_DELAY_MS));
}
