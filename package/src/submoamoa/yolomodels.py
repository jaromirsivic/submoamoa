import datetime
from ultralytics import YOLO
from pathlib import Path

class YOLOModels:
    """
    Singleton class to manage YOLO models.
    """
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(YOLOModels, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        #path of a directory of this file
        this_file_path = Path(__file__).resolve()
        model_dir = this_file_path.parent / "ai_models" / "yolo"
        self.models = {
            "yolo11x-pose": YOLO(model_dir / "yolo11x-pose.pt"),
            "yolo11l-pose": YOLO(model_dir / "yolo11l-pose.pt"),
            "yolo11m-pose": YOLO(model_dir / "yolo11m-pose.pt"),
            "yolo11s-pose": YOLO(model_dir / "yolo11s-pose.pt"),
            "yolo11n-pose": YOLO(model_dir / "yolo11x-pose.pt"),
        }
        self._initialized = True

    @property
    def default_model_name(self) -> str:
        return "yolo11n-pose"
