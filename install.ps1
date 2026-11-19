# Antigravity Starter Kit - Windows PowerShell Native Installer
[CmdletBinding()]
param (
    [Alias("g")]
    [switch]$Global,

    [Alias("l")]
    [switch]$Local
)

$ErrorActionPreference = "Stop"
$RepoUrl = if ($env:AGY_KIT_REPO) { $env:AGY_KIT_REPO } else { "https://github.com/vqhuy0925/antigravity-starter-kit.git" }

# Clone or update $Dest, then rewrite hook commands to absolute paths.
function Install-Kit([string]$Dest, [string]$Label) {
    if (Test-Path (Join-Path $Dest ".git")) {
        Write-Host "Updating existing $Label plugin..." -ForegroundColor Yellow
        # hooks.json holds install-time absolute paths; restore it so pull never conflicts
        git -C "$Dest" checkout -- hooks.json
        if ($LASTEXITCODE -ne 0) { throw "git checkout failed" }
        git -C "$Dest" pull
        if ($LASTEXITCODE -ne 0) { throw "git pull failed" }
    } else {
        git clone --depth=1 "$RepoUrl" "$Dest"
        if ($LASTEXITCODE -ne 0) { throw "git clone failed" }
    }
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node (Join-Path $Dest "bin/link-hooks.js") "$Dest"
    } else {
        Write-Host "WARNING: Node.js was not found. The safety guardrail hooks stay inactive until Node.js (>= 18) is installed." -ForegroundColor Yellow
        Write-Host "  Then run: node `"$Dest/bin/link-hooks.js`" `"$Dest`""
        Write-Host "  Skills and rules still work without it."
    }
}

# Verify Git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Git is required to install Antigravity Starter Kit. Please install Git and try again."
    exit 1
}

if ($Global) {
    $destDir = Join-Path $HOME ".gemini\config\plugins\antigravity-starter-kit"
    $parentDir = Join-Path $HOME ".gemini\config\plugins"

    Write-Host "📦 Installing Antigravity Starter Kit Globally to $destDir..." -ForegroundColor Cyan
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    Install-Kit $destDir "global"

    Write-Host "`n✅ Global installation complete! All Antigravity projects will now inherit these skills, rules, hooks, and agents." -ForegroundColor Green
} else {
    $destDir = Join-Path (Get-Location) ".agents\plugins\antigravity-starter-kit"
    $parentDir = Join-Path (Get-Location) ".agents\plugins"

    Write-Host "📦 Installing Antigravity Starter Kit Locally to $destDir..." -ForegroundColor Cyan
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    Install-Kit $destDir "local"

    Write-Host "`n✅ Local installation complete! Your current repository is now equipped with Antigravity starter kit." -ForegroundColor Green
}
