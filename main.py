import os
from cairosvg import svg2png


def convert_svg_to_png(svg_file_path, png_file_path):
    with open(svg_file_path, "rb") as svg_file:
        svg_data = svg_file.read()
    png_data = svg2png(bytestring=svg_data)
    with open(png_file_path, "wb") as png_file:
        png_file.write(png_data)

def main():
    # search files in directory D:\Download\MaterialDesign-SVG-master\MaterialDesign-SVG-master\svg
    for file in os.listdir("D:/Download/MaterialDesign-SVG-master/MaterialDesign-SVG-master/svg"):
        if file.endswith(".svg"):
            print(f'Converting {file} to PNG')
            convert_svg_to_png("D:/Download/MaterialDesign-SVG-master/MaterialDesign-SVG-master/svg/" + file,
                               "D:/Download/MaterialDesign-SVG-master/MaterialDesign-SVG-master/png/" + file.replace(".svg", ".png"))

if __name__ == "__main__":
    main()