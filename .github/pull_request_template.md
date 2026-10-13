## What and why

<!-- One or two sentences: the change, and the problem it solves. -->

## How to test

<!-- Steps a reviewer can follow, or the tests that cover it. -->

## Checklist

- [ ] One focused change, about 400 changed lines or fewer
- [ ] Tests cover the behaviour change and fail without it
- [ ] `npm run verify` passes
- [ ] Step correctness is still decided by code, never by a model
- [ ] No identifying learner data is stored or logged; the privacy note names any new data leaving our servers
- [ ] No secrets; new configuration is documented in `.env.example`
