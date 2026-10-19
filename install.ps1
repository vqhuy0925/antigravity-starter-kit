# Antigravity Starter Kit - Windows PowerShell Native Installer
[CmdletBinding()]
param (
    [Alias("g")]
    [switch]$Global,

    [Alias("l")]
    [switch]$Local
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/vqhuy0925/antigravity-starter-kit.git"

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

    if (Test-Path (Join-Path $destDir ".git")) {
        Write-Host "Updating existing global plugin..." -ForegroundColor Yellow
        git -C "$destDir" pull
    } else {
        git clone --depth=1 "$RepoUrl" "$destDir"
    }

    Write-Host "`n✅ Global installation complete! All Antigravity projects will now inherit these skills, rules, hooks, and agents." -ForegroundColor Green
} else {
    $destDir = Join-Path (Get-Location) ".agents\plugins\antigravity-starter-kit"
    $parentDir = Join-Path (Get-Location) ".agents\plugins"

    Write-Host "📦 Installing Antigravity Starter Kit Locally to $destDir..." -ForegroundColor Cyan
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    if (Test-Path (Join-Path $destDir ".git")) {
        Write-Host "Updating existing local plugin..." -ForegroundColor Yellow
        git -C "$destDir" pull
    } else {
        git clone --depth=1 "$RepoUrl" "$destDir"
    }

    Write-Host "`n✅ Local installation complete! Your current repository is now equipped with Antigravity starter kit." -ForegroundColor Green
}
