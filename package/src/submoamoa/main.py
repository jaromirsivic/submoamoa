from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Any
from contextlib import asynccontextmanager
from . import settingscontroller
from .camera import CameraController

async def onload():
    print("Server loaded")
    # cameras = CameraController().list_cameras()
    #print(cameras)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic goes here
    print("Server starting up...")
    # You can call your onload function here
    await onload()
    yield
    # Shutdown logic goes here
    print("Server shutting down...")

app = FastAPI(lifespan=lifespan)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
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

@app.get("/api/settings/camera")
async def get_camera_settings_endpoint():
    """Get camera settings from settings.json file"""
    settings = await settingscontroller.get_settings()
    return settings.get("camera", {})

@app.post("/api/settings/camera")
async def save_camera_settings_endpoint(camera_settings: dict[str, Any]):
    """Save camera settings to settings.json file"""
    settings = await settingscontroller.get_settings()
    settings["camera"] = camera_settings
    return await settingscontroller.save_settings(settings)

@app.get("/api/settings/motors")
async def get_motors_settings_endpoint():
    """Get motors settings from settings.json file"""
    settings = await settingscontroller.get_settings()
    return settings.get("motors", [])

@app.post("/api/settings/motors")
async def save_motors_settings_endpoint(motors_settings: list[dict[str, Any]]):
    """Save motors settings to settings.json file"""
    settings = await settingscontroller.get_settings()
    settings["motors"] = motors_settings
    return await settingscontroller.save_settings(settings)

@app.get("/api/settings/hot-zone")
async def get_hot_zone_settings_endpoint():
    """Get hot zone settings from settings.json file"""
    settings = await settingscontroller.get_settings()
    return settings.get("hotZone", {})

@app.post("/api/settings/hot-zone")
async def save_hot_zone_settings_endpoint(hot_zone_settings: dict[str, Any]):
    """Save hot zone settings to settings.json file"""
    settings = await settingscontroller.get_settings()
    settings["hotZone"] = hot_zone_settings
    return await settingscontroller.save_settings(settings)

# ============================================
# Motor Action API
# ============================================

from pydantic import BaseModel
from fastapi import HTTPException

class MotorActionStartRequest(BaseModel):
    pin_index: int
    pwm_multiplier: float

class MotorActionStopRequest(BaseModel):
    pin_index: int

# Lazy J8 instance
_j8_instance = None

def get_j8():
    """Get or create the J8 singleton instance"""
    global _j8_instance
    if _j8_instance is None:
        from .j8 import J8
        # Initialize J8 with remote pigpio connection
        _j8_instance = J8(host="192.168.68.55", port=8888)
    return _j8_instance

@app.post("/api/motors/action/start")
async def start_motor_action(request: MotorActionStartRequest):
    """Start motor action: set J8[pin_index] to pwm_multiplier"""
    try:
        j8 = get_j8()
        j8.reset()
        j8[request.pin_index].value = request.pwm_multiplier
        return {"success": True, "message": f"Pin {request.pin_index} set to {request.pwm_multiplier}"}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motors/action/stop")
async def stop_motor_action(request: MotorActionStopRequest):
    """Stop motor action: reset J8[pin_index]"""
    try:
        j8 = get_j8()
        j8[request.pin_index].reset()
        return {"success": True, "message": f"Pin {request.pin_index} reset"}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")

