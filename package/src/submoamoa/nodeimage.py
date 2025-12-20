import time
import cv2
import numpy as np


class NodeImage:
    def __init__(self, *, parent, fps: int | None):
        self.parent = parent
        self._fps = 1000
        self._frame_interval = 1 / self._fps
        self._last_frame_time = 0
        self._frame_count = 0
        self._start_time = time.time()
        # resets all values
        self.fps = fps if fps is not None else 60
        self._frame_valid = False
        self._frame = None

    @property
    def frame(self) -> np.ndarray:
        return self._frame

    @property
    def fps(self) -> int:
        return self._fps

    @fps.setter
    def fps(self, value: int):
        if value < 0.001:
            value = 1
        self._fps = value        
        self._frame_interval = 1 / value
        self._last_frame_time = 0

    @property
    def frame_interval(self) -> float:
        return self._frame_interval

    @property
    def last_frame_time(self) -> float:
        return self._last_frame_time

    @property
    def frame_count(self) -> int:
        return self._frame_count

    @property
    def start_time(self) -> float:
        return self._start_time

    def get_frame(self) -> tuple[bool, np.ndarray]:
        now = time.time()
        # if last frame was valid and not enough time has passed since last frame
        # return False, None
        if self._frame_valid and now - self._last_frame_time < self._frame_interval:
            return True, self._frame
        # otherwise, get frame from parent
        self._last_frame_time = now
        self._frame_count += 1
        self._frame_valid, self._frame = self.parent.get_frame()
        # custom logic goes here
        return self._frame_valid, self._frame


class NodeImageCroppedResized(NodeImage):
    def __init__(self, *, parent, fps: int | None, crop_top: float, crop_left: float, crop_bottom: float, crop_right: float,
                 width: int, height: int):
        super().__init__(parent=parent, fps=fps)
        self.crop_top = crop_top
        self.crop_left = crop_left
        self.crop_bottom = crop_bottom
        self.crop_right = crop_right
        self.width = width
        self.height = height

    def get_frame(self) -> tuple[bool, np.ndarray]:
        now = time.time()
        # if last frame was valid and not enough time has passed since last frame
        # return False, None
        if self._frame_valid and now - self._last_frame_time < self._frame_interval:
            return True, self._frame
        # otherwise, get frame from parent
        self._last_frame_time = now
        self._frame_count += 1
        self._frame_valid, self._frame = self.parent.get_frame()
        # custom logic goes here
        return self._frame_valid, self._frame


class NodeImageAI(NodeImageCroppedResized):
    def __init__(self, *, parent, fps: int | None, crop_top: float, crop_left: float, crop_bottom: float, crop_right: float,
                 width: int, height: int, attention_points: list[tuple[float, float]]):
        super().__init__(parent=parent, fps=fps, crop_top=crop_top, crop_left=crop_left, crop_bottom=crop_bottom, crop_right=crop_right,
                 width=width, height=height)
        self.attention_points = attention_points

    def get_frame(self) -> tuple[bool, np.ndarray]:
        now = time.time()
        # if last frame was valid and not enough time has passed since last frame
        # return False, None
        if self._frame_valid and now - self._last_frame_time < self._frame_interval:
            return True, self._frame
        # otherwise, get frame from parent
        self._last_frame_time = now
        self._frame_count += 1
        self._frame_valid, self._frame = self.parent.get_frame()
        # custom logic goes here
        return self._frame_valid, self._frame