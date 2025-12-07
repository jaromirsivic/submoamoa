from gpiozero import LED

from gpiozero import PWMOutputDevice
from time import sleep
import datetime


def main():
   print("fsdfsdfds")

   led12 = PWMOutputDevice("J8:12", initial_value=0,frequency=4000) #ringer starts ringing
   led32 = PWMOutputDevice("J8:32", initial_value=0,frequency=4000) #ringer starts ringing
   for i in range(0, 100):
      led32.value = 0.3
      sleep(0.1)
   led12.off()
   led32.off()
   # led12.off()

   # led32 = PWMOutputDevice("J8:32", initial_value=0,frequency=1024) #ringer starts ringing
   # led32.off()

   # led33 = PWMOutputDevice("J8:33", initial_value=0,frequency=1024) #ringer starts ringing
   # led33.off()

   # led35 = PWMOutputDevice("J8:35", initial_value=0,frequency=1024) #ringer starts ringing
   # led35.off()

   # sleep(0.1)


   # while True:
   #    print(datetime.datetime.now())
   #    for i in range(0, 100):
   #       led12.value = 1 - (((i * 1) % 100) / 100)
   #       led32.value = 1 - (((i * 2) % 100) / 100)
   #       led33.value = 1 - (((i * 4) % 100) / 100)
   #       led35.value = 1 - (((i * 8) % 100) / 100)
   #       sleep(0.00001)


if __name__ == "__main__":
    main()