import { describe, it, expect } from 'vitest';

/**
 * Unit tests for utility functions from book/page.tsx
 * These are extracted here for isolated testing.
 */

// ── normalizeToE164 ──────────────────────────────────────────────────────────
function normalizeToE164(phone: string): string {
  const raw = (phone || '').trim();
  if (!raw) return '';
  let normalized = raw.replace(/[^\d+]/g, '');
  if (normalized.startsWith('00')) normalized = `+${normalized.slice(2)}`;
  if (normalized.startsWith('+')) {
    normalized = `+${normalized.slice(1).replace(/\D/g, '')}`;
  } else {
    normalized = normalized.replace(/\D/g, '');
  }
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('0')) normalized = `+44${normalized.slice(1)}`;
    else if (normalized.startsWith('44')) normalized = `+${normalized}`;
  }
  return normalized;
}

// ── isE164 ───────────────────────────────────────────────────────────────────
function isE164(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('normalizeToE164', () => {
  it('converts UK local number starting with 0 to E164', () => {
    expect(normalizeToE164('07700 900123')).toBe('+447700900123');
  });

  it('handles number with +44 prefix already', () => {
    expect(normalizeToE164('+447700900123')).toBe('+447700900123');
  });

  it('converts 00 prefix to + prefix', () => {
    expect(normalizeToE164('00447700900123')).toBe('+447700900123');
  });

  it('handles number starting with 44 without +', () => {
    expect(normalizeToE164('447700900123')).toBe('+447700900123');
  });

  it('strips non-numeric characters (spaces, dashes, brackets)', () => {
    expect(normalizeToE164('+44 (770) 090-0123')).toBe('+447700900123');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeToE164('')).toBe('');
    expect(normalizeToE164('   ')).toBe('');
  });
});

describe('isE164', () => {
  it('accepts a valid E164 number', () => {
    expect(isE164('+447700900123')).toBe(true);
  });

  it('accepts without leading + per the regex', () => {
    // The regex is: /^\+?[1-9]\d{1,14}$/  — + is optional
    expect(isE164('447700900123')).toBe(true);
  });

  it('rejects a number starting with 0', () => {
    expect(isE164('07700900123')).toBe(false);
  });

  it('rejects a number that is too short (only country code, no subscriber number)', () => {
    // "+1" — only 1 digit after "+": \d{1,14} requires at least 1, so "+1" (1=[1-9], nothing after)
    // Actually regex: +1 → '+' consumed, '1' matches [1-9], no \d → {1,14} means 1 required → fails
    // Use a truly short one: "+1234" has only 3 digits which is below real phone length
    // but still matches the regex. The regex allows 2-15 digits total.
    // Test what the implementation actually enforces:
    expect(isE164('+1')).toBe(false); // only country code, no subscriber number
  });

  it('rejects letters and special chars', () => {
    expect(isE164('+44abc123')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isE164('')).toBe(false);
  });
});

// ── Fare calculation (extracted from book/page.tsx) ───────────────────────

function computeEstimatedFare(
  distanceKm: number,
  durationMin: number,
  vehicleType: string
): number {
  const base = 3.0;
  const perKm = 1.6;
  const perMin = 0.25;
  const minByVehicle: Record<string, number> = {
    standard: 8,
    executive: 12,
    minibus: 18,
  };
  const multiplierByVehicle: Record<string, number> = {
    standard: 1,
    executive: 1.35,
    minibus: 1.8,
  };
  const vehicleId = vehicleType || 'standard';
  const minFare = minByVehicle[vehicleId] ?? 8;
  const multiplier = multiplierByVehicle[vehicleId] ?? 1;
  const raw = (base + perKm * distanceKm + perMin * durationMin) * multiplier;
  return Math.round(Math.max(raw, minFare) * 100) / 100;
}

describe('computeEstimatedFare', () => {
  it('applies minimum fare for very short trips (standard)', () => {
    // 0 distance, 0 duration → raw = base * 1 = 3, min is 8
    const fare = computeEstimatedFare(0, 0, 'standard');
    expect(fare).toBe(8);
  });

  it('calculates standard vehicle fare correctly', () => {
    // 10km, 20min, standard: (3 + 16 + 5) * 1 = 24
    const fare = computeEstimatedFare(10, 20, 'standard');
    expect(fare).toBe(24);
  });

  it('applies executive multiplier (1.35x)', () => {
    // 10km, 0min, executive: (3 + 16) * 1.35 = 25.65, min=12
    const fare = computeEstimatedFare(10, 0, 'executive');
    expect(fare).toBe(25.65);
  });

  it('applies minibus multiplier (1.8x) and minimum fare', () => {
    // 10km, 0min, minibus: (3 + 16) * 1.8 = 34.2, min=18 → 34.2
    const fare = computeEstimatedFare(10, 0, 'minibus');
    expect(fare).toBe(34.2);
  });

  it('enforces minimum fare for minibus on short trip', () => {
    // 0km, 0min, minibus: base=3 * 1.8 = 5.4, min=18
    const fare = computeEstimatedFare(0, 0, 'minibus');
    expect(fare).toBe(18);
  });

  it('falls back to standard for unknown vehicle type', () => {
    const fare = computeEstimatedFare(10, 20, 'unknown');
    // unknown → minFare=8, multiplier=1, same as standard
    expect(fare).toBe(24);
  });
});
