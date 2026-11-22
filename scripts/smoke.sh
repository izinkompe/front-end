#!/usr/bin/env bash
set -euo pipefail

port=${PORT:-3100}
url="http://127.0.0.1:${port}/"

if curl --noproxy '*' --silent --max-time 1 --output /dev/null "$url"; then
  echo "An HTTP server is already running at $url." >&2
  exit 1
fi

smoke_files=$(mktemp -d)
server_log="$smoke_files/server.log"
response_body="$smoke_files/home.html"
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port "$port" >"$server_log" 2>&1 &
server_pid=$!

cleanup() {
  local status=$?
  if [[ "${OSTYPE:-}" == "msys" || "${OSTYPE:-}" == "cygwin" || "${OSTYPE:-}" == "win32" ]]; then
    taskkill //F //T //PID "$server_pid" 2>/dev/null || true
  else
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
  if (( status != 0 )); then
    cat "$server_log" >&2
  fi
  rm -f "$server_log" "$response_body"
  rmdir "$smoke_files" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

deadline=$((SECONDS + 30))
while (( (remaining = deadline - SECONDS) > 0 )); do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo 'Next.js exited before the smoke test completed.' >&2
    exit 1
  fi

  if response=$(curl --noproxy '*' --silent --max-time "$remaining" --output "$response_body" \
    --write-out '%{http_code} %{content_type}' "$url"); then
    if [[ "$response" != '200 text/html' && "$response" != '200 text/html;'* ]]; then
      echo "Expected HTTP 200 and HTML from $url, received $response." >&2
      exit 1
    fi
    if ! grep -qi '<html[ >]' "$response_body"; then
      echo "The response from $url is missing an HTML document." >&2
      exit 1
    fi
    echo "Smoke test passed for $url."
    exit 0
  fi

  sleep 1
done

echo "No HTTP response from $url within 30 seconds." >&2
exit 1
