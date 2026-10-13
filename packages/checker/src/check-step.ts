import { analyse } from './analyse';
import { sameSolutions, type SolutionSet } from './solution-set';

export type Verdict = 'solved' | 'valid' | 'invalid' | 'unsupported' | 'unreadable';

export interface StepResult {
  verdict: Verdict;
  /** The step's own solution set, when it could be read. */
  solutions?: SolutionSet;
}

/**
 * Check a learner's step against the previous accepted step, or against the
 * problem for the first step. A step is correct when it keeps the solution
 * set; it is solved when it is also in answer form, such as x = 3/5.
 *
 * Throws when the previous step can't be read: that is a bug in the caller,
 * not a learner's mistake.
 */
export function checkStep(previousLatex: string, stepLatex: string): StepResult {
  const previous = analyse(previousLatex);
  if (!previous.ok) throw new Error(`Previous step is not a valid problem: ${previousLatex}`);

  const current = analyse(stepLatex);
  if (!current.ok) return { verdict: current.verdict };

  const { solutions, isAnswerForm } = current.step;
  if (!sameSolutions(previous.step.solutions, solutions)) return { verdict: 'invalid', solutions };
  return { verdict: isAnswerForm ? 'solved' : 'valid', solutions };
}
