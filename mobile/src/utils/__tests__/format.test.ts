import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatShortDate,
} from '../format';

describe('formatCurrency', () => {
  it('formats a number as USD currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-25)).toBe('-$25.00');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    expect(formatDate('2026-07-22')).toBe('July 22, 2026');
  });

  it('formats a Date object', () => {
    expect(formatDate(new Date('2026-01-05T12:00:00Z'))).toMatch(/January 5, 2026/);
  });
});

describe('formatDateTime', () => {
  it('includes date and time parts', () => {
    const result = formatDateTime('2026-07-22T15:30:00');
    expect(result).toContain('Jul');
    expect(result).toContain('22');
    expect(result).toContain('2026');
  });
});

describe('formatShortDate', () => {
  it('formats a short month and day', () => {
    expect(formatShortDate('2026-07-22')).toBe('Jul 22');
  });
});
