# Risk Register

| Risk | Level | Mitigation |
| --- | --- | --- |
| Local evidence can become stale after a new commit | Medium | Run `verify-local-validation-current.mjs` against the reviewed HEAD. |
| Users may confuse generated layouts with build approval | Medium | Generator docs, warnings, and audit non-claims state draft-only status. |
| Browser behavior lacks automation | Medium | Follow-up Playwright and screenshot gates. |
| Compile adapter may be overread as a graph compiler | High | Docs and result types list unsupported features explicitly. |
