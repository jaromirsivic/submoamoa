from package.src.submoamoa.camerascontroller import CamerasController
import cv2
import json

def main():
    cameras_controller = CamerasController()
    camera = cameras_controller.cameras[0]
    # camera.open()
    s = camera.to_dict()
    print(json.dumps(s, indent=4))

    # window is resizable
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.namedWindow('image_cropped_resized', cv2.WINDOW_NORMAL)
    cv2.namedWindow('image_ai', cv2.WINDOW_NORMAL)
    while True:
        # ret, image_ai = camera.image_ai.get_frame()
        # if not ret:
        #     break
        ret, image_cropped_resized = camera.image_cropped_resized.get_frame()
        if not ret:
            break
        # ret, image = camera.image.get_frame()
        # if not ret:
        #     break
        #cv2.imshow('image', image)
        cv2.imshow('image_cropped_resized', image_cropped_resized)
        # cv2.imshow('image_ai', image_ai)
        # wait if the escape key is pressed
        if cv2.waitKey(1) & 0xFF == 27:
            break
    cv2.destroyAllWindows()
    del cameras_controller

if __name__ == "__main__":
    main()