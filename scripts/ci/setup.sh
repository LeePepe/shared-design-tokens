#!/usr/bin/env bash
# CI setup for every quality.yml lane: ensure Node 22 (the version CI has always
# pinned; engines allow >=22), then install the locked dev dependencies.
# A missing or different Node major is replaced by the official release tarball,
# verified against the pinned SHA-256 below before it is used.
set -euo pipefail

version="22.23.3"
case "$(uname -s)-$(uname -m)" in
    Linux-x86_64) platform="linux-x64"; sha="1084aa36196bba4c3a5e69a1ee388a6e4ff729dad09445fbcd434b28fe3c24af" ;;
    Darwin-arm64) platform="darwin-arm64"; sha="23b25245dcfb9af7262f8ff142e9e2e0af025368117329e7a7458a51e5922f53" ;;
    Darwin-x86_64) platform="darwin-x64"; sha="8a677b0219178efd6eb0e475457c4afb452b521a92f6e67845a73bd85727f2a8" ;;
    *) echo "[setup] unsupported platform $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac

if [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)" != "22" ]; then
    dest="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/node-v$version-$platform"
    if [ ! -x "$dest/bin/node" ]; then
        archive="$dest.tar.gz"
        curl -fsSL --retry 3 -o "$archive" "https://nodejs.org/dist/v$version/node-v$version-$platform.tar.gz"
        echo "$sha  $archive" | shasum -a 256 -c - >/dev/null \
            || { echo "[setup] Node archive checksum mismatch" >&2; exit 1; }
        tar -xzf "$archive" -C "$(dirname "$dest")"
    fi
    export PATH="$dest/bin:$PATH"
    [ -n "${GITHUB_PATH:-}" ] && echo "$dest/bin" >> "$GITHUB_PATH"
fi
echo "[setup] node $(node --version), npm $(npm --version)"
npm ci --ignore-scripts --no-audit --no-fund
