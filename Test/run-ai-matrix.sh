#!/usr/bin/env bash
# Usage: bash Test/run-ai-matrix.sh            (Kaggle on)
#        KAGGLE_OFF=1 bash Test/run-ai-matrix.sh   (simulate Kaggle down -> Gemini fallback)
cd "$(dirname "$0")/.." || exit 1
export TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS","moduleResolution":"node"}'
exec ./node_modules/.bin/ts-node --transpile-only Test/ai-matrix.ts
