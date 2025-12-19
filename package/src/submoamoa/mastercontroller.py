import datetime
from .motorscontroller import MotorsController
from .camerascontroller import CamerasController


class MasterController:
    def __init__(self):
        self.motors = MotorsController()
        self.cameras = CamerasController()