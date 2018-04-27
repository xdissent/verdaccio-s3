#!/usr/bin/env sh

set -e

build() {
  BABEL_ENV="$1" babel src --out-dir "$1" --ignore 'test.js,flow.js'
  find src -name '*.js' ! -name '*.test.js' ! -name '*.flow.js' -print0 \
    | xargs -n 1 -0 sh -c \
      'OUT="${1/src/$0}.flow"; cp -f "$1" "$OUT" && echo "$1 -> $OUT"' "$1"
}

for e in lib es; do build $e; done
