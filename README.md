# Cenote

Step-by-step feedback for solving linear equations and inequalities by hand.
A learner writes one step per line; code checks whether each step keeps the
same solutions, and names the likely mistake when it doesn't.

**Status:** v1, built for discovery round 1. Not ready for learners yet.

## Repository layout

| Path               | What it is                                                                   |
| ------------------ | ---------------------------------------------------------------------------- |
| `packages/checker` | The engine: reads a step, compares solution sets, names likely mistakes      |
| `packages/content` | The 20 starter problems, round 1 tester paths and the round 2 problem picker |
| `apps/` (to come)  | The API and the handwriting web app                                          |

Step correctness is always decided by code in `packages/checker`. Handwriting
recognition only reads what the learner wrote.

## Development

Requires Node 22 (see `.nvmrc`).

```sh
npm ci                                # install exact versions from the lockfile
git config core.hooksPath .githooks   # commit-msg and pre-push hooks
npm run verify                        # typecheck, lint, format check, tests
```

`npm run format` fixes formatting.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
