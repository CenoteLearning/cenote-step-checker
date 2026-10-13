// Discovery round 2: nothing is scripted. Each session gets one random problem
// per level, easiest first, so mistakes spread across all problems and no one
// starts on the hardest.

import { PROBLEMS, type Problem } from './problems';

export const LEVELS = [1, 2, 3] as const;

/**
 * Pick `count` problems, one per level from the easiest. Pass `random` in
 * tests; the app uses Math.random.
 */
export function randomSession(count = 2, random: () => number = Math.random): Problem[] {
  return LEVELS.slice(0, count).map((level) => {
    const pool = PROBLEMS.filter((p) => p.minSteps === level);
    const problem = pool[Math.floor(random() * pool.length)];
    if (!problem) throw new Error(`No problems at level ${level}`);
    return problem;
  });
}
