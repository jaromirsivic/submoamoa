from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

# Get the directory of the current file
BASE_DIR = Path(__file__).resolve().parent

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")
