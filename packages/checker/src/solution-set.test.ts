import { describe, expect, it } from 'vitest';
import { sameSolutions, solveLinear, type SolutionSet } from './solution-set';

describe('solveLinear', () => {
  it('solves an equation to one value', () => {
    expect(solveLinear('Equal', 5, -3)).toEqual({ kind: 'point', value: 0.6 });
  });

  it('solves a·x + b < 0 with a > 0 to a ray below the root', () => {
    expect(solveLinear('Less', 2, -6)).toEqual({
      kind: 'ray',
      bound: 3,
      side: 'below',
      strict: true,
    });
  });

  it('turns the ray around when a < 0', () => {
    // -2x - 6 ≤ 0  ⇔  x ≥ -3
    expect(solveLinear('LessEqual', -2, -6)).toEqual({
      kind: 'ray',
      bound: -3,
      side: 'above',
      strict: false,
    });
  });

  it.each([
    ['Equal', 0, 'all'],
    ['Equal', 1, 'none'],
    ['Less', -1, 'all'],
    ['Less', 0, 'none'],
    ['LessEqual', 0, 'all'],
    ['LessEqual', 1, 'none'],
  ] as const)('with no x left, %s and b = %d gives %s', (relation, b, kind) => {
    expect(solveLinear(relation, 0, b).kind).toBe(kind);
  });
});

describe('sameSolutions', () => {
  const point = (value: number): SolutionSet => ({ kind: 'point', value });
  const ray = (bound: number, side: 'below' | 'above', strict: boolean): SolutionSet => ({
    kind: 'ray',
    bound,
    side,
    strict,
  });

  it('treats 3/5 and 0.6 as the same value', () => {
    expect(sameSolutions(point(3 / 5), point(0.6))).toBe(true);
  });

  it('tells different values apart', () => {
    expect(sameSolutions(point(0.6), point(0.6001))).toBe(false);
  });

  it('compares a ray by bound, side and strictness', () => {
    expect(sameSolutions(ray(3, 'below', true), ray(3, 'below', true))).toBe(true);
    expect(sameSolutions(ray(3, 'below', true), ray(3, 'above', true))).toBe(false);
    expect(sameSolutions(ray(3, 'below', true), ray(3, 'below', false))).toBe(false);
  });

  it('never matches sets of different kinds', () => {
    expect(sameSolutions(point(3), ray(3, 'below', false))).toBe(false);
    expect(sameSolutions({ kind: 'all' }, { kind: 'none' })).toBe(false);
  });
});
