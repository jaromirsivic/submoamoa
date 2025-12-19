#from fastapi import FastAPI
#from fastapi.staticfiles import StaticFiles
#from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Any
#from ultralytics import YOLO
from .camera import Camera
import time
import cv2
import numpy as np


class CamerasController:
    _singleton = None

    def __new__(cls, *args, **kwargs):
        if not cls._singleton:
            cls._singleton = super(CamerasController, cls).__new__(cls, *args, **kwargs)
        return cls._singleton

    def __init__(self):
        # Load models
        # self.models = {}
        # self.models['n'] = YOLO("yolo11n-pose.pt")
        # self.models['s'] = YOLO("yolo11s-pose.pt")
        # self.models['m'] = YOLO("yolo11m-pose.pt")
        # self.models['l'] = YOLO("yolo11l-pose.pt")  
        # self.models['x'] = YOLO("yolo11x-pose.pt")
        # Initialize camera
        self._cameras: list[Camera] = []
        self.reload_list_of_cameras()

    # def list_cameras(self):
    #     result = []
    #     for i in range(10):
    #         cap = cv2.VideoCapture(i)
    #         if cap is not None and cap.isOpened():
    #             width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    #             height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    #             fps = cap.get(cv2.CAP_PROP_FPS)
    #             bitrate = cap.get(cv2.CAP_PROP_BITRATE)
    #             focus = cap.get(cv2.CAP_PROP_FOCUS)
    #             result.append({
    #                 "index": i,
    #                 "width": int(width),
    #                 "height": int(height),
    #                 "fps": fps,
    #                 "bitrate": bitrate,
    #                 "focus": focus
    #             }) 
    #             cap.release()
    #     return result

    @property
    def cameras(self) -> list[dict]:
        return self._cameras

    def reload_list_of_cameras(self, *, max_index=8):
        """
        Reload the list of cameras.
        Parameters:
        max_index : int : The maximum index of the cameras to reload.
        """
        self._cameras = []
        for i in range(max_index):
            self._cameras.append(Camera(index=i))
            # Open and close camera to get all properties
            self._cameras[i].open()
            self._cameras[i].close()

        # try:
        #     selected = int(input("Select camera index to use (default 0): ") or 0)
        #     except Exception:
        #         selected = 0
        #     camera = cv2.VideoCapture(selected)
        #     if not camera.isOpened():
        #         print("Error: Could not open webcam.")
        #         return

        #     window_name = "YOLO V11 Custom Visualization"
        #     cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        #     cv2.resizeWindow(window_name, 1024, 768)
        #     while True:
        #         success, frame = camera.read()
        #         if not success:
        #             break
        #         # Run inference
        #         results = model(frame, verbose=False)
        #         result = results[0]
        #         if hasattr(result, 'keypoints') and result.keypoints is not None:
        #             keypoints = result.keypoints.xy.cpu().numpy() if hasattr(result.keypoints.xy, 'cpu') else result.keypoints.xy
        #             frame = draw_eyes_nose(frame, keypoints)
        #         cv2.imshow(window_name, frame)
        #         if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
        #             break
        #     camera.release()
        #     cv2.destroyAllWindows()

#model = YOLO("yolo11x-pose.pt")

def list_cameras(max_index=8):
    """
    List available cameras/video inputs.
    Parameters:
    max_index : int : The maximum index of the cameras to list.
    """
    print("Available cameras/video inputs:")
    found = False
    for i in range(max_index):
        cap = cv2.VideoCapture(i)
        if cap is not None and cap.isOpened():
            print(f"  Camera index {i} is available.")
            
            # Check supported resolutions
            common_resolutions = [
                (3840, 2160), (1920, 1080), (1600, 1200), (1280, 960), 
                (1280, 720), (1024, 768), (800, 600), (640, 480), (320, 240)
            ]
            supported_resolutions = []
            
            for width, height in common_resolutions:
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
                w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
                h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
                if int(w) == width and int(h) == height:
                    supported_resolutions.append(f"{width}x{height}")
            
            supported_resolutions = sorted(list(set(supported_resolutions)), key=lambda x: int(x.split('x')[0]) * int(x.split('x')[1]), reverse=True)
            
            if supported_resolutions:
                print(f"    Supported Resolutions: {', '.join(supported_resolutions)}")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            print(f"    Current FPS: {fps:.2f}")
            
            found = True
            cap.release()
    if not found:
        print("  No cameras found.")

def bitblt_frame(*, src_frame: np.ndarray, src_x: int, src_y: int, src_width: int, src_height: int,
                 dst_width: int, dst_height: int) -> np.ndarray:
    """
    Bitblt a frame from the source frame to the destination frame.
    Parameters:
    src_frame : numpy.ndarray : The source frame.
    src_x : int : The x coordinate of the source frame.
    src_y : int : The y coordinate of the source frame.
    src_width : int : The width of the source frame.
    src_height : int : The height of the source frame.
    dst_width : int : The width of the destination frame.
    dst_height : int : The height of the destination frame.

    Returns:
    numpy.ndarray : The destination frame.
    """
    if src_frame.shape[1] >= src_x + src_width and src_frame.shape[0] >= src_y + src_height:
        cropped_frame = src_frame[src_y:src_y + src_height, src_x:src_x + src_width]
    else:
        # Fallback if frame is smaller than expected
        cropped_frame = src_frame
    return cv2.resize(cropped_frame, (dst_width, dst_height))

def main():
    list_cameras()
    try:
        selected = int(input("Select camera index to use (default 0): ") or 0)
    except Exception:
        selected = 0
    camera = cv2.VideoCapture(selected)
    # Set camera resolution to 1280x720
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    if not camera.isOpened():
        print("Error: Could not open webcam.")
        return

    window_name = "YOLO V11 Custom Visualization"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 1920, 1080)
    while True:
        success, frame = camera.read()
        if not success:
            break

        # Flip camera input horizontally and vertically
        #frame = cv2.flip(frame, FLIP_NONE)
        #frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
        
        # Crop center 1280x720 from 1920x1080 frame
        # Center is (960, 540)
        # x: 320 to 1600 (1280 width)
        # y: 180 to 900 (720 height)
        # if frame.shape[1] >= 1600 and frame.shape[0] >= 900:
        #     cropped_frame = frame[180:900, 320:1600]
        # else:
        #     # Fallback if frame is smaller than expected
        #     cropped_frame = frame

        # # Resize cropped frame to 640x480 (Frame2)
        # frame2 = cv2.resize(cropped_frame, (640, 480))

        frame2 = bitblt_frame(frame, 320, 180, 1280, 720, 640, 480)

        # Flip camera input horizontally and vertically (if needed)
        # frame2 = cv2.flip(frame2, FLIP_NONE)
        # frame2 = cv2.rotate(frame2, cv2.ROTATE_90_COUNTERCLOCKWISE)

        # Run inference on Frame2
        results = model(frame2, verbose=False)
        result = results[0]
        if hasattr(result, 'keypoints') and result.keypoints is not None:
            keypoints = result.keypoints.xy.cpu().numpy() if hasattr(result.keypoints.xy, 'cpu') else result.keypoints.xy
            frame2 = draw_eyes_nose(frame2, keypoints)
        cv2.imshow(window_name, frame2)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
            break
    camera.release()
    cv2.destroyAllWindows()

# # 2. Define the source image (can be a local file path, URL, or webcam index)
# source = "https://ultralytics.com/images/bus.jpg" # Example image with people

# # 3. Run inference with the model
# # The model automatically handles downloading the weights if they are not present locally
# started = time.time()
# for i in range(10): 
#     results = model(source)
# end = time.time()

# # 4. Process and visualize the results
# for result in results:
#     # result.boxes for object detection bounding boxes
#     # result.keypoints for pose specific data

#     # Print the coordinates and confidence scores for keypoints (e.g., human joints)
#     print("Keypoints coordinates (normalized [x, y]):", result.keypoints.xy)
#     print("Keypoints confidence scores:", result.keypoints.conf)

#     # Custom visualization: draw only selected points/lines and alpha/beta
#     frame = result.orig_img.copy() if hasattr(result, 'orig_img') else None
#     if frame is not None and hasattr(result, 'keypoints') and result.keypoints is not None:
#         keypoints = result.keypoints.xy.cpu().numpy() if hasattr(result.keypoints.xy, 'cpu') else result.keypoints.xy
#         frame = draw_eyes_nose(frame, keypoints)
#         cv2.imshow("YOLO V11 Custom Visualization", frame)
#     else:
#         # fallback to default plot if custom not possible
#         annotated_frame = result.plot()
#         cv2.imshow("YOLO V11 Pose Estimation", annotated_frame)
#     #cv2.waitKey(0) # Wait for a key press to close the window

# cv2.destroyAllWindows()

# print(f"Inference and visualization complete. Total time for 10 runs: {end - started} seconds")

# time.sleep(1)

# # Run inference on the webcam feed in real-time
# # 'source=0' means the default camera
# # 'show=True' automatically displays the video feed with predictions
# model.predict(source=0, show=True, save=False, conf=0.05, device="cuda")

if __name__ == "__main__":
    main()