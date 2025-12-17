import threading
import time
import json
import os
from typing import List
from .j8 import J8
from .motor import Motor
from .linearmotor import LinearMotor
from .speedhistogram import SpeedHistogram
from .pin import PinType
from .common import motor_frame, get_settings

class MotorsController:
    def __init__(self):
        self._j8 = J8()
        self._motors: dict[str, Motor] = {}
        self._running = False
        self._thread = None
        self._lock = threading.RLock()
        self.reset()

    @property
    def j8(self) -> J8:
        return self._j8

    @property
    def motors(self) -> dict[str, Motor]:
        with self._lock:
            return self._motors

    def reset(self):
        """
        Delete all motors, reset J8, and create new motors based on settings.json
        """
        with self._lock:
            self.stop()
            
            # Load settings
            settings = get_settings()

            if "general" in settings and "controllerSetup" in settings["general"]:
                 setup = settings["general"]["controllerSetup"]
                 host = setup.get("remoteHost")
                 port = setup.get("remotePort")
                 self._j8.reset(host=host, port=port)

            # Create motors
            if "motors" in settings:
                for motor_config in settings["motors"]:
                    if motor_config.get("enabled", False) and motor_config.get("type") == "linear":
                        try:
                            forward_pin_index = motor_config["forwardPin"]
                            reverse_pin_index = motor_config["reversePin"]
                            
                            forward_pin = self._j8[forward_pin_index]
                            reverse_pin = self._j8[reverse_pin_index]
                            
                            # Configure pins
                            forward_pin.pin_type = PinType.OUTPUT
                            reverse_pin.pin_type = PinType.OUTPUT

                            # Use the simple histogram list
                            hist_data = motor_config.get("histogram", [])
                            resolution = 1000 # Default
                            speed_hist = SpeedHistogram(speed_histogram=hist_data, resolution=resolution)
                            
                            inertia = motor_config.get("inertia", 0.5)
                            
                            motor = LinearMotor(
                                forward_pin=forward_pin, 
                                reverse_pin=reverse_pin, 
                                speed_histogram=speed_hist, 
                                inertia=inertia
                            )
                            self._motors[motor_config.get('name')] = motor
                        except Exception as e:
                            print(f"Error creating motor {motor_config.get('name')}: {e}")
            
            # starts the motor controller
            self.start()

    def execute(self):
        """
        Infinite loop to call go method of each enabled motor
        """
        while self._running:
            with self._lock:
                for name, motor in self._motors.items():
                    try:
                        motor.go()
                    except Exception as e:
                        print(f"Error in motor execution: {e}")
            # sleep to avoid 100% CPU usage
            time.sleep(0.001) 

    def start(self):
        """
        Start the execution thread
        """
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self.execute, daemon=True)
        self._thread.start()

    def stop(self):
        """
        Stop the execution, release motors and J8
        """
        self._running = False
        if self._thread:
            self._thread.join(timeout=1.0)
            self._thread = None
        
        with self._lock:
            # Delete all motors
            self._motors = {}
            # Release J8
            self._j8.release()
