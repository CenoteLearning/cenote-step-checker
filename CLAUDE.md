# Cenote step checker

Step-by-step feedback for solving linear equations and inequalities by hand.
The learner writes one step per line; code checks whether each step keeps the
solution set and, when it doesn't, names the likely mistake with a hint.

## Where the project stands

- v1 serves **discovery round 1**: 4 to 6 expert testers (engineers) each
  follow one of six controlled paths. v2 serves **discovery round 2**:
  in-person, 5-minute sessions at Spanish universities on an iPad with a pen,
  with random problems and a take-home QR link.
- Both rounds are discovery in a double diamond: the app is a probe for
  learning about the problem. Define comes after round 2; don't treat the bug
  library, hints or handwriting as settled product decisions.
- Built so far: `packages/checker` and `packages/content`, with tests, CI and
  branch protection. No app yet.

## Rules that don't bend

- **Step correctness is decided by code** in `packages/checker`, never by a
  model. Handwriting recognition only reads ink into LaTeX.
- **No AI in the app in v1.** AI may come later only as an experiment that has
  to beat the rule-based baseline (for example, explanations for unmatched
  mistakes).
- **Learners stay anonymous.** No names, emails or accounts in v1. Anything that
  leaves our servers (handwriting to the reader, errors to Sentry) is named in
  the privacy note. Some round 2 students may be 17.
- **Hints are questions** that point at the mistake. They never give the answer.

## How we work

Act as a senior developer on an 8-person team guarding what reaches `main`.

- Never commit to `main`. Branch from an up-to-date `main` as
  `<type>/<short-name>`, make small commits that each pass on their own, and
  open a pull request of about 400 changed lines or fewer.
- Commit subjects follow Conventional Commits (`feat(checker): …`); the
  `commit-msg` hook rejects anything else. Scopes: `checker`, `content`, `api`,
  `web`.
- `npm run verify` (typecheck, lint, format check, tests) must pass before
  pushing; the `pre-push` hook runs it. CI runs the same command as the
  required `Verify` check.
- Merge with a merge commit once CI is green. Review the full diff first
  against the checklist in `CONTRIBUTING.md`.
- Every behaviour change ships with tests that fail without it.
- Hooks need `git config core.hooksPath .githooks` once per clone.

## Code conventions

- npm workspaces: `packages/*` and `apps/*`. Internal packages export their
  TypeScript source (`"exports": { ".": "./src/index.ts" }`); no build step.
- Strict TypeScript with `noUncheckedIndexedAccess` and
  `verbatimModuleSyntax`: use `import type`, and guard indexed access instead of
  using `!`.
- TypeScript is pinned to `~6.0`: typescript-eslint supports versions below
  6.1. Don't move to 7 until it does, and never install with
  `--legacy-peer-deps`.
- Vitest tests sit next to the code as `*.test.ts`. Prefer `it.each` tables
  for cases.
- Prettier owns formatting (single quotes, width 100). Run `npm run format`.

## Domain notes

- A step is **valid** when it keeps the previous accepted step's solution set
  (a point, a ray, every number or none), and **solved** when it is also in
  answer form, such as `x = 3/5` or `-3 < x`.
- `@cortex-js/compute-engine` parses LaTeX and rewrites `>` and `≥` as `<` and
  `≤` with the sides swapped, so the checker handles three relations.
- Linearity is checked at x = 0, 1, 2, -3 and 0.5. Values compare with a
  relative tolerance of 1e-9.
- The bug library has 9 rules tried in the order of `RULES`; the first match
  wins. Inequality rules read the two solution sets; the others replay a wrong
  operation on the previous step.
- Round 1 paths: 6 paths of 3 scripted mistakes, 2 unusual correct steps and
  free play. Paths 1 to 3 and 4 to 6 each cover all 9 rules, and tests enforce
  it. Round 2 draws one random problem per level, easiest first.

## Next up

1. **Reading test:** write 20 steps from the starter problems by hand and run
   them through MyScript and Mathpix. Pick the reader with more lines right on
   the first try.
2. **`apps/api`:** Fastify, Postgres with Drizzle migrations, and
   `POST /api/steps`, which stores the step as read, whether the learner fixed
   the reading, the verdict and the matched rule.
3. **`apps/web`:** React and Vite with a pen canvas, one step per line, the
   typeset reading with tap-to-fix, ticks and crosses, and hints with a
   thumbs-up or thumbs-down. Typing stays only as a fallback.
4. **Round 1 flow:** shared link, the next unused path per tester, open
   questions after each item.
5. **Deploy:** a VPS with Docker Compose and Caddy, deployment from GitHub
   Actions, Sentry and an uptime monitor.
