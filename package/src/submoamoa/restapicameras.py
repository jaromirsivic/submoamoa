from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import cv2
from . import settingscontroller
from .context import master_controller

router = APIRouter()

class CameraSettings(BaseModel):
    index: int
    name: str = ""
    width: int
    height: int
    fps: float
    flip_horizontal: bool
    flip_vertical: bool
    rotate: int
    brightness: float
    contrast: float
    hue: float
    saturation: float
    sharpness: float
    gamma: float
    white_balance_temperature: float
    backlight: float
    gain: float
    focus: float
    exposure: float
    auto_white_balance_temperature: bool
    auto_focus: bool
    auto_exposure: bool
    saveToDisk: bool = False

class ManualControlSettings(BaseModel):
    index: int
    crop_top: float
    crop_left: float
    crop_bottom: float
    crop_right: float
    width: int
    height: int
    static_reticle_x: float
    static_reticle_y: float
    static_reticle_color: str
    static_reticle_size: float
    saveToDisk: bool = False

@router.get("/api/cameras/list")
async def get_cameras_list_endpoint():
    """Get connected cameras info and general settings"""
    settings = await settingscontroller.get_settings()
    general_settings = settings.get("general", {})
    
    input_devices = []
    
    for cam in master_controller.cameras_controller.cameras:
        device_info = cam.to_dict()
        
        # Add labels to supported resolutions for frontend ComboBox
        resolutions_with_labels = []
        for res in device_info["supported_resolutions"]:
             resolutions_with_labels.append({
                 "width": res["width"],
                 "height": res["height"],
                 "label": f"{res['width']} x {res['height']}"
             })
        device_info["supported_resolutions"] = resolutions_with_labels
        
        # Add image_cropped_resized settings (Manual Control)
        device_info["manual_control"] = cam.image_cropped_resized.to_dict()
        
        # Add image_ai settings (AI Agent)
        device_info["ai_agent"] = cam.image_ai.to_dict()
             
        input_devices.append(device_info)
        
    return {
        **general_settings,
        "input_devices": input_devices
    }

@router.get("/api/cameras/primary")
async def get_primary_camera_endpoint():
    """Get the primary camera configuration"""
    settings = await settingscontroller.get_settings()
    primary_camera = settings.get("primaryCamera", {})
    return {"success": True, "primaryCamera": primary_camera}

@router.post("/api/reset")
async def reset_cameras_endpoint():
    """Reset camera settings to defaults"""
    # Reset in-memory settings for all cameras
    for camera in master_controller.cameras_controller.cameras:
        camera.reset_settings()

    # Update settings.json to remove general section for each camera
    try:
        current_settings = await settingscontroller.get_settings()
        if "cameras" in current_settings:
            for camera_config in current_settings["cameras"]:
                if "general" in camera_config:
                    del camera_config["general"]
            
            await settingscontroller.save_settings(current_settings)
    except Exception as e:
        print(f"Error resetting settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    master_controller.cameras_controller.reset()
    return {"success": True}

@router.post("/api/cameras/savecamera")
async def save_camera_settings(settings: CameraSettings):
    """
    Save or apply camera settings.
    If saveToDisk is True, saves to settings.json.
    Always applies settings to the running camera instance.
    """
    try:
        # Find the camera by index
        camera = None
        for cam in master_controller.cameras_controller.cameras:
            if cam.index == settings.index:
                camera = cam
                break
        
        if not camera:
            raise HTTPException(status_code=404, detail=f"Camera with index {settings.index} not found")

        # Apply settings to the running camera instance
        camera.settings = settings.model_dump()
        # camera.width = settings.width
        # camera.height = settings.height
        # camera.fps = settings.fps
        # camera.flip_horizontal = settings.flip_horizontal
        # camera.flip_vertical = settings.flip_vertical
        # camera.rotate = settings.rotate
        # camera.brightness = settings.brightness
        # camera.contrast = settings.contrast
        # camera.hue = settings.hue
        # camera.saturation = settings.saturation
        # camera.sharpness = settings.sharpness
        # camera.gamma = settings.gamma
        # camera.white_balance_temperature = settings.white_balance_temperature
        # camera.backlight = settings.backlight_compensation
        # camera.gain = settings.gain
        # camera.focus = settings.focus
        # camera.exposure = settings.exposure
        # camera.auto_white_balance_temperature = settings.auto_white_balance_temperature
        # camera.auto_focus = settings.auto_focus
        # camera.auto_exposure = settings.auto_exposure

        # If saveToDisk is True, update settings.json
        if settings.saveToDisk:
            current_settings = await settingscontroller.get_settings()
            
            # Ensure "cameras" list exists in settings
            if "cameras" not in current_settings:
                current_settings["cameras"] = []
            
            # Find or create the camera config in settings
            camera_config = None
            for conf in current_settings["cameras"]:
                if conf.get("index") == settings.index:
                    camera_config = conf
                    break
            
            if not camera_config:
                camera_config = {"index": settings.index}
                current_settings["cameras"].append(camera_config)
            
            # Save Primary Camera info if name is provided (it's the currently selected one being saved)
            if settings.name:
                current_settings["primaryCamera"] = {
                    "index": settings.index,
                    "name": settings.name
                }

            # Update general settings for this camera
            camera_config["general"] = {
                "width": settings.width,
                "height": settings.height,
                "fps": settings.fps,
                "flip_horizontal": settings.flip_horizontal,
                "flip_vertical": settings.flip_vertical,
                "rotate": settings.rotate,
                "brightness": settings.brightness,
                "contrast": settings.contrast,
                "hue": settings.hue,
                "saturation": settings.saturation,
                "sharpness": settings.sharpness,
                "gamma": settings.gamma,
                "white_balance_temperature": settings.white_balance_temperature,
                "backlight": settings.backlight,
                "gain": settings.gain,
                "focus": settings.focus,
                "exposure": settings.exposure,
                "auto_white_balance_temperature": settings.auto_white_balance_temperature,
                "auto_focus": settings.auto_focus,
                "auto_exposure": settings.auto_exposure
            }
            
            await settingscontroller.save_settings(current_settings)

        return {"success": True}

    except Exception as e:
        print(f"Error saving camera settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/cameras/savemanualcontrol")
async def save_manual_control_settings(settings: ManualControlSettings):
    """
    Save or apply manual control (image_cropped_resized) settings.
    If saveToDisk is True, saves to settings.json.
    Always applies settings to the running camera instance.
    """
    try:
        # Find the camera by index
        camera = None
        for cam in master_controller.cameras_controller.cameras:
            if cam.index == settings.index:
                camera = cam
                break
        
        if not camera:
            raise HTTPException(status_code=404, detail=f"Camera with index {settings.index} not found")

        # Apply settings to the running camera instance
        # Crop values are in percent (0-100), convert to 0-1 range for backend
        new_settings = {
            "crop_top": settings.crop_top / 100.0,
            "crop_left": settings.crop_left / 100.0,
            "crop_bottom": settings.crop_bottom / 100.0,
            "crop_right": settings.crop_right / 100.0,
            "width": settings.width,
            "height": settings.height,
            "static_reticle_x": settings.static_reticle_x,
            "static_reticle_y": settings.static_reticle_y,
            "static_reticle_color": settings.static_reticle_color,
            "static_reticle_size": settings.static_reticle_size
        }
        camera.image_cropped_resized.settings = new_settings

        # If saveToDisk is True, update settings.json
        if settings.saveToDisk:
            current_settings = await settingscontroller.get_settings()
            
            # Ensure "cameras" list exists in settings
            if "cameras" not in current_settings:
                current_settings["cameras"] = []
            
            # Find or create the camera config in settings
            camera_config = None
            for conf in current_settings["cameras"]:
                if conf.get("index") == settings.index:
                    camera_config = conf
                    break
            
            if not camera_config:
                camera_config = {"index": settings.index}
                current_settings["cameras"].append(camera_config)
            
            # Update manual control settings for this camera
            camera_config["manual_control"] = {
                "crop_top": settings.crop_top / 100.0,
                "crop_left": settings.crop_left / 100.0,
                "crop_bottom": settings.crop_bottom / 100.0,
                "crop_right": settings.crop_right / 100.0,
                "width": settings.width,
                "height": settings.height,
                "static_reticle_x": settings.static_reticle_x,
                "static_reticle_y": settings.static_reticle_y,
                "static_reticle_color": settings.static_reticle_color,
                "static_reticle_size": settings.static_reticle_size
            }
            
            await settingscontroller.save_settings(current_settings)

        return {"success": True}

    except Exception as e:
        print(f"Error saving manual control settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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

@router.get("/api/cameras/stream/{camera_index}")
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


@router.get("/api/cameras/stream-manual/{camera_index}")
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


@router.get("/api/cameras/stream-ai/{camera_index}")
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


@router.get("/api/cameras/frame/{camera_index}")
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
