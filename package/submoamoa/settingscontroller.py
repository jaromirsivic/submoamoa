from fastapi import HTTPException
from pathlib import Path
from typing import Any
import json

# Get the directory of the current file
BASE_DIR = Path(__file__).resolve().parent
SETTINGS_FILE = BASE_DIR / "wwwroot/src/assets/settings.json"


async def get_settings() -> dict[str, Any]:
    """Get current settings from settings.json file"""
    try:
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            settings = json.load(f)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load settings: {str(e)}")


async def save_settings(settings: dict[str, Any]) -> dict[str, str]:
    """Save settings to settings.json file"""
    try:
        # Write to settings.json
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=4, ensure_ascii=False)
        
        return {"success": True, "message": "Settings saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save settings: {str(e)}")
