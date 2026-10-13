import { describe, expect, it } from 'vitest';
import { PROBLEMS } from './problems';
import { LEVELS, randomSession } from './round-two';

describe('randomSession', () => {
  it('gives one problem per level, easiest first', () => {
    expect(randomSession(3, () => 0.5).map((p) => p.minSteps)).toEqual([1, 2, 3]);
  });

  it('defaults to two problems', () => {
    expect(randomSession()).toHaveLength(2);
  });

  it.each(LEVELS)('can reach every problem at level %d', (level) => {
    const pool = PROBLEMS.filter((p) => p.minSteps === level);
    const reached = pool.map((_, k) => {
      const pick = randomSession(level, () => (k + 0.5) / pool.length).at(level - 1);
      return pick?.id;
    });
    expect(new Set(reached)).toEqual(new Set(pool.map((p) => p.id)));
  });

  it('stays in range when random returns its maximum', () => {
    expect(() => randomSession(3, () => 0.999999)).not.toThrow();
  });
});
