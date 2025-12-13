from gpiozero import LED
from gpiozero import PWMOutputDevice
from time import time, sleep
import datetime
import math
from package.src.submoamoa.pin import Pin
from package.src.submoamoa.j8 import J8
from package.src.submoamoa.speedhistogram import SpeedHistogram
from package.src.submoamoa.motorlinear import MotorLinear
import random


def speed(led, value):
   original_value = led.value
   delta = value -original_value
   steps = math.floor(delta * 20)
   step = delta / steps
   for i in range(0, steps):
      led.value += step
      sleep(0.05)
   led.value = value


def test():
   pin = J8(host="192.168.68.55", port=8888)
   while True:
      pin[12].value = 1
      sleep(1)
      pin[12].value = 0
      pin[32].value = 1
      sleep(1)
      pin[32].value = 0


def main():
   print("fsdfsdfds")
   speed_histogram = SpeedHistogram(speed_histogram=[{"pwm_multiplier": 0, "forward_seconds": 0, "reverse_seconds": 0, "interpolated": False},
   {"pwm_multiplier": 0.3, "forward_seconds": 15, "reverse_seconds": 15, "interpolated": False},
   {"pwm_multiplier": 0.8, "forward_seconds": 10, "reverse_seconds": 10, "interpolated": False},
   {"pwm_multiplier": 1, "forward_seconds": 7, "reverse_seconds": 7, "interpolated": False}])
   print(f'forward pwm histogram: {speed_histogram._forward_speed_histogram}\n\n')
   print(f'reverse pwm histogram: {speed_histogram._reverse_speed_histogram}\n\n')
   pins = J8(host="192.168.68.55", port=8888)
   forward_pin = pins[12]
   reverse_pin = pins[32]
   motor = MotorLinear(forward_pin=forward_pin, reverse_pin=reverse_pin, speed_histogram=speed_histogram, inertia=1)
   while True:
      print(motor.position)
      motor.move(speed=1)
      while motor.current_speed != motor.target_speed:
         motor.go()
      print(motor.position)
      motor.move(speed=-1)
      while motor.current_speed != motor.target_speed:
         motor.go()
   return

   led12 = PWMOutputDevice("J8:12", initial_value=0,frequency=4000)
   led31 = PWMOutputDevice("J8:31", initial_value=0,frequency=4000)
   led32 = PWMOutputDevice("J8:32", initial_value=0,frequency=4000)
   led12.off()
   led31.off()
   led32.off()
   while True:
      speed(led12, 1)
      sleep(1)
      speed(led12, 0)
      sleep(0.0)
      speed(led32, 1)
      sleep(1)
      speed(led32, 0)
   # for i in range(0, 100):
   #    led32.value = 0.3
   #    sleep(0.1)
   led12.off()
   led32.off()
   


if __name__ == "__main__":
    main()