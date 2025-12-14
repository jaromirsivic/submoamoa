from gpiozero import PWMOutputDevice
from gpiozero.pins.pigpio import PiGPIOFactory
from .pin import Pin, PinType


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
        self._pin_factory = None
        # initialize the pins
        self._pins = []
        # parameters containing information regarding initialization progress
        self._initialized = False
        self._error_message = ""
        # initialize pins
        self.init_pins(host=host, port=port)

    def init_pins(self, *, host:str | None = None, port:int | None = None):
        self._initialized = False
        self._error_message = ""
        # try to initialize pins
        try:
            for pin in self._pins:
                del pin
            # setup the pin factory
            self._host = host
            self._port = port
            if host is not None and port is not None:
                self._pin_factory = PiGPIOFactory(host=host, port=port)
            else:
                self._pin_factory = None
            # setup the pins
            self._pins = []
            self._pins.append(Pin(index=0, name="Dummy GPIO", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=1, name="3v3 Power", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=2, name="5v Power", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=3, name="GPIO 2 (I2C SDA)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=4, name="5v Power", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=5, name="GPIO 3 (I2C SCL)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=6, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=7, name="GPIO 4", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=8, name="GPIO 14 (TXD)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=9, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=10, name="GPIO 15 (RXD)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=11, name="GPIO 17", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=12, name="GPIO 18 (PWM0)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=13, name="GPIO 27", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=14, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=15, name="GPIO 22", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=16, name="GPIO 23", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=17, name="3v3 Power", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=18, name="GPIO 24", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=19, name="GPIO 10 (SPI0 MOSI) - Reserved for SPI", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=20, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=21, name="GPIO 9 (SPI0 MISO) - Reserved for SPI", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=22, name="GPIO 25", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=23, name="GPIO 11 (SPI0 SCLK)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=24, name="GPIO 8 (SPI0 CE0) - Reserved for SPI", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=25, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=26, name="GPIO 7 (SPI0 CE1) - Reserved for SPI", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=27, name="Disabled GPIO 0 (I2C SDA)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=28, name="Disabled GPIO 1 (I2C SCL)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=29, name="GPIO 5", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=30, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=31, name="GPIO 6", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=32, name="GPIO 12 (PWM0)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=33, name="GPIO 13 (PWM1)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=34, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=35, name="GPIO 19 (PWM1)", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=36, name="GPIO 16", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=37, name="GPIO 26", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=38, name="GPIO 20", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=39, name="GND", pin_factory=self._pin_factory))
            self._pins.append(Pin(index=40, name="GPIO 21", pin_factory=self._pin_factory))
            self._initialized = True
        except Exception as e:
            self._error_message = f"Failed to initialize J8 pins: {e}"

    @property
    def initialized(self):
        return self._initialized

    @property
    def error_message(self):
        return self._error_message
    
    def reset(self):
        for pin in self._pins:
            pin.reset()

    def __del__(self):
        for pin in self._pins:
            pin.close()

    def __getitem__(self, key):
        return self._pins[key]

    def __setitem__(self, key, value):
        raise Exception("J8 pins are read-only")