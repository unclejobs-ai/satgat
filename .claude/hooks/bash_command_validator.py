#!/usr/bin/env python3
"""Bash command validator hook for Factory Droid.

Reads the command from stdin JSON, validates it against a denylist of
dangerous patterns, and exits 0 (allow) or 2 (deny with message).

This is a passthrough validator — it blocks only genuinely dangerous
commands and allows everything else.
"""

import json
import sys
import re

DENYLIST = [
    r"rm\s+-rf\s+/",
    r"rm\s+-rf\s+/\*",
    r"rm\s+-rf\s+~",
    r"rm\s+-rf\s+~/\*",
    r"rm\s+-rf\s+\$HOME",
    r"rm\s+-r\s+/",
    r"rm\s+-r\s+/\*",
    r"rm\s+-r\s+~",
    r"rm\s+-r\s+~/\*",
    r"mkfs",
    r"dd\s+if=/dev/zero\s+of=/dev",
    r"dd\s+of=/dev/",
    r"shutdown",
    r"reboot",
    r"halt",
    r"poweroff",
    r"init\s+0",
    r"init\s+6",
    r":\(\)\s*\{\s*:\|:\s*&\s*\};:",
    r"chmod\s+-R\s+777\s+/",
    r"chmod\s+-R\s+000\s+/",
    r"chown\s+-R",
    r"git\s+push\s+.*--force",  # force push to remote
    r"curl\s+.*\|\s*bash",
    r"curl\s+.*\|\s*sh",
    r"wget\s+.*\|\s*bash",
    r"wget\s+.*\|\s*sh",
]

# Patterns that get a warning but are still allowed
WARN_PATTERNS = [
    (r"\.env\b", "Direct .env file access — ensure no secrets are exposed"),
]


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        # Can't parse input, allow the command
        sys.exit(0)

    command = ""
    if isinstance(data, dict):
        tool_input = data.get("tool_input", data)
        if isinstance(tool_input, dict):
            command = tool_input.get("command", "")
        elif isinstance(tool_input, str):
            command = tool_input

    if not command:
        sys.exit(0)

    for pattern in DENYLIST:
        if re.search(pattern, command):
            print(
                f"BLOCKED: Command matches dangerous pattern: {pattern}",
                file=sys.stderr,
            )
            sys.exit(2)

    # Allow everything else
    sys.exit(0)


if __name__ == "__main__":
    main()
