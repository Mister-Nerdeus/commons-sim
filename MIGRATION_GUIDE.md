# Migration Guide (move to a new GitHub project)

## Option A: Move with full history
1) Create the new GitHub repository (empty).
2) In your local repo:
   - `git remote add neworigin <NEW_REPO_URL>`
   - `git push neworigin main`

## Option B: Fresh start (recommended for a public launch)
1) Create the new GitHub repository (empty).
2) In your local repo:
   - `git checkout --orphan clean-main`
   - `git add -A`
   - `git commit -m "Initial public release"`
   - `git branch -M main`
   - `git remote add neworigin <NEW_REPO_URL>`
   - `git push -f neworigin main`

## After pushing
- Enable GitHub Pages (Settings → Pages → GitHub Actions)
- Protect `main` (require CI to pass)
