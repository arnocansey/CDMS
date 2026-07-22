import { formatCurrency, formatDate } from '../format';

describe('formatCurrency', () => {
  it('formats a number as USD currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    expect(formatDate('2026-07-22')).toBe('July 22, 2026');
  });
});
