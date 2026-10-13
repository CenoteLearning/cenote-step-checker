# Contributing

`main` is always releasable. Nothing lands on it without passing checks and
a review.

## Setup

```sh
git config core.hooksPath .githooks   # once per clone
```

## Workflow

1. Branch from an up-to-date `main`: `<type>/<short-name>`, for example
   `feat/checker-bug-library` or `fix/inequality-flip`.
2. Make small commits, each one logical change that builds and passes its
   tests on its own.
3. Write commit subjects in [Conventional Commits](https://www.conventionalcommits.org)
   form: `type(scope): summary`, 72 characters at most. The `commit-msg`
   hook checks this.
   - Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`,
     `ci`, `chore`, `style`, `revert`.
   - Scopes: the package or app touched, such as `checker`, `api`, `web`.
4. Open a pull request into `main`. Keep it under about 400 changed lines;
   split anything larger.
5. Merge only when CI is green and one reviewer has approved. Use a merge
   commit so the branch's small commits stay readable. Delete the branch
   after merging.

## What a reviewer checks

- **Correctness:** behaviour changes come with tests that would fail
  without the change.
- **Scope:** the PR does one thing; unrelated cleanups go in their own PR.
- **Checker invariant:** correctness of a step is decided by code, never by
  a model. Handwriting recognition may only read.
- **Learner data:** nothing identifying is stored or logged. Steps and
  sessions stay anonymous; any new data leaving our servers is named in
  the privacy note.
- **Secrets:** no keys or tokens in code, tests or logs. Config comes from
  environment variables, documented in `.env.example`.
- **Readability:** names say what things are; comments say why, not what.
