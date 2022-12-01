import os
import sys

from PIL import Image


class generateIcons:
    def __init__(self, input_img, output_name):
        self.input_img = input_img
        self.filename = f"{output_name}.png"
        self.output_name = output_name
        self.icon_dir = self.filename.replace(".png", "")
        self.make_dir()

    def make_dir(self):
        """docstring"""
        try:
            os.mkdir(self.icon_dir)
        except Exception as e:
            print(e)

    def get_img(self):
        self.im = Image.open(self.input_img)
        os.rename(self.input_img, f"{self.output_name}-original.png")

    def cleanup_imgs(self):
        os.rename(f"{self.output_name}-original.png", f"{self.icon_dir}/{self.output_name}-original.png")
        os.rename(f"{self.output_name}.png", f"{self.icon_dir}/{self.output_name}.png")

    def trim_long_side(self):
        """
        which side is shorter
            - vertical == 1 (height)
            - horizontal == 0 (width)

        if horiz is shorter, trim vert
        if vert is shorter, trim horiz
        """
        if min(self.im.size) == max(self.im.size):
            return False

        side_shorter = self.im.size.index(min(self.im.size))
        side_trim = 0 if side_shorter == 1 else 1
        trim_by = self.im.size[side_trim] - self.im.size[side_shorter]
        print(
            "\n",
            "im.size:\t",
            self.im.size,
            "\n",
            "side_shorter:\t",
            side_shorter,
            "\n",
            "side_trim:\t",
            side_trim,
            "\n",
            "trim_by:",
            trim_by,
        )

        # box = (left, upper, right, lower)
        box_map = {
            1: (0, int(trim_by / 2), min(self.im.size), max(self.im.size) - int(trim_by / 2)),  # trim vert
            0: (int(trim_by / 2), 0, max(self.im.size) - int(trim_by / 2), min(self.im.size)),  # trim horiz
        }
        box = box_map.get(side_trim)
        print("box = (left, upper, right, lower)", "\n", "box:", box)

        self.im_new = self.im.crop(box)
        return True

    def create_icon_series(self):
        """
        resize to 128 48 32 16
        resolution unchanged
        """
        icon_sizes = [128, 48, 32, 16]

        with Image.open(self.filename) as im:
            for icon in icon_sizes:
                icon_filename = f"{self.icon_dir}/icon-{str(icon)}.png"
                tmp = im.resize((icon, icon))
                tmp.save(icon_filename, format="png")

    def main(self):
        """docstring"""
        self.get_img()
        resp = self.trim_long_side()
        if resp:
            self.im_new.save(self.filename, format="png")
        else:
            self.im.save(self.filename, format="png")

        self.create_icon_series()
        self.cleanup_imgs()
        return True


if __name__ == "__main__":
    args = sys.argv[1:]
    input_img = args[0]
    output_name = args[1]

    img_obj = generateIcons(input_img, output_name)
    img_obj.main()
