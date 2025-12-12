import datetime
import math

# epsilon is used to compare floating point numbers
epsilon = 0.000001
# pwm_frequency is the frequency of the pwm signal
pwm_frequency = 4000
# motor_frame is the time during which pwm value must not be changed
motor_frame = 0.01