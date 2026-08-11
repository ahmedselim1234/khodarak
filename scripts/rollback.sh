#!/usr/bin/env bash
# scripts/rollback.sh <previous-image-tag>
# Per specs/010-phase-9-hardening-launch/contracts/deploy-and-rollback.md.
# Identical mechanism to deploy.sh, called with the previous known-good
# tag instead of a new one — rollback and deploy are the same underlying
# action (research.md §3). The caller supplies the tag explicitly (this
# project's own CI run history and the registry's own tag list are the
# authoritative sources for "what was previously running") rather than
# this script guessing.
set -euo pipefail

PREVIOUS_IMAGE_TAG="${1:?Usage: rollback.sh <previous-image-tag>}"

echo "Rolling back to image tag: ${PREVIOUS_IMAGE_TAG}"
exec "$(dirname "$0")/deploy.sh" "${PREVIOUS_IMAGE_TAG}"
