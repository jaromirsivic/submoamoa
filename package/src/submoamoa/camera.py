from pathlib import Path
from typing import Any
from .camerapostprocessing import NodeImage, NodeImageCroppedResized, NodeImageAI
import time
import cv2
import numpy as np


FLIP_HORIZONTAL = 1
FLIP_VERTICAL = 0
FLIP_BOTH = -1

class Camera:
    def __init__(self, *, index: int, settings: dict = None):
        # OpenCV camera object
        self._camera:cv2.VideoCapture = None
        # Camera index
        self._index = index
        # Camera settings
        self._settings = settings
        # Camera name
        self._name = f'{index}: NO CAMERA DETECTED'
        # Supported resolutions
        self.supported_resolutions = []
        # Flip and rotate settings
        self._flip_horizontal = False
        self._flip_vertical = False
        self._rotate = 0
        # Is camera active
        self._active = False
        # Last frame
        self._frame = None
        # Create post processing filters
        # NodeImage object
        self._image: NodeImage = NodeImage(parent=self, fps=None)
        # NodeImageCroppedResized object
        self._image_cropped_resized: NodeImageCroppedResized = NodeImageCroppedResized(
            parent=self, fps=None,
            crop_top=0, crop_left=0, crop_bottom=0, crop_right=0,
            width=0, height=0
        )
        # NodeImageAI object
        self._image_ai: NodeImageAI = NodeImageAI(
            parent=self, fps=None,
            crop_top=0, crop_left=0, crop_bottom=0, crop_right=0,
            width=0, height=0,
            attention_polygons=[],
            model_name="yolo11x-pose"
        )
        # open camera
        self.open()

    # Basic properties

    @property
    def camera(self) -> cv2.VideoCapture:
        return self._camera

    @property
    def active(self) -> bool:
        return self._active

    @property
    def index(self) -> int:
        return self._index
    
    @property
    def name(self) -> str:
        return self._name

    @property
    def fps(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        result = self._camera.get(cv2.CAP_PROP_FPS)
        result = min(1000, max(1, result))
        return result

    @property
    def width(self) -> int:
        if not self._active or self._camera is None:
            return -1
        return int(self._camera.get(cv2.CAP_PROP_FRAME_WIDTH))
    
    @width.setter
    def width(self, value: int):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_FRAME_WIDTH, value)

    @property
    def height(self) -> int:
        if not self._active or self._camera is None:
            return -1
        return int(self._camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    @height.setter
    def height(self, value: int):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_FRAME_HEIGHT, value)

    @fps.setter
    def fps(self, value: float):
        if self._active and self._camera is not None:
            value = min(1000, max(1, value))
            self._camera.set(cv2.CAP_PROP_FPS, value)
            # Reset the post processing filters fps
            self.reset_nodes_fps()

    @property
    def bitrate(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_BITRATE)

    @bitrate.setter
    def bitrate(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_BITRATE, value)

    @property
    def buffer_size(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_BUFFERSIZE)

    @buffer_size.setter
    def buffer_size(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_BUFFERSIZE, value)

    # Post processing filters

    @property
    def image(self) -> NodeImage:
        return self._image

    @property
    def image_cropped_resized(self) -> NodeImageCroppedResized:
        return self._image_cropped_resized

    @property
    def image_ai(self) -> NodeImageAI:
        return self._image_ai

    def reset_nodes_fps(self):
        """
        Reset the fps of the nodes to twice the fps of the camera.
        """
        fps = self.fps
        self._image.fps = fps * 2
        self._image_cropped_resized.fps = fps * 2
        self._image_ai.fps = fps * 2

    # Flip and rotate settings

    @property
    def flip_horizontal(self) -> bool:
        return self._flip_horizontal
    
    @flip_horizontal.setter
    def flip_horizontal(self, value: bool):
        self._flip_horizontal = value
    
    @property
    def flip_vertical(self) -> bool:
        return self._flip_vertical
    
    @flip_vertical.setter
    def flip_vertical(self, value: bool):
        self._flip_vertical = value
    
    @property
    def rotate(self) -> int:
        return self._rotate
    
    @rotate.setter
    def rotate(self, value: int):
        self._rotate = value

    # Camera settings

    @property
    def brightness(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_BRIGHTNESS)

    @brightness.setter
    def brightness(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_BRIGHTNESS, value)

    @property
    def contrast(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_CONTRAST)

    @contrast.setter
    def contrast(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_CONTRAST, value)

    @property
    def hue(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_HUE)

    @hue.setter
    def hue(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_HUE, value)

    @property
    def saturation(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_SATURATION)

    @saturation.setter
    def saturation(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_SATURATION, value)

    @property
    def sharpness(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_SHARPNESS)

    @sharpness.setter
    def sharpness(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_SHARPNESS, value)

    @property
    def gamma(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_GAMMA)

    @gamma.setter
    def gamma(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_GAMMA, value)

    @property
    def white_balance_temperature(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_WB_TEMPERATURE)

    @white_balance_temperature.setter
    def white_balance_temperature(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_WB_TEMPERATURE, value)

    @property
    def backlight(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_BACKLIGHT)

    @backlight.setter
    def backlight(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_BACKLIGHT, value)

    @property
    def gain(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_GAIN)

    @gain.setter
    def gain(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_GAIN, value)

    @property
    def focus(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_FOCUS)

    @focus.setter
    def focus(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_FOCUS, value)

    @property
    def exposure(self) -> float:
        if not self._active or self._camera is None:
            return -1.0
        return self._camera.get(cv2.CAP_PROP_EXPOSURE)

    @exposure.setter
    def exposure(self, value: float):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_EXPOSURE, value)

    # @property
    # def auto_brightness(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_BRIGHTNESS))

    # @auto_brightness.setter
    # def auto_brightness(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_BRIGHTNESS, 1.0 if value else 0.0)

    # @property
    # def auto_contrast(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_CONTRAST))

    # @auto_contrast.setter
    # def auto_contrast(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_CONTRAST, 1.0 if value else 0.0)

    # @property
    # def auto_hue(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_HUE))

    # @auto_hue.setter
    # def auto_hue(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_HUE, 1.0 if value else 0.0)

    # @property
    # def auto_saturation(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_SATURATION))

    # @auto_saturation.setter
    # def auto_saturation(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_SATURATION, 1.0 if value else 0.0)

    # @property
    # def auto_sharpness(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_SHARPNESS))

    # @auto_sharpness.setter
    # def auto_sharpness(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_SHARPNESS, 1.0 if value else 0.0)

    # @property
    # def auto_gamma(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_GAMMA))

    # @auto_gamma.setter
    # def auto_gamma(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_GAMMA, 1.0 if value else 0.0)

    @property
    def auto_white_balance_temperature(self) -> bool:
        if not self._active or self._camera is None:
            return False
        return bool(self._camera.get(cv2.CAP_PROP_AUTO_WB))

    @auto_white_balance_temperature.setter
    def auto_white_balance_temperature(self, value: bool):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_AUTO_WB, 1.0 if value else 0.0)

    # @property
    # def auto_backlight_compensation(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_BACKLIGHT_COMPENSATION))

    # @auto_backlight_compensation.setter
    # def auto_backlight_compensation(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_BACKLIGHT_COMPENSATION, 1.0 if value else 0.0)

    # @property
    # def auto_gain(self) -> bool:
    #     if not self._active or self._camera is None:
    #         return False
    #     return bool(self._camera.get(cv2.CAP_PROP_AUTO_GAIN))

    # @auto_gain.setter
    # def auto_gain(self, value: bool):
    #     if self._active and self._camera is not None:
    #         self._camera.set(cv2.CAP_PROP_AUTO_GAIN, 1.0 if value else 0.0)

    @property
    def auto_focus(self) -> bool:
        if not self._active or self._camera is None:
            return False
        return bool(self._camera.get(cv2.CAP_PROP_AUTOFOCUS))

    @auto_focus.setter
    def auto_focus(self, value: bool):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_AUTOFOCUS, 1.0 if value else 0.0)

    @property
    def auto_exposure(self) -> bool:
        if not self._active or self._camera is None:
            return False
        return bool(self._camera.get(cv2.CAP_PROP_AUTO_EXPOSURE))

    @auto_exposure.setter
    def auto_exposure(self, value: bool):
        if self._active and self._camera is not None:
            self._camera.set(cv2.CAP_PROP_AUTO_EXPOSURE, 1.0 if value else 0.0)

    def open(self):
        self._camera = cv2.VideoCapture(self._index)
        if not self._camera.isOpened():
            self._active = False
            return False
        # Set active
        self._active = True
        # Set name
        self._name = f'{self._index}: GUID_{self._camera.get(cv2.CAP_PROP_GUID)}'

        # Check supported resolutions
        common_resolutions = [
            (320, 240),
            (640, 480),
            (800, 600),
            (960, 720),
            (1024, 768),
            (1280, 960),
            (1280, 720),
            (1600, 1200),
            (1920, 1080),
            (2560, 1440),
            (3200, 1800),
            (3840, 2160),
            (4096, 2160),
            (5120, 2880),
            (6016, 3384),
            (7680, 4320),
            (8192, 4608)
        ]
        supported_resolutions = []
        # Check if supported resolutions are available
        for width, height in common_resolutions:
            self.width = width
            self.height = height
            if self.width == width and self.height == height:
                supported_resolutions.append({"width": width, "height": height})
        self.supported_resolutions = supported_resolutions
        # Reset the fps of the nodes (post processing filters)
        self.reset_nodes_fps()
        return True

    def close(self):
        if not self._active:
            return
        self._active = False
        self._camera.release()
        self._camera = None

    def __del__(self):
        self.close()

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "name": self.name,
            "supported_resolutions": self.supported_resolutions,
            "width": self.width,
            "height": self.height,
            "fps": self.fps,
            "bitrate": self.bitrate,
            "buffer_size": self.buffer_size,
            "flip_horizontal": self.flip_horizontal,
            "flip_vertical": self.flip_vertical,
            "rotate": self.rotate,
            "brightness": self.brightness,
            "contrast": self.contrast,
            "hue": self.hue,
            "saturation": self.saturation,
            "sharpness": self.sharpness,
            "gamma": self.gamma,
            "white_balance_temperature": self.white_balance_temperature,
            "backlight_compensation": self.backlight,
            "gain": self.gain,
            "focus": self.focus,
            "exposure": self.exposure,
            "auto_white_balance_temperature": self.auto_white_balance_temperature,
            "auto_focus": self.auto_focus,
            "auto_exposure": self.auto_exposure
        }

    def reload_settings(self):
        if not self._active or self._camera is None:
            return
        self.width = self._settings["width"]
        self.height = self._settings["height"]
        self.fps = self._settings["fps"]
        self.bitrate = self._settings["bitrate"]
        self.buffer_size = self._settings["buffer_size"]
        self.flip_horizontal = self._settings["flip_horizontal"]
        self.flip_vertical = self._settings["flip_vertical"]
        self.rotate = self._settings["rotate"]
        self.brightness = self._settings["brightness"]
        self.contrast = self._settings["contrast"]
        self.hue = self._settings["hue"]
        self.saturation = self._settings["saturation"]
        self.sharpness = self._settings["sharpness"]
        self.gamma = self._settings["gamma"]
        self.white_balance_temperature = self._settings["white_balance_temperature"]
        self.backlight = self._settings["backlight"]
        self.gain = self._settings["gain"]
        self.focus = self._settings["focus"]
        self.exposure = self._settings["exposure"]
        self.auto_white_balance_temperature = self._settings["auto_white_balance_temperature"]
        self.auto_focus = self._settings["auto_focus"]
        self.auto_exposure = self._settings["auto_exposure"]

    @property
    def settings(self) -> dict:
        return self._settings

    @settings.setter
    def settings(self, value: dict):
        self._settings = value
        self.reload_settings()

    @property
    def frame(self) -> np.ndarray:
        ret_value, ret_frame = self.get_frame()
        if ret_value:
            return ret_frame
        return None

    def get_frame(self) -> tuple[bool, np.ndarray]:
        # if camera is not active or camera is not opened, return False, None
        if not self._active or self._camera is None:
            return False, None
        # read frame from camera
        ret, frame = self._camera.read()
        if not ret:
            return False, None
        self._frame = frame
        # Flip camera input horizontally and vertically
        if self._flip_horizontal and self._flip_vertical:
            frame = cv2.flip(frame, FLIP_BOTH)
        elif self._flip_horizontal:
            frame = cv2.flip(frame, FLIP_HORIZONTAL)
        elif self._flip_vertical:
            frame = cv2.flip(frame, FLIP_VERTICAL)
        # Rotate camera input
        if self._rotate == 90:
            frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
        elif self._rotate == 180:
            frame = cv2.rotate(frame, cv2.ROTATE_180)
        elif self._rotate == 270:
            frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
        return True, frame