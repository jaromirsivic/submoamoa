from pathlib import Path
from typing import Any
from .camera import Camera
from .common import get_settings
import time
import cv2
import numpy as np

class CamerasController:
    _singleton = None

    def __new__(cls, *args, **kwargs):
        if not cls._singleton:
            cls._singleton = super(CamerasController, cls).__new__(cls, *args, **kwargs)
        return cls._singleton

    def __init__(self):
        # List of cameras
        self._cameras: list[Camera] = []
        self.reset()

    @property
    def cameras(self) -> list[Camera]:
        return self._cameras

    def reset(self, *, max_index=8):
        """
        Reload the list of cameras.
        Parameters:
        max_index : int : The maximum index of the cameras to reload.
        """
        settings = get_settings()
        for camera in self._cameras:
            camera.close()
        #self._cameras = [Camera(index=i) for i in range(max_index)]
        for i in range(max_index):
            if "cameras" in settings and i < len(settings["cameras"]):
                camera_settings = settings["cameras"][i].get("general", {})
                image_cropped_resized_settings = settings["cameras"][i].get("manualControl", {})
                image_ai_settings = settings["cameras"][i].get("aiControl", {})
                self._cameras.append(Camera(index=i, settings=camera_settings, image_cropped_resized_settings=image_cropped_resized_settings, image_ai_settings=image_ai_settings))
            else:
                self._cameras.append(Camera(index=i))
        for camera in self._cameras:
            camera.open()
            # set the settings of the camera from the settings.json
            if "cameras" in settings and camera.index < len(settings["cameras"]):
                camera.settings = settings["cameras"][camera.index].get("general", {})
                camera.image_cropped_resized_settings = settings["cameras"][camera.index].get("manualControl", {})
                camera.image_ai_settings = settings["cameras"][camera.index].get("aiControl", {})


def bitblt_frame(*, src_frame: np.ndarray, src_x: int, src_y: int, src_width: int, src_height: int,
                 dst_width: int, dst_height: int) -> np.ndarray:
    """
    Bitblt a frame from the source frame to the destination frame.
    Parameters:
    src_frame : numpy.ndarray : The source frame.
    src_x : int : The x coordinate of the source frame.
    src_y : int : The y coordinate of the source frame.
    src_width : int : The width of the source frame.
    src_height : int : The height of the source frame.
    dst_width : int : The width of the destination frame.
    dst_height : int : The height of the destination frame.

    Returns:
    numpy.ndarray : The destination frame.
    """
    if src_frame.shape[1] >= src_x + src_width and src_frame.shape[0] >= src_y + src_height:
        cropped_frame = src_frame[src_y:src_y + src_height, src_x:src_x + src_width]
    else:
        # cropped frame is the copy of the source frame
        cropped_frame = src_frame.copy()
    return cv2.resize(cropped_frame, (dst_width, dst_height))