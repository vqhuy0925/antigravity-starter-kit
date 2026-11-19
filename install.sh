#!/usr/bin/env bash
set -e

REPO_URL="${AGY_KIT_REPO:-https://github.com/vqhuy0925/antigravity-starter-kit.git}"
MODE="local"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --global|-g) MODE="global"; shift ;;
        --local|-l) MODE="local"; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Clone or update DEST_DIR, then rewrite hook commands to absolute paths.
install_kit() {
    local dest="$1" label="$2"
    if [ -d "$dest/.git" ]; then
        echo "Updating existing $label plugin..."
        # hooks.json holds install-time absolute paths; restore it so pull never conflicts
        git -C "$dest" checkout -- hooks.json
        git -C "$dest" pull
    else
        git clone --depth=1 "$REPO_URL" "$dest"
    fi
    if command -v node >/dev/null 2>&1; then
        node "$dest/bin/link-hooks.js" "$dest"
    else
        echo "⚠️  Node.js was not found. The safety guardrail hooks stay inactive until Node.js (>= 18) is installed."
        echo "   Then run: node \"$dest/bin/link-hooks.js\" \"$dest\""
        echo "   Skills and rules still work without it."
    fi
}

if [ "$MODE" = "global" ]; then
    DEST_DIR="$HOME/.gemini/config/plugins/antigravity-starter-kit"
    echo "📦 Installing Antigravity Starter Kit Globally to $DEST_DIR..."
    mkdir -p "$HOME/.gemini/config/plugins"
    install_kit "$DEST_DIR" global
    echo "✅ Global installation complete! All projects on your machine now have access to these skills and rules."
else
    DEST_DIR=".agents/plugins/antigravity-starter-kit"
    echo "📦 Installing Antigravity Starter Kit Locally to $(pwd)/$DEST_DIR..."
    mkdir -p .agents/plugins
    install_kit "$DEST_DIR" local
    echo "✅ Local installation complete! Your project is now equipped with Antigravity skills and rules."
fi
