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
        self._isDummyPin = not(self._name.startswith("GPIO"))
        self._pin_type = None
        self._frequency = pwm_frequency
        self._value = 0
        self._pin_factory = pin_factory
        self._pwm = None
        self.pin_type = pin_type

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
        if self._pin_type == PinType.OUTPUT and not self._isDummyPin:
            self._pwm.close()

# the singleton instance of J8
class J8(list):
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(J8, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self, *, host:str | None = None, port:int | None = None):
        # initialize general variables
        self._host = host
        self._port = port
        self._pin_factory = PiGPIOFactory(host=host, port=port)
        # initialize the pins
        self._pins = []
        self._pins.append(Pin(index=0, name="Dummy GPIO", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=1, name="3v3 Power", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=2, name="5v Power", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=3, name="GPIO 2 (I2C SDA)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=4, name="5v Power", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=5, name="GPIO 3 (I2C SCL)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=6, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=7, name="GPIO 4", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=8, name="GPIO 14 (TXD)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=9, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=10, name="GPIO 15 (RXD)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=11, name="GPIO 17", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=12, name="GPIO 18 (PWM0)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=13, name="GPIO 27", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=14, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=15, name="GPIO 22", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=16, name="GPIO 23", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=17, name="3v3 Power", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=18, name="GPIO 24", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=19, name="GPIO 10 (SPI0 MOSI) - Reserved for SPI", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=20, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=21, name="GPIO 9 (SPI0 MISO) - Reserved for SPI", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=22, name="GPIO 25", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=23, name="GPIO 11 (SPI0 SCLK)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=24, name="GPIO 8 (SPI0 CE0) - Reserved for SPI", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=25, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=26, name="GPIO 7 (SPI0 CE1) - Reserved for SPI", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=27, name="Disabled GPIO 0 (I2C SDA)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=28, name="Disabled GPIO 1 (I2C SCL)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=29, name="GPIO 5", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=30, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=31, name="GPIO 6", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=32, name="GPIO 12 (PWM0)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=33, name="GPIO 13 (PWM1)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=34, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=35, name="GPIO 19 (PWM1)", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=36, name="GPIO 16", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=37, name="GPIO 26", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=38, name="GPIO 20", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=39, name="GND", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))
        self._pins.append(Pin(index=40, name="GPIO 21", pin_type=PinType.OUTPUT, pin_factory=self._pin_factory))

    def __getitem__(self, key):
        return self._pins[key]

    def __setitem__(self, key, value):
        raise Exception("J8 pins are read-only")