import os
import sys

from PIL import Image

def get_img(input_img: str, output_name: str):
    im = Image.open(input_img)
    os.rename(input_img, f'{output_name}-original.png')
    return im

def trim_long_side(im):
    '''
    which side is shorter
        - vertical == 1 (height)
        - horizontal == 0 (width)

    if horiz is shorter, trim vert
    if vert is shorter, trim horiz
    '''
    if min(im.size) == max(im.size):
        return False

    side_shorter = im.size.index(min(im.size))
    side_trim = 0 if side_shorter == 1 else 1
    print('im.size:', im.size)
    print('side_shorter:',side_shorter)
    print('side_trim:',side_trim)

    # by how much
    trim_by = im.size[side_trim] - im.size[side_shorter]
    # print(im.size[side_trim], im.size[side_shorter])
    print('trim_by:',trim_by)

    # create box based on side_trim
    # box = (left, upper, right, lower)
    box_map = {
        1: (0, int(trim_by/2), min(im.size), max(im.size) - int(trim_by/2)), # trim vert
        0: (int(trim_by/2), 0, max(im.size) - int(trim_by/2), min(im.size)), # trim horiz
    }
    box = box_map.get(side_trim)
    print('box = (left, upper, right, lower)')
    print('box:',box)
    # crop
    return im.crop(box)


def make_dir(dir_name):
    """docstring"""
    try:
        os.mkdir(dir_name)
    except Exception as e:
        print(e)

def create_icon_series(filename):
    """
    resize to 128 48 32 16
    resolution unchanged
    """
    icon_dir = filename.replace('.png','')
    make_dir(icon_dir)
    icon_sizes = [128,48,32,16]

    with Image.open(filename) as im:
        for icon in icon_sizes:
            icon_filename = f"{icon_dir}/icon-{str(icon)}.png"
            tmp = im.resize((icon,icon))
            tmp.save(icon_filename,format='png')

def main():
    """docstring"""
    args = sys.argv[1:]
    input_img = args[0] # eg 3-incandescent-light-bulb-science-photo-library.jpg
    output_name = args[1] # eg lightbulb
    filename = f'{output_name}.png'

    im = get_img(input_img,output_name)
    new = trim_long_side(im)
    if new:
        new.save(filename,format='png')

    create_icon_series(filename)
    return True

if __name__ == '__main__':
    main()
