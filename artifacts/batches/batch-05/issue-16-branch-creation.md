# Issue 16 Branch Creation Proof

## Objective
Create `staging` from current `main` and confirm branch authority chain.

## Commands and Results

```powershell
git rev-parse main
# ed51496b3a37d9a8094d6ad2a7c4f13d3bb21488

git branch -f staging main
# (no output; local staging set to main)

git push -u origin staging
# branch 'staging' set up to track 'origin/staging'
# [new branch] staging -> staging

git rev-parse staging
# ed51496b3a37d9a8094d6ad2a7c4f13d3bb21488

git rev-parse origin/staging
# ed51496b3a37d9a8094d6ad2a7c4f13d3bb21488

git branch -vv
# develop 7004e16 [origin/develop] ...
# main    ed51496 [origin/main] ...
# staging ed51496 [origin/staging] ...
```

## Verification

- `staging` exists on `origin`.
- `staging` equals the selected `main` starting point SHA (`ed51496...`).
- Promotion chain for governance docs: `develop` -> `staging` -> `main`.
