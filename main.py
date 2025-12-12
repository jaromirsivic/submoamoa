from gpiozero import LED
from gpiozero import PWMOutputDevice
from time import time, sleep
import datetime
import math
from package.src.submoamoa.j8 import J8

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
   pin = J8(host="192.168.68.53", port=8888)
   while True:
      pin[12].value = 1
      sleep(1)
      pin[12].value = 0
      pin[32].value = 1
      sleep(1)
      pin[32].value = 0


def main():
   print("fsdfsdfds")
   test()
   return

   led12 = PWMOutputDevice("J8:12", initial_value=0,frequency=4000) #ringer starts ringing
   led31 = PWMOutputDevice("J8:31", initial_value=0,frequency=4000) #ringer starts ringing
   led32 = PWMOutputDevice("J8:32", initial_value=0,frequency=4000) #ringer starts ringing
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