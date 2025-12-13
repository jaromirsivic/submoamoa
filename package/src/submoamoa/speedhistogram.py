from copy import deepcopy
from .common import epsilon

class SpeedHistogram:
    def __init__(self, *, speed_histogram: list[dict], steps: int = 100):
        self._steps = steps
        self._speed_histogram = deepcopy(speed_histogram)
        self._forward_speed_histogram = []
        self._reverse_speed_histogram = []
        self._init_speed_histograms()

    # def _interpolate_between_two_points(self, *, index: int):
    #     if index < 0 or index >= len(self._speed_histogram):
    #         raise ValueError("Index out of range")
    #     if not self._speed_histogram[index]["interpolated"]:
    #         return
    #     if index == 0:
    #         return
    #     if index == len(self._speed_histogram) - 1:
    #         return
    #     # search for the index of previous not interpolated point
    #     previous_index = index - 1
    #     while previous_index >= 0 and self._speed_histogram[previous_index]["interpolated"]:
    #         previous_index -= 1
    #     if previous_index < 0:
    #         return  
    #     # search for the index of next not interpolated point
    #     next_index = index + 1
    #     while next_index < len(self._speed_histogram) and self._speed_histogram[next_index]["interpolated"]:
    #         next_index += 1
    #     if next_index >= len(self._speed_histogram):
    #         return
    #     # get my relative position between previous and next point
    #     my_relative_position = (index - previous_index) / (next_index - previous_index)
    #     # interpolate forward seconds
    #     self._speed_histogram[index]["forward_seconds"] = self._speed_histogram[previous_index]["forward_seconds"] + \
    #                                                       (self._speed_histogram[next_index]["forward_seconds"] - \
    #                                                       self._speed_histogram[previous_index]["forward_seconds"]) * \
    #                                                       my_relative_position
    #     # interpolate reverse seconds
    #     self._speed_histogram[index]["reverse_seconds"] = self._speed_histogram[previous_index]["reverse_seconds"] + \
    #                                                       (self._speed_histogram[next_index]["reverse_seconds"] - \
    #                                                       self._speed_histogram[previous_index]["reverse_seconds"]) * \
    #                                                       my_relative_position
        

    # def _interpolate_speed_histogram(self, *, steps: int = 100):
    #     # create new speed histogram which will have exactly steps items
    #     new_speed_histogram = []
    #     # index of the processed item from self._speed_histogram
    #     processing_index = 0
    #     for i in range(0, steps + 1):
    #         if processing_index >= len(self._speed_histogram):
    #             break
    #         if self._speed_histogram[processing_index]["pwm_multiplier"] == i / steps:
    #             new_speed_histogram.append(self._speed_histogram[processing_index])
    #             processing_index += 1
    #         else:
    #             new_speed_histogram.append({
    #                 "pwm_multiplier": i / steps,
    #                 "forward_seconds": None,
    #                 "reverse_seconds": None,
    #                 "interpolated": True
    #             })
    #     # set updated speed histogram
    #     self._speed_histogram = new_speed_histogram
    #     # interpolate items in the speed histogram
    #     for i in range(0, len(self._speed_histogram)):
    #         self._interpolate_between_two_points(index=i)
    
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
            if self._speed_histogram[i-1]["forward_seconds"] > 0 and self._speed_histogram[i]["forward_seconds"] >= self._speed_histogram[i - 1]["forward_seconds"]:
                raise ValueError("forward_seconds must be less than or equal previous item")
        # check that each item has reverse_seconds less than or equal previous item
        for i in range(1, len(self._speed_histogram)):
            if self._speed_histogram[i-1]["reverse_seconds"] > 0 and self._speed_histogram[i]["reverse_seconds"] >= self._speed_histogram[i - 1]["reverse_seconds"]:
                raise ValueError("reverse_seconds must be less than or equal previous item")
        # normalize speed histogram
        self._normalize_speed()
        # compute forward and reverse pwm histograms
        self._forward_speed_histogram.append(0)
        self._reverse_speed_histogram.append(0)
        for i in range(1, steps):
            speed = i / steps
            forward_pwm = self._compute_pwm(speed=speed, which_type_of_speed="forward")
            reverse_pwm = self._compute_pwm(speed=speed, which_type_of_speed="reverse")
            self._forward_speed_histogram.append(forward_pwm)
            self._reverse_speed_histogram.append(reverse_pwm)
        self._forward_speed_histogram.append(1)
        self._reverse_speed_histogram.append(1)

    
    # def create_forward_speed_histogram(self, *, steps: int = 100):
    #     # get max forward and reverse seconds
    #     max_forward_speed_seconds = self._speed_histogram[-1]["forward_seconds"]
    #     max_reverse_speed_seconds = self._speed_histogram[-1]["reverse_seconds"]    
    #     # create forward pwm histogram
    #     forward_pwm_histogram = []
    #     for i in range(0, len(self._speed_histogram)):
    #         if self._speed_histogram[i]["forward_seconds"] == 0:
    #             forward_pwm_histogram.append(0)
    #         else:
    #             forward_pwm_histogram.append(max_forward_speed_seconds / self._speed_histogram[i]["forward_seconds"])
    #     # transpose the histogram in the way that indexes represent the speed between 0 and 1 and values represent the pwm multiplier
    #     # interpolate missing pwm values linearly
    #     forward_speed_histogram = []
    #     for i in range(0, len(forward_pwm_histogram)):
    #         forward_speed_histogram.append()
    #     return forward_speed_histogram

    def _normalize_speed(self):
        # get max forward and reverse seconds
        max_forward_speed_seconds = self._speed_histogram[-1]["forward_seconds"]
        max_reverse_speed_seconds = self._speed_histogram[-1]["reverse_seconds"]
        # normalize speed histogram
        for i in range(0, len(self._speed_histogram)):
            if self._speed_histogram[i]["forward_seconds"] == 0:
                self._speed_histogram[i]["forward_speed"] = 0
            else:
                self._speed_histogram[i]["forward_speed"] = max_forward_speed_seconds / self._speed_histogram[i]["forward_seconds"]
            if self._speed_histogram[i]["reverse_seconds"] == 0:
                self._speed_histogram[i]["reverse_speed"] = 0
            else:
                self._speed_histogram[i]["reverse_speed"] = max_reverse_speed_seconds / self._speed_histogram[i]["reverse_seconds"]
    
    def _compute_pwm(self, *, speed: float, which_type_of_speed: str="forward"):
        # find the index of the item with pwm_multiplier closest to the given speed
        index = 0
        for i in range(0, len(self._speed_histogram)):
            if self._speed_histogram[i][which_type_of_speed + "_speed"] > speed:
                index = i
                break
        # if the index is 0 then return the first item
        if index <= 0:
            return self._speed_histogram[0]["pwm_multiplier"]
        # if the index is the last item then return the last item
        if index == len(self._speed_histogram):
            return self._speed_histogram[-1]["pwm_multiplier"]
        # if the value with the index is close to the given speed then return it
        if abs(self._speed_histogram[index][which_type_of_speed + "_speed"] - speed) < epsilon:
            return self._speed_histogram[index]["pwm_multiplier"]
        # interpolate the value
        lower_speed = self._speed_histogram[index - 1][which_type_of_speed + "_speed"]
        higher_speed = self._speed_histogram[index][which_type_of_speed + "_speed"]
        speed_delta = higher_speed - lower_speed
        if speed_delta == 0:
            return self._speed_histogram[index]["pwm_multiplier"]
        # relative position of speed between lower and higher speed points
        speed_position = (speed - lower_speed) / speed_delta
        # interpolate the value
        lower_pwm = self._speed_histogram[index - 1]["pwm_multiplier"]
        higher_pwm = self._speed_histogram[index]["pwm_multiplier"]
        pwm_delta = higher_pwm - lower_pwm
        result = lower_pwm + pwm_delta * speed_position
        return result
        


    def __str__(self):
        forward_speed_histogram = ""
        reverse_speed_histogram = ""
        for item in self._speed_histogram:
            forward_speed_histogram += f"{item['pwm_multiplier']}: {item['forward_seconds']}\n"
            reverse_speed_histogram += f"{item['pwm_multiplier']}: {item['reverse_seconds']}\n"