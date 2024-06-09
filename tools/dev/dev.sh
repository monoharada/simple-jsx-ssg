#!/bin/bash

# 使用中のポート8080を開放
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# bunx reload を新しいポートで実行
bun run tools/dev/bunserver.ts &


# bun run watcher.ts を実行
BUILD_MODE=development bun run tools/dev/watcher.ts