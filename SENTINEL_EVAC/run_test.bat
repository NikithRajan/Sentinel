@echo off
cd d:\Sentinel\Sentinel\SENTINEL_EVAC
call ..\.venv\Scripts\activate.bat
python -u -m evacuation.test_graph > final_log.txt 2>&1
echo Done >> final_log.txt
