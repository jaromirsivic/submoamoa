import datetime
from .motorscontroller import MotorsController
from .camerascontroller import CamerasController


class MasterController:
    def __init__(self):
        self.motors_controller = MotorsController()
        self.cameras_controller = CamerasController()

    def start(self):
        self.motors_controller.start()

    def stop(self):
        self.motors_controller.stop()

    def reset(self):
        self.motors_controller.reset()
        self.cameras_controller.reset()
    
    def execute(self):
        self.motors_controller._run()
        self.cameras_controller.execute()

    def __del__(self):
        del self.motors_controller
        del self.cameras_controller