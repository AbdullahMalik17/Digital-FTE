<#
.SYNOPSIS
    Sets up a local "Cloud Agent" simulation in a separate directory.
    This allows testing the Dual-Agent architecture (Cloud + Local) on a single machine.

.DESCRIPTION
    1. Creates a sibling directory '..\Hacathan_2_Cloud'.
    2. Clones the current repository into it.
    3. Sets up a virtual environment.
    4. Configures .env for WORK_ZONE=cloud.
    5. Prepares a startup script.

.NOTES
    Run this script from the project root: .\scripts\setup_local_simulation.ps1
#>

$ErrorActionPreference = "Stop"
$OriginalPath = Get-Location
$ParentPath = Split-Path -Parent $OriginalPath
$CloudDir = Join-Path $ParentPath "Hacathan_2_Cloud"
$RepoUrl = "https://github.com/AbdullahMalik17/Hacathan-2-.git"

Write-Host "=== Digital FTE Local Simulation Setup ===" -ForegroundColor Green

# 1. Create Cloud Directory
if (Test-Path $CloudDir) {
    Write-Host "Cleaning up existing simulation directory..." -ForegroundColor Yellow
    Remove-Item -Path $CloudDir -Recurse -Force
}

Write-Host "Creating Cloud Agent directory at: $CloudDir"
New-Item -ItemType Directory -Path $CloudDir -Force | Out-Null

# 2. Clone Repository
Write-Host "Cloning repository..." -ForegroundColor Yellow
# We clone from the local path to ensure we get the latest unpushed changes if any, 
# or use the remote URL. Using remote URL is better for testing actual Git Sync.
git clone $RepoUrl $CloudDir

if (-not $?) {
    Write-Error "Failed to clone repository. Please check your internet connection."
}

# 3. Setup Virtual Environment
Write-Host "Setting up Python environment (this may take a minute)..." -ForegroundColor Yellow
Set-Location $CloudDir
python -m venv .venv
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\pip.exe" install -r requirements.txt

# 4. Configure Environment
Write-Host "Configuring Cloud Environment..." -ForegroundColor Yellow
Copy-Item "config\.env.cloud.example" -Destination ".env"

# modify .env to ensure it uses a distinct vault path if needed, 
# but for git sync test, it should be the local git repo path.
# actually, in simulation, the "Vault" is just the folder inside the repo.
# So defaults in .env.cloud.example (checking relative paths) might need adjustment.
# Let's check .env.cloud.example content again.

# The example has: VAULT_PATH=/home/digitalfte/Hacathan_2/Vault
# We need to change this to the Windows path of the simulated dir.
$EnvContent = Get-Content ".env"
$NewVaultPath = Join-Path $CloudDir "Vault"
$NewVaultPath = $NewVaultPath -replace "\\", "/" # Ensure forward slashes for python compatibility if needed, though pathlib handles both.

$EnvContent = $EnvContent -replace "VAULT_PATH=.*", "VAULT_PATH=$NewVaultPath"
$EnvContent = $EnvContent -replace "FILESYSTEM_ENABLED=true", "FILESYSTEM_ENABLED=false" # Disable FS watcher to avoid conflicts
$EnvContent | Set-Content ".env"

# 5. Create Startup Script
$StartupScript = @"
@echo off
title Digital FTE - CLOUD AGENT (SIMULATION)
color 1F
echo ===================================================
echo   DIGITAL FTE - CLOUD AGENT (SIMULATION MODE)
	echo   Work Zone: CLOUD (Draft Only)
	echo ===================================================
echo.
call .venv\Scripts\activate
python src\orchestrator.py
pause
"@

$StartupScript | Set-Content "start_cloud_agent.bat"

Write-Host "=== Simulation Setup Complete ===" -ForegroundColor Green
Write-Host "To start the simulated Cloud Agent:"
Write-Host "1. Open a NEW PowerShell or Command Prompt window."
Write-Host "2. Run this command:"
Write-Host "   $CloudDir\start_cloud_agent.bat"
Write-Host ""
Write-Host "To start the Local Agent (Real):"
Write-Host "1. Stay in this directory."
Write-Host "2. Run: python src\orchestrator.py"

Set-Location $OriginalPath
