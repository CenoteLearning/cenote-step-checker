// The bug library: nine common mistakes, each a wrong version of an allowed
// operation. When a step is invalid, each mistake is replayed on the previous
// step; the first one that produces the learner's solution set names the
// mistake and picks its hint. Hints are questions; they never give the answer.

import type { Expression, ExpressionInput } from '@cortex-js/compute-engine';
import {
  analyseExpression,
  containsX,
  engine,
  linearCoefficients,
  operandsOf,
  type Step,
} from './analyse';
import { close, sameSolutions, type Relation } from './solution-set';

export type RuleId =
  | 'equals-for-inequality'
  | 'flip-direction'
  | 'strictness-changed'
  | 'bracket-first-term'
  | 'divide-wrong-way'
  | 'subtract-coefficient'
  | 'divide-one-term'
  | 'sign-move'
  | 'one-side';

/** Tried in this order; the first match wins. */
export const RULES: readonly RuleId[] = [
  'equals-for-inequality',
  'flip-direction',
  'strictness-changed',
  'bracket-first-term',
  'divide-wrong-way',
  'subtract-coefficient',
  'divide-one-term',
  'sign-move',
  'one-side',
];

export const MESSAGES = {
  'equals-for-inequality': () =>
    'This step turned the inequality into an equation. Keep the inequality sign through every step.',
  'flip-direction': () =>
    'The inequality now points the wrong way. Did you multiply or divide both sides by a negative number? Only then does it turn around.',
  'strictness-changed': () =>
    'Check the sign: did < become ≤, or the other way round? Whether the boundary is included should not change.',
  'bracket-first-term': (k: string) =>
    `It looks like ${k} only multiplied the first term in the bracket. Which terms should ${k} multiply?`,
  'divide-wrong-way': (k: string, c: string) =>
    `It looks like you divided ${k} by ${c} instead of ${c} by ${k}. Which number should be divided by which?`,
  'subtract-coefficient': (k: string) =>
    `It looks like you subtracted ${k} instead of dividing by it. ${k}x means ${k} times x, so what undoes multiplying?`,
  'divide-one-term': (k: string) =>
    `It looks like only some terms were divided by ${k}. When you divide, which terms on each side need dividing?`,
  'sign-move': (term: string, relation: string) =>
    `It looks like ${term} moved to the other side but kept its sign. What should happen to its sign when it moves across the ${relation}?`,
  'one-side': (term: string) =>
    `It looks like ${term} was taken away from one side only. What do you need to do to the other side?`,
} satisfies Record<RuleId, (...args: string[]) => string>;

export const UNMATCHED_MESSAGE =
  'This step changed the answer. Look at what you did to each side and try again.';

export interface Feedback {
  rule: RuleId | 'unmatched';
  message: string;
}

/** A wrong next step, built by replaying one rule on the previous step. */
export interface Candidate {
  rule: RuleId;
  message: string;
  expr: Expression;
}

const relationSymbol = (relation: Relation) =>
  relation === 'Equal' ? '=' : relation === 'Less' ? '<' : '≤';

const isWholeNumber = (n: number) => close(n, Math.round(n));

/** 0.6 becomes "3/5" and 4 becomes "4": numbers as a learner would write them. */
export function formatNumber(n: number): string {
  if (isWholeNumber(n)) return String(Math.round(n));
  for (let d = 2; d <= 100; d++) {
    if (isWholeNumber(n * d)) return `${Math.round(n * d)}/${d}`;
  }
  return String(Number(n.toFixed(4)));
}

const termsOf = (side: Expression): Expression[] =>
  side.operator === 'Add' ? [...operandsOf(side)] : [side];

/** The coefficient k of a term k·x with no constant part, or null. */
function xCoefficient(term: Expression): number | null {
  if (!containsX(term)) return null;
  const f = linearCoefficients(term);
  if (!f || !close(f.b, 0) || close(f.a, 0)) return null;
  return f.a;
}

/** A bracket term k(p + q + …) or -(p + q + …), split into k and the bracket. */
function bracketOf(term: Expression): { k: Expression; inner: Expression } | null {
  const [first, second, ...extra] = operandsOf(term);
  if (term.operator === 'Negate' && first?.operator === 'Add') {
    return { k: engine.box(-1), inner: first };
  }
  if (term.operator !== 'Multiply' || !first || !second || extra.length > 0) return null;
  if (!containsX(first) && second.operator === 'Add') return { k: first, inner: second };
  if (!containsX(second) && first.operator === 'Add') return { k: second, inner: first };
  return null;
}

/** Every wrong next step the rules can build from `previous`. */
export function buggyCandidates(previous: Step): Candidate[] {
  const out: Candidate[] = [];
  const sides = [
    { side: previous.lhs, other: previous.rhs, left: true },
    { side: previous.rhs, other: previous.lhs, left: false },
  ];
  const rebuild = (left: boolean, side: ExpressionInput, other: ExpressionInput): Expression =>
    engine.box(left ? [previous.relation, side, other] : [previous.relation, other, side]);

  for (const { side, other, left } of sides) {
    const terms = termsOf(side);

    // bracket-first-term: k(p + q + …) becomes k·p + q + …
    terms.forEach((term, i) => {
      const bracket = bracketOf(term);
      const [first, ...rest] = bracket ? operandsOf(bracket.inner) : [];
      if (!bracket || !first) return;
      const wrongTerm = engine.box(['Add', ['Multiply', bracket.k, first], ...rest]);
      const newSide = engine.box(['Add', ...terms.map((t, j) => (j === i ? wrongTerm : t))]);
      out.push({
        rule: 'bracket-first-term',
        message: MESSAGES['bracket-first-term'](bracket.k.latex),
        expr: rebuild(left, newSide, other),
      });
    });

    // divide-wrong-way and subtract-coefficient: k·x (rel) c, with whole-number |k| ≥ 2
    const k = terms.length === 1 ? xCoefficient(side) : null;
    if (k !== null && isWholeNumber(k) && Math.abs(k) >= 2 && !containsX(other)) {
      const c = other.N().re;
      if (Number.isFinite(c) && !close(c, 0)) {
        out.push({
          rule: 'divide-wrong-way',
          message: MESSAGES['divide-wrong-way'](formatNumber(k), formatNumber(c)),
          expr: rebuild(left, 'x', engine.box(k / c)),
        });
      }
      if (Number.isFinite(c)) {
        out.push({
          rule: 'subtract-coefficient',
          message: MESSAGES['subtract-coefficient'](formatNumber(k)),
          expr: rebuild(left, 'x', engine.box(c - k)),
        });
      }
    }

    if (terms.length < 2) continue;

    // divide-one-term: k·x + b = c becomes x + b = c/k
    terms.forEach((term, i) => {
      const kt = xCoefficient(term);
      if (kt === null || !isWholeNumber(kt) || Math.abs(kt) < 2) return;
      const newSide = engine.box(['Add', ...terms.map((t, j) => (j === i ? 'x' : t))]);
      out.push({
        rule: 'divide-one-term',
        message: MESSAGES['divide-one-term'](formatNumber(kt)),
        expr: rebuild(left, newSide, engine.box(['Divide', other, kt])),
      });
    });

    // sign-move and one-side: a term leaves this side
    for (const term of terms) {
      const without = engine.box(['Subtract', side, term]);
      out.push({
        rule: 'sign-move',
        message: MESSAGES['sign-move'](term.latex, relationSymbol(previous.relation)),
        expr: rebuild(left, without, engine.box(['Add', other, term])),
      });
      out.push({
        rule: 'one-side',
        message: MESSAGES['one-side'](term.latex),
        expr: rebuild(left, without, other),
      });
    }
  }
  return out;
}

/** Name the likely mistake behind an invalid step, or 'unmatched'. */
export function diagnose(previous: Step, current: Step): Feedback {
  const before = previous.solutions;
  const after = current.solutions;

  // Inequality rules read straight off the two solution sets.
  if (before.kind === 'ray') {
    if (after.kind === 'point' && close(after.value, before.bound)) {
      return { rule: 'equals-for-inequality', message: MESSAGES['equals-for-inequality']() };
    }
    if (after.kind === 'ray' && close(after.bound, before.bound)) {
      if (after.side !== before.side && after.strict === before.strict) {
        return { rule: 'flip-direction', message: MESSAGES['flip-direction']() };
      }
      if (after.side === before.side && after.strict !== before.strict) {
        return { rule: 'strictness-changed', message: MESSAGES['strictness-changed']() };
      }
    }
  }

  // The others: replay each wrong operation and compare.
  const candidates = buggyCandidates(previous);
  for (const rule of RULES) {
    for (const candidate of candidates) {
      if (candidate.rule !== rule) continue;
      const replayed = analyseExpression(candidate.expr);
      // A replay that keeps the solutions isn't a mistake on this step.
      if (!replayed.ok || sameSolutions(replayed.step.solutions, before)) continue;
      if (sameSolutions(replayed.step.solutions, after))
        return { rule, message: candidate.message };
    }
  }
  return { rule: 'unmatched', message: UNMATCHED_MESSAGE };
}
