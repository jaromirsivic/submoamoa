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
    cameras = CameraController().list_cameras()
    print(cameras)


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

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")


