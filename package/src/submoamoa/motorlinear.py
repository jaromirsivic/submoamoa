from time import time, sleep
from .motor import Motor
from .common import epsilon, pwm_frequency, motor_frame

class MotorLinear(Motor):
    def __init__(self, *, forward_pin: Pin, reverse_pin: Pin, 
                speed_histogram: list[dict], softness: float):
        self._forward_pin = forward_pin
        self._reverse_pin = reverse_pin
        # speed histogram describes relation between motor speed in percentages and pwm multiplier
        # it describes how long it takes for linear actuator to go from fully
        # retracted position to fully extended position and vice verse
        # [{"pwm_multiplier": 0, "forward_seconds": 0, "reverse_seconds": 0, "interpolated": False},
        #  {"pwm_multiplier": 0.3, "forward_seconds": 15, "reverse_seconds": 15, "interpolated": False},
        #  {"pwm_multiplier": 0.8, "forward_seconds": 10, "reverse_seconds": 10, "interpolated": False},
        #  {"pwm_multiplier": 1, "forward_seconds": 7, "reverse_seconds": 7, "interpolated": False}]
        self._speed_histogram = speed_histogram
        self._forward_speed_histogram = []
        self._reverse_speed_histogram = []
        # softnes is a time in seconds how long it takes to go from speed 0% to 100%
        self._softness = softness
        # current position
        self._position = 0
        # target position
        self._target_speed = 0
        # current speed
        self._current_speed = 0

    
        

    @property
    def position(self):
        return self._position

    def move(self, *, speed: float):
        self._target_speed = min(max(speed, -1), 1)
    
    def go(self):
        """
        This function is called periodically as quickly as possible.
        It is used to set pwm values of forward or reverse pin on Raspberry Pi
        to move the motor to the target position.
        """
        if self._target_speed > self._current_speed:
            self._current_speed += (self._target_speed - self._current_speed) / self._softness
        elif self._target_speed < self._current_speed:
            self._current_speed -= (self._current_speed - self._target_speed) / self._softness
        
        