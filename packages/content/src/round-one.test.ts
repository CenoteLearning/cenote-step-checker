import { checkStep, RULES, type RuleId } from '@cenote/checker';
import { describe, expect, it } from 'vitest';
import { problemById } from './problems';
import { PATHS, pathForTester, type PathItem, type TestPath } from './round-one';

const mistakesIn = (path: TestPath): RuleId[] =>
  path.items.flatMap((item) => (item.kind === 'mistake' ? [item.expectRule] : []));

const rulesIn = (ids: number[]) => PATHS.filter((p) => ids.includes(p.id)).flatMap(mistakesIn);

describe('round 1 paths', () => {
  it('has 6 paths of 3 mistakes, 2 correct steps and free play last', () => {
    expect(PATHS).toHaveLength(6);
    for (const path of PATHS) {
      expect(path.items.filter((i) => i.kind === 'mistake')).toHaveLength(3);
      expect(path.items.filter((i) => i.kind === 'correct')).toHaveLength(2);
      expect(path.items.at(-1)?.kind).toBe('free');
    }
  });

  it('covers every rule once in paths 1-3 and again in paths 4-6', () => {
    expect(rulesIn([1, 2, 3]).sort()).toEqual([...RULES].sort());
    expect(rulesIn([4, 5, 6]).sort()).toEqual([...RULES].sort());
  });

  it('never pairs the same two rules in two paths', () => {
    const pairs = PATHS.flatMap((path) => {
      const rules = mistakesIn(path).sort();
      return rules.flatMap((a, i) => rules.slice(i + 1).map((b) => `${a}|${b}`));
    });
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  const scripted = PATHS.flatMap((path) =>
    path.items
      .filter((item): item is Exclude<PathItem, { kind: 'free' }> => item.kind !== 'free')
      .map((item) => [path.id, item.example, item] as const),
  );

  it.each(scripted)('path %d: %s gets the scripted result', (_id, _example, item) => {
    const result = checkStep(problemById(item.problemId).latex, item.example);
    if (item.kind === 'mistake') {
      expect(result.verdict).toBe('invalid');
      expect(result.feedback?.rule).toBe(item.expectRule);
    } else {
      expect(result.verdict).toBe(item.expectVerdict);
    }
  });

  it('hands paths out in order and wraps after 6', () => {
    expect([0, 1, 5, 6, 13].map((n) => pathForTester(n).id)).toEqual([1, 2, 6, 1, 2]);
  });
});
