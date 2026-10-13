import { analyse, buggyCandidates, checkStep, RULES, type RuleId } from '@cenote/checker';
import { describe, expect, it } from 'vitest';
import { PROBLEMS, problemById } from './problems';

// Rules found by replaying a wrong operation; the inequality rules are read
// straight off the solution sets and are covered by the paths instead.
const REPLAYED: ReadonlySet<RuleId> = new Set([
  'bracket-first-term',
  'divide-wrong-way',
  'subtract-coefficient',
  'divide-one-term',
  'sign-move',
  'one-side',
]);

describe('the starter problems', () => {
  it('has 20 problems with unique ids', () => {
    expect(PROBLEMS).toHaveLength(20);
    expect(new Set(PROBLEMS.map((p) => p.id)).size).toBe(20);
  });

  it.each(PROBLEMS.map((p) => [p.id, p.latex]))('%s (%s) has a single answer', (_id, latex) => {
    const a = analyse(latex);
    expect(a.ok && ['point', 'ray'].includes(a.step.solutions.kind)).toBe(true);
  });

  it('invites every rule at least once', () => {
    const invited = new Set(PROBLEMS.flatMap((p) => p.invites));
    expect(RULES.filter((r) => !invited.has(r))).toEqual([]);
  });

  const claims = PROBLEMS.flatMap((p) =>
    p.invites.filter((r) => REPLAYED.has(r)).map((r) => [p.id, r] as const),
  );

  it.each(claims)('%s really invites %s', (id, rule) => {
    const problem = problemById(id);
    const a = analyse(problem.latex);
    if (!a.ok) throw new Error(`${id} is unreadable`);
    const named = buggyCandidates(a.step)
      .filter((c) => c.rule === rule)
      .map((c) => checkStep(problem.latex, c.expr.latex).feedback?.rule);
    expect(named).toContain(rule);
  });

  it('throws on an unknown id', () => {
    expect(() => problemById('nope')).toThrow(/Unknown problem/);
  });
});
