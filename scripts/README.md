# scripts

## gen-extension-icons.py

### setup

```bash
conda create -n test-pil python=3.10
conda activate test-pil
python -m pip install Pillow
```

### usage

```bash
python gen-extension-icons.py based-on-this.img desired-output-dirfile-name
```

**for example:**

```bash
git clone
cd scripts/

conda create -n test-pil python=3.10
conda activate test-pil
python -m pip install Pillow

python gen-extension-icons.py 3-incandescent-light-bulb-science-photo-library.jpg lightbulb
```

*output*

```text
im.size: (836, 900)
side_shorter: 0
side_trim: 1
trim_by: 64
box = (left, upper, right, lower)
box: (0, 32, 836, 868)
```

- new directory generated with icon image set
- renamed original image
- saved resized image

### references

[Pillow docs - tutorials](https://pillow.readthedocs.io/en/latest/handbook/tutorial.html)
