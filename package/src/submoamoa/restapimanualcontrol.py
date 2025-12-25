"""
REST API for Manual Control page motor settings.
Handles loading and saving motor visibility settings for the Manual Control interface.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from . import settingscontroller

router = APIRouter()


class MotorConfig(BaseModel):
    """Configuration for a single motor in manual control."""
    index: int
    enabled: bool
    name: str = ""


class ManualControlMotorsResponse(BaseModel):
    """Response model for getting manual control motors."""
    success: bool
    motors: List[MotorConfig]


class SaveMotorVisibilityRequest(BaseModel):
    """Request model for saving motor visibility settings."""
    motors: List[dict]


@router.get("/api/manualcontrol/motors")
async def get_manual_control_motors():
    """
    Get motor settings for Manual Control page.
    Returns at most 4 motors with their names (from motors array) and enabled status.
    """
    try:
        settings = await settingscontroller.get_settings()
        
        # Get manualControl.motors array (max 4)
        manual_control = settings.get("manualControl", {})
        motor_configs = manual_control.get("motors", [])[:4]  # Limit to 4 motors
        
        # Get motors array for names
        motors_list = settings.get("motors", [])
        
        result = []
        for config in motor_configs:
            motor_index = config.get("index", 0)
            enabled = config.get("enabled", True)
            
            # Get motor name from motors array using index
            motor_name = ""
            if 0 <= motor_index < len(motors_list):
                motor_name = motors_list[motor_index].get("name", f"Motor {motor_index}")
            else:
                motor_name = f"Motor {motor_index}"
            
            result.append({
                "index": motor_index,
                "enabled": enabled,
                "name": motor_name
            })
        
        return {"success": True, "motors": result}
    
    except Exception as e:
        print(f"Error getting manual control motors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/manualcontrol/motors")
async def save_manual_control_motors(*, request: SaveMotorVisibilityRequest):
    """
    Save motor visibility settings for Manual Control page.
    Updates the enabled status of motors in settings.json -> manualControl -> motors.
    """
    try:
        current_settings = await settingscontroller.get_settings()
        
        # Ensure manualControl section exists
        if "manualControl" not in current_settings:
            current_settings["manualControl"] = {}
        
        # Get current motors config or create empty
        current_motors = current_settings["manualControl"].get("motors", [])
        
        # Update enabled status for each motor in the request
        for motor_update in request.motors:
            motor_index = motor_update.get("index")
            enabled = motor_update.get("enabled", True)
            
            # Find and update existing motor config
            found = False
            for motor_config in current_motors:
                if motor_config.get("index") == motor_index:
                    motor_config["enabled"] = enabled
                    found = True
                    break
            
            # Add new motor config if not found
            if not found:
                current_motors.append({
                    "index": motor_index,
                    "enabled": enabled
                })
        
        # Limit to 4 motors and save
        current_settings["manualControl"]["motors"] = current_motors[:4]
        
        await settingscontroller.save_settings(current_settings)
        
        return {"success": True}
    
    except Exception as e:
        print(f"Error saving manual control motors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

