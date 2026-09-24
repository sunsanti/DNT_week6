import { reminderTime } from '@/utils/reminderTime';

const now = Date.parse('2026-01-01T09:00:00Z');

describe('reminderTime', () => {
  it('reminds 15 minutes before the slot starts', () => {
    expect(reminderTime('2026-01-01T10:00:00Z', now)?.toISOString()).toBe(
      '2026-01-01T09:45:00.000Z',
    );
  });

  it('reminds shortly after booking when the slot is inside the 15 minute window', () => {
    expect(reminderTime('2026-01-01T09:10:00Z', now)?.getTime()).toBe(now + 5000);
  });

  it('does not remind for a slot that already started', () => {
    expect(reminderTime('2026-01-01T08:00:00Z', now)).toBeNull();
  });
});
