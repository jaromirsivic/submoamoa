powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex" && set Path=C:\Users\User\.local\bin;%Path% && uv init
git init
rem IF NOT EXIST .venv\Scripts\activate (uv venv)
rem .venv\Scripts\activate
rem uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
rem uv add torch torchvision torchaudio
uv add matplotlib
pause