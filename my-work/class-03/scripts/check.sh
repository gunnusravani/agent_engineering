#!/usr/bin/env bash
# One documented command that runs every baseline check.
set -euo pipefail

echo "==> ruff check"
ruff check .

echo "==> pytest"
pytest

echo "==> All checks passed."
