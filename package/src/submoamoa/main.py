from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Any
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.requests import Request
from . import settingscontroller
from .mastercontroller import MasterController
import asyncio
import cv2

master_controller = MasterController()

async def onload():
    print("Server loaded")
    # cameras = CameraController().list_cameras()
    #print(cameras)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic goes here
    print("Server starting up...")
    master_controller.start()
    master_controller.cameras_controller.cameras[0].image.frame
    # You can call your onload function here
    await onload()
    yield
    # Shutdown logic goes here
    print("Server shutting down...")
    master_controller.stop()

app = FastAPI(lifespan=lifespan)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.exception_handler(404)
async def spa_fallback_handler(request: Request, exc: StarletteHTTPException):
    """
    Fallback handler for Single Page Application routing.
    If a 404 occurs and the path is NOT an API endpoint, serve index.html.
    This allows React Router to handle the routing client-side.
    """
    if request.url.path.startswith("/api") or request.url.path.startswith("/ws"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    
    # Serve index.html for SPA routes
    index_path = BASE_DIR / "wwwroot/dist/index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

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
    await settingscontroller.save_settings(settings)
    master_controller.motors_controller.reset()
    return {"success": True}

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
        master_controller.motors_controller.reset()
    except Exception as e:
        print(f"Failed to reset controller after settings save: {e}")
        
    return {"success": True}

@app.get("/api/cameras/list")
async def get_cameras_list_endpoint():
    """Get connected cameras info and general settings"""
    settings = await settingscontroller.get_settings()
    general_settings = settings.get("general", {})
    
    input_devices = []
    
    # Reload list of cameras to get fresh data
    # master_controller.cameras_controller.reload_list_of_cameras() 
    # NOTE: Reloading might be slow or interrupt streams if active. 
    # For now assuming cameras are already loaded or static enough.
    # If dynamic plug/unplug is needed, we should reload here or have a background task.
    # Given the requirements, we'll read the current state.
    
    for cam in master_controller.cameras_controller.cameras:
        device_info = {
            "value": cam.index,
            "label": f"{cam.name}", # Or just cam.name if it's descriptive enough
            "supported_resolutions": []
        }
        
        for res in cam.supported_resolutions:
             device_info["supported_resolutions"].append({
                 "width": res["width"],
                 "height": res["height"],
                 "label": f"{res['width']} x {res['height']}"
             })
             
        input_devices.append(device_info)
        
    return {
        **general_settings,
        "input_devices": input_devices
    }

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

class MotorSpeedRequest(BaseModel):
    motor_name: str
    speed: float

async def get_j8():
    """Get the J8 instance from the motors controller"""
    return master_controller.motors_controller.j8

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
        # Note: We do not reset the controller here because it would interrupt the automatic execution loop.
        
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

@app.post("/api/motors/speed")
async def set_motor_speed(request: MotorSpeedRequest):
    """Set motor speed via REST API"""
    try:
        motors = master_controller.motors_controller.motors
        if request.motor_name in motors:
            motors[request.motor_name].move(speed=float(request.speed))
            return {"success": True, "motor_name": request.motor_name, "speed": request.speed}
        else:
            raise HTTPException(status_code=404, detail=f"Motor not found: {request.motor_name}")
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
            # Use histogram data directly (already in camelCase format)
            speed_histogram_input = histogram_data
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

# ============================================
# Camera Stream API
# ============================================

async def generate_camera_frames(*, camera_index: int):
    """
    Generator that yields MJPEG frames from the camera.
    Uses multipart/x-mixed-replace for browser-native streaming.
    """
    while True:
        try:
            # Get the camera by index
            if camera_index < 0 or camera_index >= len(master_controller.cameras_controller.cameras):
                break
            
            camera = master_controller.cameras_controller.cameras[camera_index]
            frame = camera.image.frame
            
            if frame is not None:
                # Encode frame as JPEG
                _, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
                frame_bytes = jpeg.tobytes()
                
                # Yield as multipart frame
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
                )
            
            # Small delay to control frame rate (100 fps max)
            await asyncio.sleep(0.01)
            
        except Exception as e:
            print(f"Error streaming camera {camera_index}: {e}")
            await asyncio.sleep(0.1)

@app.get("/api/cameras/stream/{camera_index}")
async def stream_camera(camera_index: int):
    """
    Stream camera feed as MJPEG (raw camera image).
    Use this URL as an img src for live video streaming.
    """
    if camera_index < 0 or camera_index >= len(master_controller.cameras_controller.cameras):
        raise HTTPException(status_code=404, detail=f"Camera {camera_index} not found")
    
    return StreamingResponse(
        generate_camera_frames(camera_index=camera_index),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )


async def generate_camera_frames_manual(*, camera_index: int):
    """
    Generator that yields MJPEG frames from the cropped/resized camera image.
    Uses multipart/x-mixed-replace for browser-native streaming.
    Source: camera.image_cropped_resized.frame
    """
    while True:
        try:
            if camera_index < 0 or camera_index >= len(master_controller.cameras_controller.cameras):
                break
            
            camera = master_controller.cameras_controller.cameras[camera_index]
            frame = camera.image_cropped_resized.frame
            
            if frame is not None:
                _, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
                frame_bytes = jpeg.tobytes()
                
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
                )
            
            await asyncio.sleep(0.01)
            
        except Exception as e:
            print(f"Error streaming manual camera {camera_index}: {e}")
            await asyncio.sleep(0.1)


async def generate_camera_frames_ai(*, camera_index: int):
    """
    Generator that yields MJPEG frames from the AI-processed camera image.
    Uses multipart/x-mixed-replace for browser-native streaming.
    Source: camera.image_ai.frame
    """
    while True:
        try:
            if camera_index < 0 or camera_index >= len(master_controller.cameras_controller.cameras):
                break
            
            camera = master_controller.cameras_controller.cameras[camera_index]
            frame = camera.image_ai.frame
            
            if frame is not None:
                _, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
                frame_bytes = jpeg.tobytes()
                
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
                )
            
            await asyncio.sleep(0.01)
            
        except Exception as e:
            print(f"Error streaming AI camera {camera_index}: {e}")
            await asyncio.sleep(0.1)


@app.get("/api/cameras/stream-manual/{camera_index}")
async def stream_camera_manual(camera_index: int):
    """
    Stream cropped/resized camera feed as MJPEG for Manual Control.
    Source: camera.image_cropped_resized.frame
    """
    if camera_index < 0 or camera_index >= len(master_controller.cameras_controller.cameras):
        raise HTTPException(status_code=404, detail=f"Camera {camera_index} not found")
    
    return StreamingResponse(
        generate_camera_frames_manual(camera_index=camera_index),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )


@app.get("/api/cameras/stream-ai/{camera_index}")
async def stream_camera_ai(camera_index: int):
    """
    Stream AI-processed camera feed as MJPEG for AI Agent.
    Source: camera.image_ai.frame
    """
    if camera_index < 0 or camera_index >= len(master_controller.cameras_controller.cameras):
        raise HTTPException(status_code=404, detail=f"Camera {camera_index} not found")
    
    return StreamingResponse(
        generate_camera_frames_ai(camera_index=camera_index),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )


@app.get("/api/cameras/frame/{camera_index}")
async def get_camera_frame(camera_index: int):
    """
    Get a single frame from the camera as JPEG.
    Use this for polling-based updates.
    """
    if camera_index < 0 or camera_index >= len(master_controller.cameras_controller.cameras):
        raise HTTPException(status_code=404, detail=f"Camera {camera_index} not found")
    
    try:
        camera = master_controller.cameras_controller.cameras[camera_index]
        frame = camera.image.frame
        
        if frame is None:
            raise HTTPException(status_code=503, detail="No frame available")
        
        # Encode frame as JPEG
        _, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        
        return StreamingResponse(
            iter([jpeg.tobytes()]),
            media_type='image/jpeg',
            headers={'Cache-Control': 'no-cache, no-store, must-revalidate'}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.mount("/", StaticFiles(directory=BASE_DIR / "wwwroot/dist", html=True), name="static")

