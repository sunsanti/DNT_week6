import { overlapCheck, slotsOverlap } from '@/utils/overlapCheck';
import type { TimeSlot } from '@/types';

const slot = (start: string, end: string): TimeSlot => ({ start, end });

describe('slotsOverlap', () => {
  it('detects a full overlap (identical slots)', () => {
    const a = slot('2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z');
    const b = slot('2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z');
    expect(slotsOverlap(a, b)).toBe(true);
  });

  it('detects a partial overlap', () => {
    const a = slot('2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z');
    const b = slot('2026-01-01T09:30:00Z', '2026-01-01T10:30:00Z');
    expect(slotsOverlap(a, b)).toBe(true);
  });

  it('treats back-to-back adjacent slots as non-overlapping', () => {
    const a = slot('2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z');
    const b = slot('2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z');
    expect(slotsOverlap(a, b)).toBe(false);
  });

  it('detects no overlap when slots are far apart', () => {
    const a = slot('2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z');
    const b = slot('2026-01-01T14:00:00Z', '2026-01-01T15:00:00Z');
    expect(slotsOverlap(a, b)).toBe(false);
  });

  it('detects containment (one slot fully inside another)', () => {
    const a = slot('2026-01-01T09:00:00Z', '2026-01-01T12:00:00Z');
    const b = slot('2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z');
    expect(slotsOverlap(a, b)).toBe(true);
  });
});

describe('overlapCheck', () => {
  const existing: TimeSlot[] = [
    slot('2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z'),
    slot('2026-01-01T13:00:00Z', '2026-01-01T14:00:00Z'),
  ];

  it('returns true when the candidate overlaps any existing slot', () => {
    const candidate = slot('2026-01-01T09:30:00Z', '2026-01-01T10:30:00Z');
    expect(overlapCheck(existing, candidate)).toBe(true);
  });

  it('returns false when the candidate fits between existing slots', () => {
    const candidate = slot('2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z');
    expect(overlapCheck(existing, candidate)).toBe(false);
  });

  it('returns false against an empty existing list', () => {
    const candidate = slot('2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z');
    expect(overlapCheck([], candidate)).toBe(false);
  });
});
