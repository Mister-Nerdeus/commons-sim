# Environment Topology

## Branch to Environment Mapping

This project uses one primary environment per authority branch:

| Branch | Environment | Authority Level | Intent |
|---|---|---|---|
| `develop` | `dev` | non-production | rapid integration and validation |
| `staging` | `staging` | pre-production | release-candidate verification |
| `main` | `production` | production | live release authority |

## Ambiguity Ban

- `develop` deploys only to `dev`.
- `staging` deploys only to `staging`.
- `main` deploys only to `production`.
- No branch may deploy to multiple authority environments by default.
- Any temporary exception must be documented with owner, scope, and expiration.

## Promotion Context

Environment progression follows branch progression:

1. Validate in `dev` from `develop`.
2. Promote candidate to `staging` from `staging`.
3. Release to `production` from `main`.

The branch topology in [BRANCH_TOPOLOGY.md](./BRANCH_TOPOLOGY.md) is the controlling source for promotion authority.
