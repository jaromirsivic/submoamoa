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

    def _interpolate_between_two_points(self, *, index: int):
        if index < 0 or index >= len(self._speed_histogram):
            raise ValueError("Index out of range")
        if not self._speed_histogram[index]["interpolated"]:
            return
        if index == 0:
            return
        if index == len(self._speed_histogram) - 1:
            return
        # search for the index of previous not interpolated point
        previous_index = index - 1
        while previous_index >= 0 and self._speed_histogram[previous_index]["interpolated"]:
            previous_index -= 1
        if previous_index < 0:
            return  
        # search for the index of next not interpolated point
        next_index = index + 1
        while next_index < len(self._speed_histogram) and self._speed_histogram[next_index]["interpolated"]:
            next_index += 1
        if next_index >= len(self._speed_histogram):
            return
        # get my relative position between previous and next point
        my_relative_position = (index - previous_index) / (next_index - previous_index)
        # interpolate forward seconds
        self._speed_histogram[index]["forward_seconds"] = self._speed_histogram[previous_index]["forward_seconds"] + \
                                                          (self._speed_histogram[next_index]["forward_seconds"] - \
                                                          self._speed_histogram[previous_index]["forward_seconds"]) * \
                                                          my_relative_position
        # interpolate reverse seconds
        self._speed_histogram[index]["reverse_seconds"] = self._speed_histogram[previous_index]["reverse_seconds"] + \
                                                          (self._speed_histogram[next_index]["reverse_seconds"] - \
                                                          self._speed_histogram[previous_index]["reverse_seconds"]) * \
                                                          my_relative_position
        

    def _normalize_and_interpolate_speed_histogram(self, *, steps: int = 100):
        # create new speed histogram which will have exactly steps items
        new_speed_histogram = []
        # index of the processed item from self._speed_histogram
        processing_index = 0
        for i in range(0, steps + 1):
            if processing_index >= len(self._speed_histogram):
                break
            if self._speed_histogram[processing_index]["pwm_multiplier"] == i / steps:
                new_speed_histogram.append(self._speed_histogram[processing_index])
                processing_index += 1
            else:
                new_speed_histogram.append({
                    "pwm_multiplier": i / steps,
                    "forward_seconds": None,
                    "reverse_seconds": None,
                    "interpolated": True
                })
        # set updated speed histogram
        self._speed_histogram = new_speed_histogram
        # interpolate items in the speed histogram
        for i in range(0, len(self._speed_histogram)):
            self._interpolate_between_two_points(index=i)
    
    def _init_speed_histograms(self, *, steps: int = 100):
        """
        Initialize speed histograms in following way:
        It transforms speed histogram to two lists of forward and reverse using linear interpolation.
        It uses given steps as number of items in forward and reverse lists. Each item in the list
        is a dictionary with pwm_multiplier and distance traveled in one second. Distance is relative
        to the length of the actuator.
        """
        # sort speed histogram by pwm_multiplier
        self._speed_histogram.sort(key=lambda x: x["pwm_multiplier"])
        # check that there are at least two items in speed histogram
        if len(self._speed_histogram) < 2:
            raise ValueError("Speed histogram must contain at least two items")
        # check that pwm_multiplier is in range [0, 1]
        for item in self._speed_histogram:
            if item["pwm_multiplier"] < 0 or item["pwm_multiplier"] > 1:
                raise ValueError("pwm_multiplier must be in range [0, 1]")
        # check that first item has pwm_multiplier 0 and forward seconds 0 and reverse_seconds 0
        if self._speed_histogram[0]["pwm_multiplier"] != 0 or self._speed_histogram[0]["forward_seconds"] != 0 or self._speed_histogram[0]["reverse_seconds"] != 0:
            raise ValueError("First item in speed histogram must have pwm_multiplier 0 and forward_seconds 0 and reverse_seconds 0")
        # check that last item has pwm_multiplier 1
        if self._speed_histogram[-1]["pwm_multiplier"] != 1:
            raise ValueError("Last item in speed histogram must have pwm_multiplier 1")
        # check that each item has forward_seconds less than or equal previous item
        for i in range(1, len(self._speed_histogram)):
            if self._speed_histogram[i]["forward_seconds"] > self._speed_histogram[i - 1]["forward_seconds"]:
                raise ValueError("forward_seconds must be less than or equal previous item")
        # check that each item has reverse_seconds less than or equal previous item
        for i in range(1, len(self._speed_histogram)):
            if self._speed_histogram[i]["reverse_seconds"] > self._speed_histogram[i - 1]["reverse_seconds"]:
                raise ValueError("reverse_seconds must be less than or equal previous item")
        # get max forward and reverse seconds
        max_forward_speed_seconds = self._speed_histogram[-1]["forward_seconds"]
        max_reverse_speed_seconds = self._speed_histogram[-1]["reverse_seconds"]
        

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
        
        