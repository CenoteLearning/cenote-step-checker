// Reading one step: LaTeX in, solution set out. Only this module and the bug
// library touch the compute engine.

import { ComputeEngine, isFunction, isSymbol } from '@cortex-js/compute-engine';
import type { Expression } from '@cortex-js/compute-engine';
import { close, RELATIONS, solveLinear, type Relation, type SolutionSet } from './solution-set';

export const engine = new ComputeEngine();

/** Operands of a function expression such as Add(2x, 4); empty for numbers and symbols. */
export const operandsOf = (e: Expression): readonly Expression[] => (isFunction(e) ? e.ops : []);

export const containsX = (e: Expression): boolean => (e.unknowns ?? []).includes('x');

/**
 * Coefficients of a·x + b, or null when the expression is not linear in x.
 * Reads a and b from the values at 0 and 1, then checks three more points,
 * which rejects x², |x| and 1/x.
 */
export function linearCoefficients(e: Expression): { a: number; b: number } | null {
  const at = (x: number) => e.subs({ x }).N().re;
  const f0 = at(0);
  const f1 = at(1);
  if (!Number.isFinite(f0) || !Number.isFinite(f1)) return null;
  const a = f1 - f0;
  const b = f0;
  for (const x of [2, -3, 0.5]) {
    const fx = at(x);
    if (!Number.isFinite(fx) || !close(fx, a * x + b)) return null;
  }
  return { a, b };
}

/** One step, read and solved. */
export interface Step {
  relation: Relation;
  lhs: Expression;
  rhs: Expression;
  solutions: SolutionSet;
  /** x alone on one side and a number on the other: x = c, x < c, c ≤ x, … */
  isAnswerForm: boolean;
}

export type Analysis =
  { ok: true; step: Step } | { ok: false; verdict: 'unsupported' | 'unreadable' };

const isRelation = (operator: string): operator is Relation =>
  (RELATIONS as readonly string[]).includes(operator);

export function analyseExpression(expr: Expression | null): Analysis {
  const relation = expr?.isValid ? expr.operator : undefined;
  if (!expr || !relation || !isRelation(relation)) return { ok: false, verdict: 'unreadable' };

  const [lhs, rhs, ...extra] = operandsOf(expr);
  if (!lhs || !rhs || extra.length > 0) return { ok: false, verdict: 'unreadable' };
  if ((expr.unknowns ?? []).some((u) => u !== 'x')) return { ok: false, verdict: 'unsupported' };

  const f = linearCoefficients(engine.box(['Subtract', lhs, rhs]));
  if (!f) return { ok: false, verdict: 'unsupported' };

  const isX = (e: Expression) => isSymbol(e, 'x');
  const isAnswerForm = (isX(lhs) && !containsX(rhs)) || (isX(rhs) && !containsX(lhs));
  const solutions = solveLinear(relation, f.a, f.b);
  return { ok: true, step: { relation, lhs, rhs, solutions, isAnswerForm } };
}

/** Read a step written in LaTeX, such as `2x+4=10` or `-2x<6`. */
export function analyse(latex: string): Analysis {
  return analyseExpression(engine.parse(latex));
}
