from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Any
from ultralytics import YOLO
import time
import cv2


class CameraController:
    _singleton = None

    def __new__(cls, *args, **kwargs):
        if not cls._singleton:
            cls._singleton = super(CameraController, cls).__new__(cls, *args, **kwargs)
        return cls._singleton

    def __init__(self):
        # Load models
        # self.models = {}
        # self.models['n'] = YOLO("yolo11n-pose.pt")
        # self.models['s'] = YOLO("yolo11s-pose.pt")
        # self.models['m'] = YOLO("yolo11m-pose.pt")
        # self.models['l'] = YOLO("yolo11l-pose.pt")  
        # self.models['x'] = YOLO("yolo11x-pose.pt")
        # Initialize camera
        self.camera = None
        self.window_name = "YOLO V11 Custom Visualization"

    def list_cameras(self):
        result = []
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap is not None and cap.isOpened():
                width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
                height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
                fps = cap.get(cv2.CAP_PROP_FPS)
                bitrate = cap.get(cv2.CAP_PROP_BITRATE)
                focus = cap.get(cv2.CAP_PROP_FOCUS)
                result.append({
                    "index": i,
                    "width": int(width),
                    "height": int(height),
                    "fps": fps,
                    "bitrate": bitrate,
                    "focus": focus
                }) 
                cap.release()
        return result

    def getPicture(self, index: int):
        cap = cv2.VideoCapture(index)
        if not cap.isOpened():
            raise Exception("Could not open camera")
        ret, frame = cap.read()
        cap.release()
        return frame

        # try:
        #     selected = int(input("Select camera index to use (default 0): ") or 0)
        #     except Exception:
        #         selected = 0
        #     camera = cv2.VideoCapture(selected)
        #     if not camera.isOpened():
        #         print("Error: Could not open webcam.")
        #         return

        #     window_name = "YOLO V11 Custom Visualization"
        #     cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        #     cv2.resizeWindow(window_name, 1024, 768)
        #     while True:
        #         success, frame = camera.read()
        #         if not success:
        #             break
        #         # Run inference
        #         results = model(frame, verbose=False)
        #         result = results[0]
        #         if hasattr(result, 'keypoints') and result.keypoints is not None:
        #             keypoints = result.keypoints.xy.cpu().numpy() if hasattr(result.keypoints.xy, 'cpu') else result.keypoints.xy
        #             frame = draw_eyes_nose(frame, keypoints)
        #         cv2.imshow(window_name, frame)
        #         if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
        #             break
        #     camera.release()
        #     cv2.destroyAllWindows()