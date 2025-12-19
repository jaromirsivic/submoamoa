from package.src.submoamoa.camerascontroller import CamerasController, Camera
import cv2
import json

def main():
    camera = Camera(index=0)
    camera.open()
    s = camera.to_dict()
    print(json.dumps(s, indent=4))
    while True:
        ret, frame = camera.getFrame()
        if not ret:
            break
        cv2.imshow('frame', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    camera.close()

if __name__ == "__main__":
    main()