#!/usr/bin/env bash
# FR-007/SC-007: fail the build if any known-leaked-credential shape shows up
# anywhere in the tracked working tree (git history scrubbing is out of
# scope here — see docs/specs/.../research.md VULN-001..006 and spec.md
# Out of Scope for why: this repo has a fresh git history by construction).
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

PATTERNS=(
  '"type"\s*:\s*"service_account"'   # Firebase/GCP service account JSON key
  '-----BEGIN PRIVATE KEY-----'
  'sk_live_[A-Za-z0-9]+'             # Stripe live secret key
  'rk_live_[A-Za-z0-9]+'             # Stripe live restricted key
  'rk_test_[A-Za-z0-9]{20,}'         # hardcoded Stripe test key (should be env-only)
  "['\"][a-z]{4} [a-z]{4} [a-z]{4} [a-z]{4}['\"]" # quoted Gmail app-password shape ("abcd efgh ijkl mnop")
)

# Lockfiles and build output can contain incidental text that matches these
# patterns by coincidence; they also aren't where a developer would ever
# hand-type a real secret, so they're out of scope for this scan.
EXCLUDES=(':(exclude)scripts/scan-secrets.sh' ':(exclude)pnpm-lock.yaml' ':(exclude)**/dist/**')

FOUND=0
for pattern in "${PATTERNS[@]}"; do
  # --untracked: catch secrets before they're even staged, not just after
  # `git add`. Still honors .gitignore, so ignored files (real .env, etc.)
  # are correctly left out of scope for this scan.
  # -P (PCRE), not -E (POSIX ERE): ERE has no \s/\d, and silently fails to
  # match instead of erroring, which would have made this scan a no-op.
  if git grep --untracked -InP "$pattern" -- . "${EXCLUDES[@]}" > /tmp/scan-secrets.hits 2>/dev/null; then
    echo "Potential secret matching pattern: $pattern"
    cat /tmp/scan-secrets.hits
    FOUND=1
  fi
done

rm -f /tmp/scan-secrets.hits

if [ "$FOUND" -ne 0 ]; then
  echo "scan-secrets: FAILED — remove the above before committing/deploying."
  exit 1
fi

echo "scan-secrets: OK — no known secret patterns found."
