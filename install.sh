#!/usr/bin/env bash
set -e

REPO_URL="https://github.com/vqhuy0925/antigravity-starter-kit.git"
MODE="local"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --global|-g) MODE="global"; shift ;;
        --local|-l) MODE="local"; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

if [ "$MODE" = "global" ]; then
    DEST_DIR="$HOME/.gemini/config/plugins/antigravity-starter-kit"
    echo "📦 Installing Antigravity Starter Kit Globally to $DEST_DIR..."
    mkdir -p "$HOME/.gemini/config/plugins"
    if [ -d "$DEST_DIR/.git" ]; then
        echo "Updating existing global plugin..."
        git -C "$DEST_DIR" pull
    else
        git clone --depth=1 "$REPO_URL" "$DEST_DIR"
    fi
    echo "✅ Global installation complete! All projects on your machine now have access to these skills and rules."
else
    DEST_DIR=".agents/plugins/antigravity-starter-kit"
    echo "📦 Installing Antigravity Starter Kit Locally to $(pwd)/$DEST_DIR..."
    mkdir -p .agents/plugins
    if [ -d "$DEST_DIR/.git" ]; then
        echo "Updating existing local plugin..."
        git -C "$DEST_DIR" pull
    else
        git clone --depth=1 "$REPO_URL" "$DEST_DIR"
    fi
    echo "✅ Local installation complete! Your project is now equipped with Antigravity skills and rules."
fi
