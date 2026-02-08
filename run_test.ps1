# PowerShell helper to create/activate venv and run the demo
if (!(Test-Path -Path .venv)) {
    python -m venv .venv
}
. .\ .venv\Scripts\Activate.ps1
python -m evacuation.test_graph
