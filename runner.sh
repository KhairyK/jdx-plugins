#!/usr/bin/env bash

# =========================
# JDX Runner CLI
# =========================

# Parse argument
for arg in "$@"; do
  case $arg in
    --run=*)
      CMD="${arg#*=}"
      ;;
  esac
done

# All command
if [ -z "$CMD" ]; then
  echo "❌ Error: No command specified"
  echo "Usage: jdx-runner --run=<command>"
  exit 1
fi

case "$CMD" in

  build-registry)
    echo "🚀 Running Registry Build..."
    node build/registry.js
    ;;

  *)
    echo "❌ Unknown command: $CMD"
    exit 1
    ;;

esac
