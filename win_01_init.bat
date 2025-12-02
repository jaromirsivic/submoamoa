powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex" && set Path=C:\Users\User\.local\bin;%Path%
uv init
git init
IF NOT EXIST .venv\Scripts\activate (uv venv)
call .venv\Scripts\activate
uv pip install -U ultralytics
uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
uv add fastapi
uv add uvicorn
rem uv add cairosvg
rem uv add jinja2
rem uv add torch torchvision torchaudio
rem uv add matplotlib
pause