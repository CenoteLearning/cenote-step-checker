// Public API of @cenote/checker.
export { analyse } from './analyse';
export type { Analysis, Step } from './analyse';
export { RULES, UNMATCHED_MESSAGE } from './bug-library';
export type { Feedback, RuleId } from './bug-library';
export { checkStep } from './check-step';
export type { StepResult, Verdict } from './check-step';
export { sameSolutions, solveLinear } from './solution-set';
export type { Relation, SolutionSet } from './solution-set';
