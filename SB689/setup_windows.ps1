Write-Host "SB689 STITCH Hive Mind setup" -ForegroundColor Yellow

if (!(Test-Path ".venv")) {
  python -m venv .venv
}

.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "\nSB689 ready." -ForegroundColor Green
Write-Host "Run local test:" -ForegroundColor Cyan
Write-Host "  python run_stitch.py"
Write-Host "\nRun API:" -ForegroundColor Cyan
Write-Host "  uvicorn api.app:app --reload --host 127.0.0.1 --port 8689"
Write-Host "\nOpen:" -ForegroundColor Cyan
Write-Host "  http://127.0.0.1:8689"
