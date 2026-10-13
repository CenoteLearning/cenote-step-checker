/**
 * The x values that satisfy a linear equation or inequality: one value, a ray
 * such as x < 3 or x ≥ -2, every number, or none.
 */
export type SolutionSet =
  | { kind: 'none' }
  | { kind: 'all' }
  | { kind: 'point'; value: number }
  | { kind: 'ray'; bound: number; side: 'below' | 'above'; strict: boolean };

/**
 * How the two sides compare. The parser rewrites > and ≥ as < and ≤ with the
 * sides swapped, so these three cover every linear equation and inequality.
 */
export type Relation = 'Equal' | 'Less' | 'LessEqual';

export const RELATIONS: readonly Relation[] = ['Equal', 'Less', 'LessEqual'];

const EPSILON = 1e-9;

/** Equal within a relative tolerance of 1e-9; school arithmetic never gets near it. */
export function close(p: number, q: number): boolean {
  return Math.abs(p - q) <= EPSILON * Math.max(1, Math.abs(p), Math.abs(q));
}

export function sameSolutions(p: SolutionSet, q: SolutionSet): boolean {
  if (p.kind === 'point' && q.kind === 'point') return close(p.value, q.value);
  if (p.kind === 'ray' && q.kind === 'ray') {
    return close(p.bound, q.bound) && p.side === q.side && p.strict === q.strict;
  }
  return p.kind === q.kind;
}

/** The solution set of a·x + b (relation) 0. */
export function solveLinear(relation: Relation, a: number, b: number): SolutionSet {
  if (close(a, 0)) {
    const holds =
      relation === 'Equal'
        ? close(b, 0)
        : relation === 'Less'
          ? b < 0 && !close(b, 0)
          : b < 0 || close(b, 0);
    return holds ? { kind: 'all' } : { kind: 'none' };
  }
  const root = -b / a;
  if (relation === 'Equal') return { kind: 'point', value: root };
  // a > 0: a·x + b < 0 means x < root. a < 0 turns the inequality around.
  return { kind: 'ray', bound: root, side: a > 0 ? 'below' : 'above', strict: relation === 'Less' };
}
