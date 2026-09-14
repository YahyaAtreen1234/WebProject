#!/usr/bin/env bash
#
# Pull, build and reload StonesLand on the server.
#
#   ./deploy/deploy.sh
#
# Deliberately does NOT run `npm run build`, which is wired to
# `prisma db push && prisma db seed` and would alter the live database on every
# deploy. Schema changes are applied on purpose with `npm run db:push`, not as a
# side effect of shipping code.

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BRANCH="${BRANCH:-main}"
PM2_APP="${PM2_APP:-stonesland}"

cd "$APP_DIR"

echo "==> Deploying ${PM2_APP} from ${BRANCH}"

if [ ! -f .env.production ]; then
  echo "ERROR: .env.production is missing. Refusing to deploy without it." >&2
  exit 1
fi

echo "==> Fetching"
git fetch --quiet origin "$BRANCH"

PREVIOUS="$(git rev-parse HEAD)"
git reset --hard "origin/${BRANCH}"
echo "    ${PREVIOUS:0:8} -> $(git rev-parse --short HEAD)"

echo "==> Installing dependencies"
# `npm ci` installs exactly the lockfile, including devDependencies, which the
# build needs (typescript, tailwind, postcss, prisma CLI).
npm ci --no-audit --no-fund

echo "==> Building"
if ! npm run build:production; then
  echo "ERROR: build failed. Rolling back to ${PREVIOUS:0:8}; the running" >&2
  echo "       process was never touched, so the site stayed up." >&2
  git reset --hard "$PREVIOUS"
  npm ci --no-audit --no-fund
  exit 1
fi

echo "==> Reloading"
mkdir -p logs
if pm2 describe "$PM2_APP" > /dev/null 2>&1; then
  pm2 reload "$PM2_APP" --update-env
else
  pm2 start ecosystem.config.js --env production
fi
pm2 save

echo "==> Waiting for the app to answer"
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-3000}/"; then
    echo "==> Deployed: $(git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 1
done

echo "ERROR: app did not respond within 30s. Check: pm2 logs ${PM2_APP}" >&2
exit 1
