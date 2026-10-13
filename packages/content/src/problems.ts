import type { RuleId } from '@cenote/checker';

export interface Problem {
  id: string;
  latex: string;
  /** A typical solution length; solving in fewer steps means a jump to the answer. */
  minSteps: number;
  /** Mistakes this problem tends to provoke, used to build tester paths. */
  invites: readonly RuleId[];
}

/** 12 linear equations and 8 linear inequalities. */
export const PROBLEMS: readonly Problem[] = [
  // Equations
  { id: 'e01', latex: '5x=3', minSteps: 1, invites: ['divide-wrong-way', 'subtract-coefficient'] },
  {
    id: 'e02',
    latex: '7x=-21',
    minSteps: 1,
    invites: ['divide-wrong-way', 'subtract-coefficient'],
  },
  { id: 'e03', latex: 'x+9=4', minSteps: 1, invites: ['sign-move', 'one-side'] },
  {
    id: 'e04',
    latex: '2x+4=10',
    minSteps: 2,
    invites: ['sign-move', 'one-side', 'divide-one-term'],
  },
  {
    id: 'e05',
    latex: '3x-7=11',
    minSteps: 2,
    invites: ['sign-move', 'one-side', 'divide-one-term'],
  },
  { id: 'e06', latex: '6-4x=18', minSteps: 2, invites: ['sign-move', 'one-side'] },
  { id: 'e07', latex: '3(x-1)=2x+5', minSteps: 2, invites: ['bracket-first-term', 'sign-move'] },
  { id: 'e08', latex: '4(x+2)=20', minSteps: 2, invites: ['bracket-first-term'] },
  { id: 'e09', latex: '5x+3=2x-9', minSteps: 2, invites: ['sign-move', 'one-side'] },
  { id: 'e10', latex: '-(x-3)=5', minSteps: 2, invites: ['bracket-first-term'] },
  { id: 'e11', latex: '2(3x-1)=4x+6', minSteps: 3, invites: ['bracket-first-term', 'sign-move'] },
  { id: 'e12', latex: '\\frac{x}{3}+2=5', minSteps: 2, invites: ['sign-move', 'one-side'] },
  // Inequalities
  {
    id: 'i01',
    latex: '2x<6',
    minSteps: 1,
    invites: ['flip-direction', 'strictness-changed', 'equals-for-inequality'],
  },
  { id: 'i02', latex: '-2x<6', minSteps: 1, invites: ['flip-direction'] },
  { id: 'i03', latex: 'x+5\\ge 2', minSteps: 1, invites: ['sign-move', 'strictness-changed'] },
  { id: 'i04', latex: '3x-4>8', minSteps: 2, invites: ['sign-move', 'divide-one-term'] },
  { id: 'i05', latex: '-3x+1\\le 10', minSteps: 2, invites: ['flip-direction', 'sign-move'] },
  { id: 'i06', latex: '4-x>7', minSteps: 2, invites: ['flip-direction', 'sign-move'] },
  {
    id: 'i07',
    latex: '2(x+1)\\ge 3x-4',
    minSteps: 3,
    invites: ['bracket-first-term', 'flip-direction'],
  },
  { id: 'i08', latex: '5x-2<3x+6', minSteps: 2, invites: ['sign-move', 'one-side'] },
];

export function problemById(id: string): Problem {
  const problem = PROBLEMS.find((p) => p.id === id);
  if (!problem) throw new Error(`Unknown problem ${id}`);
  return problem;
}
