powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex" && set Path=C:\Users\User\.local\bin;%Path%
uv init
git init
IF NOT EXIST .venv\Scripts\activate (uv venv)
call .venv\Scripts\activate
rem uv pip install -U ultralytics
rem uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
uv add fastapi --extra standard
uv add uvicorn --extra standard
uv add gpiozero pigpio
pause