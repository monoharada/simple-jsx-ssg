#!/bin/bash

# 使用中のポート8080を開放
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
elif [[ "$OSTYPE" == "darwin"* ]]; then
    lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
elif [[ "$OSTYPE" == "msys" ]]; then
    netstat -ano | findstr :8080 | findstr LISTENING | awk '{print $5}' | xargs taskkill /PID /F
fi

# bun run watcher.ts を実行
BUILD_MODE=development bun run tools/dev/watcher.ts &

# bunx reload を新しいポートで実行
bun run tools/dev/bunserver.ts &

# ブラウザを開く
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000/page-list
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000/page-list
elif [[ "$OSTYPE" == "msys" ]]; then
    start http://localhost:3000/page-list
fi

# プロセスIDを取得
WATCHER_PID=$!

# SIGINT (ctrl + c) シグナルをキャッチしてプロセスを終了
trap "echo 'Stopping watcher.ts...'; pkill -f watcher.ts; exit 0" SIGINT

# プロセスが終了するまで待機
wait $WATCHER_PID