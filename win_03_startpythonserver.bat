call .venv\Scripts\activate
uvicorn package.src.submoamoa.main:app --reload --port 8000
pause