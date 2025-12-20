import time
import cv2
import numpy as np
from .common import epsilon
from .yolomodels import YOLOModels


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
        # if crop and resize are enabled, crop and resize the frame
        if self._frame_valid:
            # if crop and resize are not enabled, return the frame as is
            if (self._crop_top == 0 and self._crop_left == 0 and \
                self._crop_bottom == 0 and self._crop_right == 0) and \
                (self._width == 0 or self._width == self._frame.shape[1]) and \
                (self._height == 0 or self._height == self._frame.shape[0]):
                return self._frame_valid, self._frame
            else:
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
    def __init__(self, *, parent, fps: int | None,crop_top: float, crop_left: float, crop_bottom: float, crop_right: float,
                 width: int, height: int, attention_polygons: list[list[tuple[float, float]]], model_name: str):
        # check if model name is valid
        if model_name not in YOLOModels().models:
            model_name = YOLOModels().default_model_name
        super().__init__(parent=parent, fps=fps, crop_top=crop_top, crop_left=crop_left, crop_bottom=crop_bottom, crop_right=crop_right,
                 width=width, height=height)
        self.attention_polygons = attention_polygons
        self._model_name = model_name
        self._model = YOLOModels().models[model_name]

    @property
    def model_name(self) -> str:
        return self._model_name

    @model_name.setter
    def model_name(self, value: str):
        if value not in YOLOModels().models:
            value = YOLOModels().default_model_name
        self._model_name = value
        self._model = YOLOModels().models[value]

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
        # if crop and resize are enabled, crop and resize the frame
        if self._frame_valid:
            # if crop and resize are not enabled, return the frame as is
            if (self._crop_top == 0 and self._crop_left == 0 and \
                self._crop_bottom == 0 and self._crop_right == 0) and \
                (self._width == 0 or self._width == self._frame.shape[1]) and \
                (self._height == 0 or self._height == self._frame.shape[0]):
                pass
            else:
                self._frame = self.crop_and_resize_frame(src_frame=self._frame)
            # run inference on the frame
            results = self._model(self._frame, verbose=False)
            # compute points of interest
            result = results[0]
            if hasattr(result, 'keypoints') and result.keypoints is not None:
                keypoints = result.keypoints.xy.cpu().numpy() if hasattr(result.keypoints.xy, 'cpu') else result.keypoints.xy
                self._frame = self.draw_eyes_nose(frame=self._frame, keypoints=keypoints)
        return self._frame_valid, self._frame

    def draw_eyes_nose(self, *, frame: np.ndarray, keypoints: np.ndarray, color_points=(0,0,255), color_lines=(0,255,0)):
        # COCO order: 0-nose, 1-left_eye, 2-right_eye, 3-left_ear, 4-right_ear
        # keypoints: [num_persons, num_keypoints, 2]
        green = (0, 255, 0)
        red = (0, 0, 255)
        blue = (255, 0, 0)
        for person in keypoints:
            nose = tuple(map(int, person[0]))
            left_eye = tuple(map(int, person[1]))
            right_eye = tuple(map(int, person[2]))
            left_ear = tuple(map(int, person[3])) if person.shape[0] > 3 and not np.any(np.isnan(person[3])) else None
            right_ear = tuple(map(int, person[4])) if person.shape[0] > 4 and not np.any(np.isnan(person[4])) else None
            # Arms: 5-left_shoulder, 6-right_shoulder, 7-left_elbow, 8-right_elbow, 9-left_wrist, 10-right_wrist
            left_shoulder = tuple(map(int, person[5])) if person.shape[0] > 5 and not np.any(np.isnan(person[5])) else None
            right_shoulder = tuple(map(int, person[6])) if person.shape[0] > 6 and not np.any(np.isnan(person[6])) else None
            left_hip = tuple(map(int, person[11])) if person.shape[0] > 11 and not np.any(np.isnan(person[11])) else None
            right_hip = tuple(map(int, person[12])) if person.shape[0] > 12 and not np.any(np.isnan(person[12])) else None

            # Draw points (all green)
            cv2.circle(frame, nose, 5, green, -1)
            cv2.circle(frame, left_eye, 5, green, -1)
            cv2.circle(frame, right_eye, 5, green, -1)
            if left_ear:
                cv2.circle(frame, left_ear, 5, green, -1)
            if right_ear:
                cv2.circle(frame, right_ear, 5, green, -1)
            if left_shoulder:
                cv2.circle(frame, left_shoulder, 5, green, -1)
            if right_shoulder:
                cv2.circle(frame, right_shoulder, 5, green, -1)
            if left_hip:
                cv2.circle(frame, left_hip, 5, green, -1)
            if right_hip:
                cv2.circle(frame, right_hip, 5, green, -1)
            # Draw lines
            cv2.line(frame, left_eye, nose, color_lines, 2)
            cv2.line(frame, right_eye, nose, color_lines, 2)
            if left_shoulder and right_shoulder:
                cv2.line(frame, left_shoulder, right_shoulder, color_lines, 2)
            if left_hip and right_hip:
                cv2.line(frame, left_hip, right_hip, color_lines, 2)

            # Compute g1 (center between arms/shoulders) and g2 (center between hips)
            g1 = None
            g2 = None
            alpha = None
            if left_shoulder and right_shoulder:
                g1_x = (left_shoulder[0] + right_shoulder[0]) / 2
                g1_y = (left_shoulder[1] + right_shoulder[1]) / 2
                g1 = (int(g1_x), int(g1_y))
            if left_hip and right_hip:
                g2_x = (left_hip[0] + right_hip[0]) / 2
                g2_y = (left_hip[1] + right_hip[1]) / 2
                g2 = (int(g2_x), int(g2_y))
            # Compute alpha as 1/4 from g1 to g2
            if g1 and g2:
                alpha_x = int(g1[0] + 0.25 * (g2[0] - g1[0]))
                alpha_y = int(g1[1] + 0.25 * (g2[1] - g1[1]))
                alpha = (alpha_x, alpha_y)
            # Draw g1, g2 in blue, alpha in red
            if g1:
                cv2.circle(frame, g1, 7, blue, -1)
            if g2:
                cv2.circle(frame, g2, 7, blue, -1)
            if alpha:
                cv2.circle(frame, alpha, 8, red, -1)

            # --- Existing beta logic below ---
            # Compute p1 (center between ears) and p2 (projection)
            p1 = None
            p2 = None
            beta = None
            if left_ear and right_ear:
                p1_x = (left_ear[0] + right_ear[0]) / 2
                p1_y = (left_ear[1] + right_ear[1]) / 2
                p1 = (int(p1_x), int(p1_y))
            if left_eye and right_eye and nose:
                eye_center_x = (left_eye[0] + right_eye[0]) / 2
                eye_center_y = (left_eye[1] + right_eye[1]) / 2
                dx = nose[0] - eye_center_x
                dy = nose[1] - eye_center_y
                p2_x = eye_center_x - dx
                p2_y = eye_center_y - dy
                p2 = (int(p2_x), int(p2_y))
            # Compute beta as center between p1 and p2 if both exist
            if p1 and p2:
                beta_x = int((p1[0] + p2[0]) / 2)
                beta_y = int((p1[1] + p2[1]) / 2)
                beta = (beta_x, beta_y)
            # Draw p1 and p2 in blue, beta in red
            if p1:
                cv2.circle(frame, p1, 6, blue, -1)
            if p2:
                cv2.circle(frame, p2, 6, blue, -1)
            if beta:
                print(f"Drawing beta at: {beta}")
                cv2.circle(frame, beta, 12, red, -1)
        return frame