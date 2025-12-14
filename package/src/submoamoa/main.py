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

@app.get("/api/settings/general")
async def get_general_settings_endpoint():
    """Get general settings from settings.json file"""
    settings = await settingscontroller.get_settings()
    return settings.get("general", {})

@app.post("/api/settings/general")
async def save_general_settings_endpoint(general_settings: dict[str, Any]):
    """Save general settings to settings.json file"""
    settings = await settingscontroller.get_settings()
    settings["general"] = general_settings
    await settingscontroller.save_settings(settings)
    
    # Reset controller with new settings
    try:
        await reset_j8_controller()
    except Exception as e:
        print(f"Failed to reset controller after settings save: {e}")
        
    return {"success": True}

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

async def get_j8():
    """Get or create the J8 singleton instance using settings.json"""
    global _j8_instance
    if _j8_instance is None:
        from .j8 import J8
        # Get settings to determine host/port
        settings = await settingscontroller.get_settings()
        general_settings = settings.get("general", {})
        controller_setup = general_settings.get("controllerSetup", {})
        
        mode = controller_setup.get("controller", "localhost")
        if mode == "remote":
            host = controller_setup.get("remoteHost", "192.168.0.1")
            port = int(controller_setup.get("remotePort", 8888))
            _j8_instance = J8(host=host, port=port)
        else:
             # localhost
            _j8_instance = J8(host=None, port=None)
            
    return _j8_instance

async def reset_j8_controller():
    """Reset J8 controller with latest settings"""
    j8 = await get_j8()
    
    # Reload settings to get latest host/port
    settings = await settingscontroller.get_settings()
    general_settings = settings.get("general", {})
    controller_setup = general_settings.get("controllerSetup", {})
    
    mode = controller_setup.get("controller", "localhost")
    if mode == "remote":
        host = controller_setup.get("remoteHost", "192.168.0.1")
        port = int(controller_setup.get("remotePort", 8888))
        j8.reset(host=host, port=port)
    else:
        j8.reset(host=None, port=None)
    return j8

@app.get("/api/controller/status")
async def get_controller_status_endpoint():
    """Get J8 controller initialization status"""
    try:
        j8 = await get_j8()
        return {
            "initialized": j8.initialized,
            "error_message": j8.error_message
        }
    except Exception as e:
        return {
            "initialized": False,
            "error_message": str(e)
        }

@app.post("/api/motors/action/start")
async def start_motor_action(request: MotorActionStartRequest):
    """Start motor action: set J8[pin_index] to pwm_multiplier"""
    try:
        j8 = await get_j8()
        # Reset with current settings before action to ensure clean state
        await reset_j8_controller()
        
        j8[request.pin_index].value = request.pwm_multiplier
        return {"success": True, "message": f"Pin {request.pin_index} set to {request.pwm_multiplier}"}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motors/action/stop")
async def stop_motor_action(request: MotorActionStopRequest):
    """Stop motor action: reset J8[pin_index]"""
    try:
        j8 = await get_j8()
        j8[request.pin_index].reset()
        return {"success": True, "message": f"Pin {request.pin_index} reset"}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/motors/speedhistogram")
async def get_speed_histogram_endpoint():
    """Get speed histogram data for Chart2D visualization"""
    from .speedhistogram import SpeedHistogram
    settings = await settingscontroller.get_settings()
    motors = settings.get("motors", [])
    
    result = []
    for motor in motors:
        histogram_data = motor.get("histogram", [])
        if len(histogram_data) >= 2:
            # Convert histogram data to format expected by SpeedHistogram
            speed_histogram_input = [
                {
                    "pwm_multiplier": item.get("pwmMultiplier", 0),
                    "forward_seconds": item.get("forwardSeconds", 0),
                    "reverse_seconds": item.get("reverseSeconds", 0)
                }
                for item in histogram_data
            ]
            try:
                speed_histogram = SpeedHistogram(speed_histogram=speed_histogram_input)
                # Convert to Chart2D format: list of {x, y} points
                resolution = speed_histogram.resolution
                forward_data = [
                    {"x": i / resolution, "y": speed_histogram.forward_speed_histogram[i]}
                    for i in range(resolution + 1)
                ]
                reverse_data = [
                    {"x": i / resolution, "y": speed_histogram.reverse_speed_histogram[i]}
                    for i in range(resolution + 1)
                ]
                result.append({
                    "motorName": motor.get("name", "Unknown"),
                    "forward": forward_data,
                    "reverse": reverse_data
                })
            except Exception as e:
                print(f"Error processing histogram for motor {motor.get('name')}: {e}")
                result.append({
                    "motorName": motor.get("name", "Unknown"),
                    "forward": [],
                    "reverse": [],
                    "error": str(e)
                })
        else:
            result.append({
                "motorName": motor.get("name", "Unknown"),
                "forward": [],
                "reverse": [],
                "error": "Insufficient histogram data"
            })
    
    return result

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")

