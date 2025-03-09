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

# bun run tools/dev/bunserver.ts を実行
bun run tools/dev/bunserver.ts &

# ブラウザを開くセクション
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linuxの場合、標準的にはxdg-openで新しいタブが開く
    # すでに開いているタブをアクティブにするには、使用ブラウザとwmctrlやxdotoolのスクリプトが必要になる
    xdg-open http://localhost:3000/page-list
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOSの場合：Chromeでタブをアクティブ化するAppleScriptを使用
    /usr/bin/osascript <<EOF
    tell application "System Events"
        set isChromeRunning to exists process "Google Chrome"
    end tell

    if isChromeRunning then
        tell application "Google Chrome"
            set foundTab to false
            repeat with w in windows
                set i to 1
                repeat with t in tabs of w
                    if (URL of t) starts with "http://localhost:3000" then
                        set foundTab to true
                        set active tab index of w to i
                        reload t
                        set index of w to 1
                        activate
                        exit repeat
                    end if
                    set i to i + 1
                end repeat
                if foundTab then exit repeat
            end repeat

            if not foundTab then
                tell window 1 to make new tab with properties {URL:"http://localhost:3000/page-list"}
                set index of window 1 to 1
                activate
            end if
        end tell
    else
        # Chromeが起動していない場合は新規起動
        do shell script "open -a 'Google Chrome' 'http://localhost:3000/page-list'"
    end if
EOF
elif [[ "$OSTYPE" == "msys" ]]; then
    # Windowsの場合、基本的には`start`コマンドで新しいタブ/ウィンドウが開く
    # 既存タブをアクティブ化するにはPowerShellスクリプトやAutomationツールが必要
    start http://localhost:3000/page-list
fi

# プロセスIDを取得
WATCHER_PID=$!

# SIGINT (ctrl + c) シグナルをキャッチしてプロセスを終了
trap "echo 'Stopping watcher.ts...'; pkill -f watcher.ts; exit 0" SIGINT

# プロセスが終了するまで待機
wait $WATCHER_PID
