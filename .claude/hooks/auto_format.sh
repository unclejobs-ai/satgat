#!/usr/bin/env bash
# PostToolUse auto-format hook for Factory Droid.
# Runs the project's formatter on edited files if available.
# This is a passthrough stub — exits 0 always (never blocks edits).

set -euo pipefail

# Read stdin (tool event JSON) and discard — we just need it consumed
cat > /dev/null 2>&1 || true

exit 0
