from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import asyncio
import cv2
from . import settingscontroller
from .context import master_controller

router = APIRouter()

@router.get("/api/cameras/list")
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
        device_info = cam.to_dict()
        # device_info["value"] = cam.index
        # device_info["label"] = cam.name
        
        # Add labels to supported resolutions for frontend ComboBox
        resolutions_with_labels = []
        for res in device_info["supported_resolutions"]:
             resolutions_with_labels.append({
                 "width": res["width"],
                 "height": res["height"],
                 "label": f"{res['width']} x {res['height']}"
             })
        device_info["supported_resolutions"] = resolutions_with_labels
             
        input_devices.append(device_info)
        
    return {
        **general_settings,
        "input_devices": input_devices
    }

@router.post("/api/reset")
async def reset_cameras_endpoint():
    """Reset camera list"""
    master_controller.cameras_controller.reset()
    return {"success": True}

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

