from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel
from typing import Any
import json

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
SETTINGS_FILE = BASE_DIR / "wwwroot/src/assets/settings.json"

class Settings(BaseModel):
    motors: list[dict[str, Any]]
    # Add other fields as needed

@app.post("/api/settings")
async def save_settings(settings: dict[str, Any]):
    """Save settings to settings.json file"""
    try:
        # Write to settings.json
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=4, ensure_ascii=False)
        
        return {"success": True, "message": "Settings saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save settings: {str(e)}")

@app.get("/api/settings")
async def get_settings():
    """Get current settings from settings.json file"""
    try:
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            settings = json.load(f)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load settings: {str(e)}")

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")

