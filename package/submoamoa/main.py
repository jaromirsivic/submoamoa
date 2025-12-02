from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Any

from . import settingscontroller

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory of the current file
BASE_DIR = Path(__file__).resolve().parent

@app.post("/api/settings")
async def save_settings_endpoint(settings: dict[str, Any]):
    """Save settings to settings.json file"""
    return await settingscontroller.save_settings(settings)

@app.get("/api/settings")
async def get_settings_endpoint():
    """Get current settings from settings.json file"""
    return await settingscontroller.get_settings()

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")


