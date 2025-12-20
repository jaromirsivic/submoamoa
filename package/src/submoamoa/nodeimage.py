import time
import cv2
import numpy as np
from .common import epsilon


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
        self._crop_top = crop_top
        self._crop_left = crop_left
        self._crop_bottom = crop_bottom
        self._crop_right = crop_right
        self._width = width
        self._height = height

    @property
    def crop_top(self) -> float:
        return self._crop_top
    
    @crop_top.setter
    def crop_top(self, value: float):
        self._crop_top = max(0, min(value, 1))

    @property
    def crop_left(self) -> float:
        return self._crop_left
    
    @crop_left.setter
    def crop_left(self, value: float):
        self._crop_left = max(0, min(value, 1))
        
    @property
    def crop_bottom(self) -> float:
        return self._crop_bottom
    
    @crop_bottom.setter
    def crop_bottom(self, value: float):
        self._crop_bottom = max(0, min(value, 1))
        
        
    @property
    def crop_right(self) -> float:
        return self._crop_right
    
    @crop_right.setter
    def crop_right(self, value: float):
        self._crop_right = max(0, min(value, 1))

    @property
    def width(self) -> int:
        return self._width
    
    @width.setter
    def width(self, value: int):
        self._width = max(0, value)

    @property
    def height(self) -> int:
        return self._height
    
    @height.setter
    def height(self, value: int):
        self._height = max(0, value)


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
        # if crop and resize are not enabled, return the frame as is
        if (self._crop_top == 0 and self._crop_left == 0 and \
            self._crop_bottom == 0 and self._crop_right == 0) and \
            (self._width == 0 or self._width == self._frame.shape[1]) and \
            (self._height == 0 or self._height == self._frame.shape[0]):
            return self._frame_valid, self._frame
        # if crop and resize are enabled, crop and resize the frame
        if self._frame_valid:
            self._frame = self.crop_and_resize_frame(src_frame=self._frame)
        return self._frame_valid, self._frame

    def crop_and_resize_frame(self, *, src_frame: np.ndarray) -> tuple[bool, np.ndarray]:
        """
        Crop and resize a frame.
        Parameters:
        src_frame : numpy.ndarray : The source frame.
        Returns:
        bool : True if the frame was cropped and resized successfully, False otherwise.
        np.ndarray : The cropped and resized frame.
        """
        # convert crop coordinates to pixels
        # crop coordinates are between 0 and 1
        crop_top_px = int(self._crop_top * src_frame.shape[0])
        crop_left_px = int(self._crop_left * src_frame.shape[1])
        crop_bottom_px = int(self._crop_bottom * src_frame.shape[0])
        crop_right_px = int(self._crop_right * src_frame.shape[1])
        # calculate source frame coordinates in pixels
        src_x = crop_left_px
        src_y = crop_top_px
        src_width = src_frame.shape[1] - crop_right_px 
        src_height = src_frame.shape[0] - crop_bottom_px
        # check if source frame coordinates are valid
        is_valid = True
        if src_x < 0 or src_x > src_frame.shape[1]:
            is_valid = False
        if src_y < 0 or src_y > src_frame.shape[0]:
            is_valid = False
        if src_width <= 0:
            is_valid = False
        if src_height <= 0:
            is_valid = False
        if src_x + src_width > src_frame.shape[1]:
            is_valid = False
        if src_y + src_height > src_frame.shape[0]:
            is_valid = False
        # if source frame coordinates are not valid, return copy of the source frame
        if not is_valid:
            return src_frame.copy()
        # if source frame coordinates are valid, return cropped and resized frame
        return cv2.resize(src_frame[src_y:src_y + src_height, src_x:src_x + src_width], (self._width, self._height))


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
        # if crop and resize are not enabled, return the frame as is
        if (self._crop_top == 0 and self._crop_left == 0 and \
            self._crop_bottom == 0 and self._crop_right == 0) and \
            (self._width == 0 or self._width == self._frame.shape[1]) and \
            (self._height == 0 or self._height == self._frame.shape[0]):
            return self._frame_valid, self._frame
        # if crop and resize are enabled, crop and resize the frame
        if self._frame_valid:
            self._frame = self.crop_and_resize_frame(src_frame=self._frame)
        return self._frame_valid, self._frame