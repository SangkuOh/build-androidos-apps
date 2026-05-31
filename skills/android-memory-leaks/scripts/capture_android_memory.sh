#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'USAGE'
Usage: capture_android_memory.sh --package PACKAGE --out-dir DIR [--serial SERIAL] [--label LABEL]

Captures dumpsys meminfo and an Android-format HPROF from a running app.
USAGE
}

serial=""
package=""
out_dir=""
label="capture"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --serial)
      serial="${2:-}"
      shift 2
      ;;
    --package)
      package="${2:-}"
      shift 2
      ;;
    --out-dir)
      out_dir="${2:-}"
      shift 2
      ;;
    --label)
      label="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ -z "$package" || -z "$out_dir" ]]; then
  usage
  exit 2
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "adb is not installed or not on PATH." >&2
  exit 1
fi

adb_args=()
if [[ -n "$serial" ]]; then
  adb_args=(-s "$serial")
fi

mkdir -p "$out_dir"
timestamp="$(date +%Y%m%d-%H%M%S)"
prefix="$out_dir/$label-$timestamp"
remote_hprof="/data/local/tmp/$package-$timestamp.hprof"

if ! adb "${adb_args[@]}" shell pidof -s "$package" >/dev/null 2>&1; then
  echo "App process is not running: $package" >&2
  exit 1
fi

adb "${adb_args[@]}" shell dumpsys meminfo "$package" > "$prefix-meminfo.txt"
adb "${adb_args[@]}" shell am dumpheap -g "$package" "$remote_hprof"
adb "${adb_args[@]}" pull "$remote_hprof" "$prefix.hprof" >/dev/null
adb "${adb_args[@]}" shell rm -f "$remote_hprof"

printf 'Wrote: %s\n' "$prefix-meminfo.txt"
printf 'Wrote: %s\n' "$prefix.hprof"
