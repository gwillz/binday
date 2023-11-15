#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"

export PATH="./node_modules/.bin:$PATH"

[ -e dist ] && rm -rf dist

tsc --noEmit
vite build

gh-pages -d dist
