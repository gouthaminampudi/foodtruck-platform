#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JAVA21_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
GRADLE_LOCAL_HOME="${REPO_ROOT}/.gradle-local"

if [[ ! -x "${JAVA21_HOME}/bin/java" ]]; then
  echo "Java 21 not found at ${JAVA21_HOME}" >&2
  echo "Install with: brew install openjdk@21" >&2
  return 1 2>/dev/null || exit 1
fi

export JAVA_HOME="${JAVA21_HOME}"
export PATH="${JAVA_HOME}/bin:${PATH}"
export GRADLE_USER_HOME="${GRADLE_LOCAL_HOME}"

mkdir -p "${GRADLE_USER_HOME}"

echo "JAVA_HOME=${JAVA_HOME}"
echo "GRADLE_USER_HOME=${GRADLE_USER_HOME}"
echo "Ready. Example:"
echo "  cd ${REPO_ROOT}/apps/api && gradle test"
