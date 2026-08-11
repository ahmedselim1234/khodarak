#!/usr/bin/env bash
# scripts/deploy.sh <image-tag>
# Per specs/010-phase-9-hardening-launch/contracts/deploy-and-rollback.md.
# Run on the production host, in the directory containing
# docker-compose.prod.yml. Pulls and runs the given, already-built image
# tag — never builds one itself, which is what keeps this fast enough to
# also serve as rollback.sh's own mechanism.
set -euo pipefail

IMAGE_TAG="${1:?Usage: deploy.sh <image-tag>}"
COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_URL="http://localhost:3000/api/health"
HEALTH_TIMEOUT_SECONDS=60

echo "Deploying image tag: ${IMAGE_TAG}"
echo "IMAGE_TAG=${IMAGE_TAG}" > .env.deploy

docker compose --env-file .env.deploy -f "${COMPOSE_FILE}" pull
docker compose --env-file .env.deploy -f "${COMPOSE_FILE}" up -d

echo "Waiting for ${HEALTH_URL} to report healthy (timeout ${HEALTH_TIMEOUT_SECONDS}s)..."
elapsed=0
until curl --fail --silent --output /dev/null "${HEALTH_URL}"; do
  if [ "${elapsed}" -ge "${HEALTH_TIMEOUT_SECONDS}" ]; then
    echo "Deploy FAILED: ${HEALTH_URL} did not become healthy within ${HEALTH_TIMEOUT_SECONDS}s" >&2
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

echo "Deploy OK: ${IMAGE_TAG} is running and healthy."
