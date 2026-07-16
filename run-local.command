#!/bin/zsh

cd -- "$(dirname "$0")"

if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  NODE_BIN="/Users/gizemdemirtas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi

echo "Quality Market is starting at http://localhost:3000"
echo "Press Control+C to stop the application."
exec "$NODE_BIN" app/server.js
