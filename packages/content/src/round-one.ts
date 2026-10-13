// Discovery round 1: six controlled paths for expert testers.
//
// Every tester follows one fixed path: 3 mistakes to make on purpose, 2 unusual
// but correct steps (to catch false alarms), then free play. Paths 1-3 cover
// every rule once; paths 4-6 cover every rule again in new pairs. Each item
// starts from its problem; `example` is what a tester will typically write.

import type { RuleId } from '@cenote/checker';

export type PathItem =
  | {
      kind: 'mistake';
      problemId: string;
      instruction: string;
      example: string;
      expectRule: RuleId;
    }
  | {
      kind: 'correct';
      problemId: string;
      instruction: string;
      example: string;
      expectVerdict: 'valid' | 'solved';
    }
  | { kind: 'free'; instruction: string };

export interface TestPath {
  id: number;
  items: readonly PathItem[];
}

const FREE: PathItem = {
  kind: 'free',
  instruction: 'Free play, 2 minutes: try anything you think might break it.',
};

export const PATHS: readonly TestPath[] = [
  {
    id: 1,
    items: [
      {
        kind: 'correct',
        problemId: 'e01',
        instruction: 'Correct step: write the answer as a decimal.',
        example: 'x=0.6',
        expectVerdict: 'solved',
      },
      {
        kind: 'mistake',
        problemId: 'e04',
        instruction: 'Move the 4 to the other side, but keep it as +4.',
        example: '2x=14',
        expectRule: 'sign-move',
      },
      {
        kind: 'mistake',
        problemId: 'e01',
        instruction: 'Divide 5 by 3 instead of 3 by 5.',
        example: 'x=\\frac{5}{3}',
        expectRule: 'divide-wrong-way',
      },
      {
        kind: 'correct',
        problemId: 'i02',
        instruction: 'Correct step: solve it and write x on the right.',
        example: '-3<x',
        expectVerdict: 'solved',
      },
      {
        kind: 'mistake',
        problemId: 'i02',
        instruction: "Divide both sides by -2, but don't turn the < around.",
        example: 'x<-3',
        expectRule: 'flip-direction',
      },
      FREE,
    ],
  },
  {
    id: 2,
    items: [
      {
        kind: 'correct',
        problemId: 'e07',
        instruction: 'Correct step: jump straight to the answer.',
        example: 'x=8',
        expectVerdict: 'solved',
      },
      {
        kind: 'mistake',
        problemId: 'e03',
        instruction: 'Take the 9 away from the left side only.',
        example: 'x=4',
        expectRule: 'one-side',
      },
      {
        kind: 'mistake',
        problemId: 'e08',
        instruction: 'Multiply out the bracket, but only multiply the x by 4.',
        example: '4x+2=20',
        expectRule: 'bracket-first-term',
      },
      {
        kind: 'correct',
        problemId: 'e12',
        instruction: 'Correct step: subtract 2 from both sides.',
        example: '\\frac{x}{3}=3',
        expectVerdict: 'valid',
      },
      {
        kind: 'mistake',
        problemId: 'i01',
        instruction: 'Divide by 2, but write ≤ instead of <.',
        example: 'x\\le 3',
        expectRule: 'strictness-changed',
      },
      FREE,
    ],
  },
  {
    id: 3,
    items: [
      {
        kind: 'correct',
        problemId: 'e10',
        instruction: 'Correct step: remove the bracket.',
        example: '-x+3=5',
        expectVerdict: 'valid',
      },
      {
        kind: 'mistake',
        problemId: 'e05',
        instruction: 'Divide by 3, but only divide the 3x and the right side.',
        example: 'x-7=\\frac{11}{3}',
        expectRule: 'divide-one-term',
      },
      {
        kind: 'mistake',
        problemId: 'e02',
        instruction: 'Get x alone by subtracting 7 instead of dividing.',
        example: 'x=-28',
        expectRule: 'subtract-coefficient',
      },
      {
        kind: 'correct',
        problemId: 'i06',
        instruction: 'Correct step: subtract 4 from both sides.',
        example: '-x>3',
        expectVerdict: 'valid',
      },
      {
        kind: 'mistake',
        problemId: 'i04',
        instruction: 'Solve it, but write the answer with = instead of >.',
        example: 'x=4',
        expectRule: 'equals-for-inequality',
      },
      FREE,
    ],
  },
  {
    id: 4,
    items: [
      {
        kind: 'correct',
        problemId: 'e01',
        instruction: 'Correct step: solve it and write x on the right.',
        example: '\\frac{3}{5}=x',
        expectVerdict: 'solved',
      },
      {
        kind: 'mistake',
        problemId: 'e09',
        instruction: 'Move the 2x to the left side, but keep it as +2x.',
        example: '7x+3=-9',
        expectRule: 'sign-move',
      },
      {
        kind: 'mistake',
        problemId: 'e10',
        instruction: 'Remove the bracket, but only change the sign of x.',
        example: '-x-3=5',
        expectRule: 'bracket-first-term',
      },
      {
        kind: 'correct',
        problemId: 'i05',
        instruction: 'Correct step: subtract 1 from both sides.',
        example: '-3x\\le 9',
        expectVerdict: 'valid',
      },
      {
        kind: 'mistake',
        problemId: 'i08',
        instruction: 'Solve it, but write the answer with = instead of <.',
        example: 'x=4',
        expectRule: 'equals-for-inequality',
      },
      FREE,
    ],
  },
  {
    id: 5,
    items: [
      {
        kind: 'correct',
        problemId: 'e09',
        instruction: 'Correct step: subtract 2x from both sides.',
        example: '3x+3=-9',
        expectVerdict: 'valid',
      },
      {
        kind: 'mistake',
        problemId: 'i08',
        instruction: 'Take the 3x away from the right side only.',
        example: '5x-2<6',
        expectRule: 'one-side',
      },
      {
        kind: 'mistake',
        problemId: 'e01',
        instruction: 'Get x alone by subtracting 5 instead of dividing.',
        example: 'x=-2',
        expectRule: 'subtract-coefficient',
      },
      {
        kind: 'correct',
        problemId: 'i03',
        instruction: 'Correct step: subtract 5 from both sides.',
        example: 'x\\ge -3',
        expectVerdict: 'solved',
      },
      {
        kind: 'mistake',
        problemId: 'i05',
        instruction: "Solve it, but when you divide by -3, don't turn the ≤ around.",
        example: 'x\\le -3',
        expectRule: 'flip-direction',
      },
      FREE,
    ],
  },
  {
    id: 6,
    items: [
      {
        kind: 'correct',
        problemId: 'i07',
        instruction: 'Correct step: multiply out the bracket.',
        example: '2x+2\\ge 3x-4',
        expectVerdict: 'valid',
      },
      {
        kind: 'mistake',
        problemId: 'e04',
        instruction: 'Divide by 2, but only divide the 2x and the right side.',
        example: 'x+4=5',
        expectRule: 'divide-one-term',
      },
      {
        kind: 'mistake',
        problemId: 'e02',
        instruction: 'Divide 7 by -21 instead of -21 by 7.',
        example: 'x=-\\frac{1}{3}',
        expectRule: 'divide-wrong-way',
      },
      {
        kind: 'correct',
        problemId: 'i02',
        instruction: 'Correct step: divide by -2 and turn the sign around.',
        example: 'x>-3',
        expectVerdict: 'solved',
      },
      {
        kind: 'mistake',
        problemId: 'i03',
        instruction: 'Move the 5 across correctly, but write > instead of ≥.',
        example: 'x>-3',
        expectRule: 'strictness-changed',
      },
      FREE,
    ],
  },
];

/** Hand paths out in order: the n-th tester (counting from 0) gets path n mod 6 + 1. */
export function pathForTester(n: number): TestPath {
  const path = PATHS[((n % PATHS.length) + PATHS.length) % PATHS.length];
  if (!path) throw new Error('No paths defined');
  return path;
}

/** Open questions asked after each item: discovery, not scores. */
export const QUESTIONS: Readonly<Record<PathItem['kind'] | 'end', readonly string[]>> = {
  mistake: [
    'Did it read your handwriting correctly?',
    'Was the verdict right?',
    'What did you expect to happen?',
    'What would you write instead of this hint?',
  ],
  correct: ['Did it read and accept your step?', 'Anything that surprised you?'],
  free: ['What did you try, and what happened?'],
  end: ["Where would someone learning this get stuck that the app doesn't handle?"],
};
