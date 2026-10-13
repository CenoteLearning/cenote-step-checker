import { describe, expect, it } from 'vitest';
import { analyse } from './analyse';

const read = (latex: string) => {
  const a = analyse(latex);
  if (!a.ok) throw new Error(`expected ${latex} to be readable, got ${a.verdict}`);
  return a.step;
};

describe('analyse', () => {
  it('solves an equation', () => {
    expect(read('5x=3').solutions).toEqual({ kind: 'point', value: 0.6 });
  });

  it('solves a bracket equation', () => {
    expect(read('3(x-1)=2x+5').solutions).toEqual({ kind: 'point', value: 8 });
  });

  it('solves a strict inequality with a negative coefficient', () => {
    expect(read('-2x<6').solutions).toEqual({
      kind: 'ray',
      bound: -3,
      side: 'above',
      strict: true,
    });
  });

  it('reads > and ≥ through the rewrite to < and ≤', () => {
    expect(read('3x-4>8').solutions).toEqual({
      kind: 'ray',
      bound: 4,
      side: 'above',
      strict: true,
    });
    expect(read('x\\ge -2').solutions).toEqual({
      kind: 'ray',
      bound: -2,
      side: 'above',
      strict: false,
    });
  });

  it('recognises an answer written either way round', () => {
    expect(read('x=\\frac{3}{5}').isAnswerForm).toBe(true);
    expect(read('\\frac{3}{5}=x').isAnswerForm).toBe(true);
    expect(read('-3<x').isAnswerForm).toBe(true);
    expect(read('2x=6').isAnswerForm).toBe(false);
  });

  it('finds no solution and every solution', () => {
    expect(read('x+1=x+2').solutions.kind).toBe('none');
    expect(read('2(x+1)=2x+2').solutions.kind).toBe('all');
  });

  it.each(['5x=', '5x', '', 'x=1=2'])('flags %j as unreadable', (latex) => {
    expect(analyse(latex)).toEqual({ ok: false, verdict: 'unreadable' });
  });

  it.each(['x^2=4', '5y=3', '\\frac{1}{x}=2'])('flags %j as unsupported', (latex) => {
    expect(analyse(latex)).toEqual({ ok: false, verdict: 'unsupported' });
  });
});
