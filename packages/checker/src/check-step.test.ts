import { describe, expect, it } from 'vitest';
import { checkStep } from './check-step';

const verdict = (previous: string, step: string) => checkStep(previous, step).verdict;

describe('checkStep on equations', () => {
  it.each([
    ['divides both sides', '5x=3', 'x=\\frac{3}{5}', 'solved'],
    ['accepts a decimal answer', '5x=3', 'x=0.6', 'solved'],
    ['accepts the answer written on the left', '5x=3', '\\frac{3}{5}=x', 'solved'],
    ['subtracts from both sides', '2x+4=10', '2x=6', 'valid'],
    ['expands brackets', '3(x-1)=2x+5', '3x-3=2x+5', 'valid'],
    ['collects x terms', '3x-3=2x+5', 'x-3=5', 'valid'],
    ['accepts a big jump to the answer', '3(x-1)=2x+5', 'x=8', 'solved'],
    ['multiplies both sides by a fraction', '\\frac{x}{3}=2', 'x=6', 'solved'],
  ])('%s', (_name, previous, step, expected) => {
    expect(verdict(previous, step)).toBe(expected);
  });
});

describe('checkStep on inequalities', () => {
  it.each([
    ['divides by a negative and turns around', '-2x<6', 'x>-3', 'solved'],
    ['accepts the answer written the other way', '-2x<6', '-3<x', 'solved'],
    ['subtracts from both sides', '2x+1\\le 7', '2x\\le 6', 'valid'],
    ['divides by a positive without turning', '2x\\le 6', 'x\\le 3', 'solved'],
    ['handles >', '3x-4>8', '3x>12', 'valid'],
    ['handles a negative x', '-x\\ge 2', 'x\\le -2', 'solved'],
  ])('%s', (_name, previous, step, expected) => {
    expect(verdict(previous, step)).toBe(expected);
  });
});

describe('checkStep on wrong steps', () => {
  it.each([
    ['dividing the wrong way', '5x=3', 'x=\\frac{5}{3}'],
    ['multiplying both sides by zero', '5x=3', '0=0'],
    ['forgetting to turn the inequality around', '-2x<6', 'x<-3'],
    ['including the boundary', '2x<6', 'x\\le 3'],
  ])('marks %s invalid', (_name, previous, step) => {
    expect(verdict(previous, step)).toBe('invalid');
  });

  it('names the likely mistake and gives a hint', () => {
    expect(checkStep('2x+4=10', '2x=14').feedback).toEqual({
      rule: 'sign-move',
      message: expect.stringContaining('kept its sign') as string,
    });
  });

  it('gives no feedback on a correct step', () => {
    expect(checkStep('2x+4=10', '2x=6').feedback).toBeUndefined();
  });

  it("returns the wrong step's own solutions", () => {
    expect(checkStep('5x=3', 'x=\\frac{5}{3}').solutions).toEqual({
      kind: 'point',
      value: 5 / 3,
    });
  });
});

describe('checkStep outside v1', () => {
  it('passes unreadable and unsupported through', () => {
    expect(verdict('5x=3', '5x=')).toBe('unreadable');
    expect(verdict('5x=3', 'x^2=4')).toBe('unsupported');
  });

  it('keeps "no solution" and "every number" equivalent', () => {
    expect(verdict('x+1=x+2', '1=2')).toBe('valid');
    expect(verdict('2(x+1)=2x+2', '2=2')).toBe('valid');
  });

  it('throws when the previous step is not a valid problem', () => {
    expect(() => checkStep('x^2=4', 'x=2')).toThrow(/not a valid problem/);
  });
});
