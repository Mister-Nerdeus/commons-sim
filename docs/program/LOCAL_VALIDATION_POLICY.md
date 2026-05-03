# Local Validation Policy

## Intent

GitHub Actions is not a release or audit gate for this repository. Required validation is performed locally and recorded as versioned evidence.

## Canonical Local Gate

The canonical local validation map is `artifacts/controls/local-required-check-map.json`.

Release-grade local validation:

```powershell
docker build -f Dockerfile.local-validation -t commons-sim:local-validation .
```

Transcript-producing local validation:

```powershell
node scripts/controls/run-local-validation.mjs --operator <name> --include-docker
```

The script writes `artifacts/controls/local-validation/latest.json`. The Docker validation image is authoritative when the host workstation does not run Node `20.19.0`.

## Branch Protection Contract

Protected branches require pull requests, review, conversation resolution, admin enforcement, no force pushes, and no branch deletion. They do not require GitHub status checks, because local validation artifacts are the control evidence.

Release and promotion reviewers must inspect the local validation artifact before approval.

## Required Runtime

- Node: `20.19.0`
- pnpm: `9.0.0`
- Install integrity: `pnpm install --frozen-lockfile`

If local validation runs under another Node major, the evidence is acceptable only for development feedback. Release approval requires Node `20.19.0` or a documented exception.
