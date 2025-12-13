from gpiozero import PWMOutputDevice
from gpiozero.pins.pigpio import PiGPIOFactory
from time import sleep
import datetime
import math
from enum import Enum
from .common import epsilon, pwm_frequency

class PinType(Enum):
    OUTPUT = 1
    INPUT = 2

class Pin:
    def __init__(self, *, index: int, name:str, pin_type=PinType.OUTPUT, pin_factory=None):
        """
        Initialize the pin
        """
        self._index = index
        self._name = name
        self._pin_type = pin_type
        self._pin_factory = pin_factory
        self._isDummyPin = not(self._name.startswith("GPIO"))
        self._frequency = pwm_frequency
        self._value = 0
        self._pwm = None
        self.reset()

    def reset(self):
        """
        Reset the pin
        """
        self._release_pwm()
        self._isDummyPin = not(self._name.startswith("GPIO"))
        self._frequency = pwm_frequency
        self._value = 0
        self._pwm = None
        self.pin_type = self._pin_type

    def __del__(self):
        self._release_pwm()

    @property
    def index(self):
        """
        Get the index of the pin
        """
        return self._index

    @property
    def name(self):
        """
        Get the name of the pin
        """
        return self._name

    @property
    def pin_type(self):
        """
        Get the pin type of the pin
        """
        return self._pin_type

    @pin_type.setter
    def pin_type(self, pin_type):
        """
        Set the pin type of the pin
        """
        if self._pin_type == pin_type or self._isDummyPin:
            return
        if pin_type == PinType.OUTPUT:
            self._pin_type = pin_type
            self._pwm = PWMOutputDevice(f"J8:{self._index}", initial_value=0,frequency=self._frequency, pin_factory=self._pin_factory)
            self.value = 0
        else:
            self._pin_type = pin_type
            self._pwm.close()
            self._pwm = None
            # TODO implement
        

    @property
    def value(self):
        """
        Get the value of the pin
        """
        return self._value
    
    @value.setter
    def value(self, value):
        """
        Set the value of the pin
        """
        if self._pin_type != PinType.OUTPUT or self._isDummyPin:
            raise Exception("Pin type is not output. You cannot set the value of an input pin.")
        if value < epsilon:
            value = 0
            self._pwm.off()
        elif value > 1 - epsilon:
            value = 1
            self._pwm.on()
        else:
            self._pwm.value = value
        self._value = value

    def _release_pwm(self):
        """
        Release the pwm object
        """
        if self._pin_type == PinType.OUTPUT and not self._isDummyPin and self._pwm is not None:
            self._pwm.close()