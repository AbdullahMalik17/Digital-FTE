$env:LINKEDIN_HEADLESS = "false"
Write-Host "Starting LinkedIn Watcher in VISIBLE mode..."
Write-Host "Please log in manually when the browser window appears."
Write-Host "Once logged in, the script will verify the session and start monitoring."

& { . .venv\Scripts\activate.ps1; python src/watchers/linkedin_watcher.py }
