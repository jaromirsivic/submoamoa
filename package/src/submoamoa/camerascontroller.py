#from fastapi import FastAPI
#from fastapi.staticfiles import StaticFiles
#from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Any
#from ultralytics import YOLO
from .camera import Camera
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
        self.reload_list_of_cameras()

    @property
    def cameras(self) -> list[Camera]:
        return self._cameras

    def reload_list_of_cameras(self, *, max_index=8):
        """
        Reload the list of cameras.
        Parameters:
        max_index : int : The maximum index of the cameras to reload.
        """
        self._cameras = []
        for i in range(max_index):
            self._cameras.append(Camera(index=i))
            # Open and close camera to get all properties
            self._cameras[i].open()
            #self._cameras[i].close()


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