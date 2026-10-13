import { describe, expect, it } from 'vitest';
import { analyse } from './analyse';
import { diagnose, formatNumber, UNMATCHED_MESSAGE } from './bug-library';

const read = (latex: string) => {
  const a = analyse(latex);
  if (!a.ok) throw new Error(`expected ${latex} to be readable, got ${a.verdict}`);
  return a.step;
};
const feedback = (previous: string, step: string) => diagnose(read(previous), read(step));

describe('diagnose', () => {
  it.each([
    ['sign-move', '2x+4=10', '2x=14'],
    ['sign-move', '3x-3=2x+5', '5x-3=5'],
    ['sign-move', '2x+4<10', '2x<14'],
    ['one-side', '2x+4=10', '2x=10'],
    ['divide-wrong-way', '5x=3', 'x=\\frac{5}{3}'],
    ['subtract-coefficient', '5x=3', 'x=-2'],
    ['divide-one-term', '2x+4=10', 'x+4=5'],
    ['bracket-first-term', '3(x-1)=2x+5', '3x-1=2x+5'],
    ['bracket-first-term', '-(x-3)=5', '-x-3=5'],
    ['flip-direction', '-2x<6', 'x<-3'],
    ['flip-direction', '2x<6', 'x>3'],
    ['strictness-changed', '2x<6', 'x\\le 3'],
    ['equals-for-inequality', '2x<6', 'x=3'],
  ])('names %s for %s → %s', (rule, previous, step) => {
    expect(feedback(previous, step).rule).toBe(rule);
  });

  it('falls back to unmatched for a mistake no rule explains', () => {
    expect(feedback('2x+4=10', 'x=100')).toEqual({
      rule: 'unmatched',
      message: UNMATCHED_MESSAGE,
    });
  });

  it('fills the hint with the numbers from the step', () => {
    expect(feedback('5x=3', 'x=\\frac{5}{3}').message).toContain('divided 5 by 3');
    expect(feedback('2x+4=10', '2x=14').message).toContain('across the =');
    expect(feedback('2x+4<10', '2x<14').message).toContain('across the <');
  });

  it('asks a question instead of giving the answer', () => {
    const { message } = feedback('5x=3', 'x=-2');
    expect(message).toMatch(/\?$/);
    expect(message).not.toContain('3/5');
  });
});

describe('formatNumber', () => {
  it.each([
    [4, '4'],
    [-21, '-21'],
    [0.6, '3/5'],
    [-1 / 3, '-1/3'],
    [Math.PI, '3.1416'],
  ])('writes %d as %s', (n, written) => {
    expect(formatNumber(n)).toBe(written);
  });
});
