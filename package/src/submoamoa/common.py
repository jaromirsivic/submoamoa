import datetime
import math
import json
from pathlib import Path
from multiprocessing import Process, Queue

# epsilon is used to compare floating point numbers
epsilon = 0.000001
# motor_frame is the time during which pwm value must not be changed
motor_frame = 0.01


def timeout(seconds, action=None):
    """Calls any function with timeout after 'seconds'.
       If a timeout occurs, 'action' will be returned or called if
       it is a function-like object.
    """
    def handler(queue, func, args, kwargs):
        queue.put(func(*args, **kwargs))

    def decorator(func):

        def wraps(*args, **kwargs):
            q = Queue()
            p = Process(target=handler, args=(q, func, args, kwargs))
            p.start()
            p.join(timeout=seconds)
            if p.is_alive():
                p.terminate()
                p.join()
                if hasattr(action, '__call__'):
                    return action()
                else:
                    return action
            else:
                return q.get()

        return wraps

    return decorator


def get_settings():
    """Returns the latest settings.json file as a dictionary"""
    # common.py is in package/src/submoamoa/
    # settings.json is in package/src/submoamoa/wwwroot/src/assets/settings.json
    base_dir = Path(__file__).resolve().parent
    settings_path = base_dir / "wwwroot/src/assets/settings.json"
    
    if not settings_path.exists():
        # Fallback for alternative structure or check if dev env
        # Try local execution path or ../../../
        print(f"Warning: settings.json not found at {settings_path}")
        return {}
        
    try:
        with open(settings_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading settings.json: {e}")
        return {}