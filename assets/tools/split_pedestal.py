#!/usr/bin/env python3
"""
Split pedestal atlas image into two PNGs (top -> back, bottom -> front).
Usage:
  python assets/tools/split_pedestal.py path/to/pedestal_layers.png

Outputs:
  assets/lobby/lobby_pedestal_back.png
  assets/lobby/lobby_pedestal_front.png

Requires Pillow: pip install pillow
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except Exception:
    print('Pillow not found. Install with: pip install pillow')
    sys.exit(1)


def split_pedestal(input_path: Path):
    if not input_path.exists():
        print(f'Input file not found: {input_path}')
        return 1

    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    mid = h // 2

    top = img.crop((0, 0, w, mid))
    bottom = img.crop((0, mid, w, h))

    out_dir = input_path.parent
    back_path = out_dir / 'lobby_pedestal_back.png'
    front_path = out_dir / 'lobby_pedestal_front.png'

    top.save(back_path)
    bottom.save(front_path)

    print('Saved:')
    print(' -', back_path)
    print(' -', front_path)
    return 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python split_pedestal.py path/to/pedestal_layers.png')
        sys.exit(1)
    input_file = Path(sys.argv[1])
    sys.exit(split_pedestal(input_file))
