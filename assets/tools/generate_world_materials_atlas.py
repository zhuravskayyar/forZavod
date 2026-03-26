#!/usr/bin/env python3
"""
Generate a low-poly world materials atlas for the hex-map scene.

Outputs:
  hero/assets/world/world_materials_atlas.png
  hero/assets/world/world_materials_atlas.json

Requires:
  Pillow
"""

from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "assets" / "world"
ATLAS_PATH = OUT_DIR / "world_materials_atlas.png"
META_PATH = OUT_DIR / "world_materials_atlas.json"

CELL = 256
COLS = 4
ROWS = 2
HEX_RADIUS = 94
SHADOW_OFFSET = 14
PAD = 18

MATERIALS = [
    {
        "id": "ocean",
        "label": "Ocean",
        "top": (116, 182, 239),
        "mid": (63, 120, 210),
        "bottom": (31, 68, 151),
        "detail_a": (162, 228, 255, 88),
        "detail_b": (62, 106, 191, 90),
        "style": "water",
    },
    {
        "id": "shallows",
        "label": "Shallows",
        "top": (139, 218, 230),
        "mid": (86, 184, 201),
        "bottom": (58, 122, 169),
        "detail_a": (228, 245, 206, 80),
        "detail_b": (80, 151, 171, 80),
        "style": "water",
    },
    {
        "id": "grassland",
        "label": "Grassland",
        "top": (160, 205, 113),
        "mid": (101, 162, 79),
        "bottom": (56, 107, 59),
        "detail_a": (209, 237, 155, 78),
        "detail_b": (74, 121, 64, 78),
        "style": "grass",
    },
    {
        "id": "forest",
        "label": "Forest",
        "top": (120, 164, 86),
        "mid": (69, 110, 55),
        "bottom": (34, 63, 33),
        "detail_a": (158, 199, 109, 66),
        "detail_b": (30, 55, 29, 84),
        "style": "forest",
    },
    {
        "id": "mountain",
        "label": "Mountain",
        "top": (182, 173, 149),
        "mid": (131, 122, 108),
        "bottom": (78, 73, 72),
        "detail_a": (226, 220, 210, 80),
        "detail_b": (92, 84, 80, 86),
        "style": "mountain",
    },
    {
        "id": "wasteland",
        "label": "Wasteland",
        "top": (214, 181, 109),
        "mid": (178, 134, 75),
        "bottom": (110, 74, 41),
        "detail_a": (236, 210, 140, 75),
        "detail_b": (138, 94, 50, 82),
        "style": "wasteland",
    },
    {
        "id": "sand",
        "label": "Sand",
        "top": (238, 214, 155),
        "mid": (217, 183, 120),
        "bottom": (177, 132, 84),
        "detail_a": (251, 236, 187, 72),
        "detail_b": (190, 151, 97, 74),
        "style": "sand",
    },
    {
        "id": "dirt",
        "label": "Dirt",
        "top": (168, 118, 82),
        "mid": (132, 85, 58),
        "bottom": (82, 54, 39),
        "detail_a": (198, 151, 112, 70),
        "detail_b": (98, 66, 44, 84),
        "style": "dirt",
    },
]


def hex_points(cx: float, cy: float, radius: float) -> list[tuple[float, float]]:
    return [
        (
            cx + math.cos(math.radians(60 * i - 30)) * radius,
            cy + math.sin(math.radians(60 * i - 30)) * radius,
        )
        for i in range(6)
    ]


def lerp_color(a: tuple[int, ...], b: tuple[int, ...], t: float) -> tuple[int, ...]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def make_gradient(size: int, top: tuple[int, int, int], mid: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        t = y / max(1, size - 1)
        if t < 0.48:
            color = lerp_color(top, mid, t / 0.48)
        else:
            color = lerp_color(mid, bottom, (t - 0.48) / 0.52)
        for x in range(size):
            px[x, y] = (*color, 255)
    return img


def polygon_layer(size: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    return layer, ImageDraw.Draw(layer, "RGBA")


def draw_shadow(base: Image.Image, points: list[tuple[float, float]]) -> None:
    layer, draw = polygon_layer(base.size[0])
    shifted = [(x, y + SHADOW_OFFSET) for x, y in points]
    draw.polygon(shifted, fill=(4, 10, 17, 130))
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(10)))


def apply_hex_fill(base: Image.Image, mask: Image.Image, gradient: Image.Image) -> None:
    base.alpha_composite(Image.composite(gradient, Image.new("RGBA", gradient.size, (0, 0, 0, 0)), mask))


def random_point_in_hex(rng: random.Random, cx: float, cy: float, radius: float) -> tuple[float, float]:
    angle = rng.random() * math.tau
    dist = (rng.random() ** 0.58) * radius * 0.88
    return cx + math.cos(angle) * dist, cy + math.sin(angle) * dist


def draw_lowpoly_facets(base: Image.Image, mask: Image.Image, mat: dict, rng: random.Random, cx: int, cy: int) -> None:
    layer, draw = polygon_layer(base.size[0])
    for _ in range(34):
        sides = rng.randint(3, 5)
        radius = rng.uniform(18, 52)
        ox, oy = random_point_in_hex(rng, cx, cy, HEX_RADIUS * 0.8)
        start = rng.random() * math.tau
        points = []
        for i in range(sides):
            ang = start + i * (math.tau / sides) + rng.uniform(-0.18, 0.18)
            rad = radius * rng.uniform(0.58, 1.16)
            points.append((ox + math.cos(ang) * rad, oy + math.sin(ang) * rad))
        fill = mat["detail_a"] if rng.random() > 0.45 else mat["detail_b"]
        draw.polygon(points, fill=fill)
    clipped = Image.composite(layer, Image.new("RGBA", base.size, (0, 0, 0, 0)), mask)
    base.alpha_composite(clipped)


def draw_water_details(base: Image.Image, mask: Image.Image, rng: random.Random, cx: int, cy: int) -> None:
    layer, draw = polygon_layer(base.size[0])
    for _ in range(14):
        x = rng.uniform(cx - 72, cx + 72)
        y = rng.uniform(cy - 62, cy + 64)
        w = rng.uniform(18, 44)
        h = rng.uniform(8, 16)
        draw.polygon(
            [
                (x, y - h * 0.5),
                (x + w * 0.55, y),
                (x, y + h * 0.5),
                (x - w * 0.55, y),
            ],
            fill=(210, 247, 255, rng.randint(46, 82)),
        )
    clipped = Image.composite(layer, Image.new("RGBA", base.size, (0, 0, 0, 0)), mask)
    base.alpha_composite(clipped)


def draw_grass_details(base: Image.Image, mask: Image.Image, rng: random.Random, cx: int, cy: int, color: tuple[int, int, int]) -> None:
    layer, draw = polygon_layer(base.size[0])
    for _ in range(24):
        x = rng.uniform(cx - 78, cx + 78)
        y = rng.uniform(cy - 54, cy + 70)
        h = rng.uniform(10, 20)
        sway = rng.uniform(-3, 3)
        draw.line((x, y + h * 0.4, x + sway, y - h * 0.35), fill=(*color, 110), width=2)
        draw.line((x + sway, y - h * 0.35, x + sway + 2, y - h * 0.62), fill=(*color, 90), width=1)
    clipped = Image.composite(layer, Image.new("RGBA", base.size, (0, 0, 0, 0)), mask)
    base.alpha_composite(clipped)


def draw_forest_details(base: Image.Image, mask: Image.Image, rng: random.Random, cx: int, cy: int) -> None:
    layer, draw = polygon_layer(base.size[0])
    for _ in range(14):
        x = rng.uniform(cx - 76, cx + 76)
        y = rng.uniform(cy - 50, cy + 48)
        crown = rng.uniform(10, 18)
        draw.polygon(
            [(x, y - crown), (x - crown * 0.7, y + crown * 0.5), (x + crown * 0.7, y + crown * 0.5)],
            fill=(36, 68, 36, rng.randint(150, 195)),
        )
        draw.polygon(
            [(x, y - crown * 0.7), (x - crown * 0.55, y + crown * 0.2), (x + crown * 0.55, y + crown * 0.2)],
            fill=(103, 151, 75, rng.randint(90, 140)),
        )
    clipped = Image.composite(layer, Image.new("RGBA", base.size, (0, 0, 0, 0)), mask)
    base.alpha_composite(clipped)


def draw_mountain_details(base: Image.Image, mask: Image.Image, rng: random.Random, cx: int, cy: int) -> None:
    layer, draw = polygon_layer(base.size[0])
    peaks = []
    for _ in range(6):
        x = rng.uniform(cx - 74, cx + 74)
        y = rng.uniform(cy - 10, cy + 50)
        peak = rng.uniform(26, 48)
        peaks.append((x, y, peak))
    peaks.sort(key=lambda item: item[1], reverse=True)
    for x, y, peak in peaks:
        poly = [(x, y - peak), (x - peak * 0.65, y + peak * 0.42), (x + peak * 0.65, y + peak * 0.42)]
        draw.polygon(poly, fill=(109, 105, 102, 210))
        draw.polygon([(x, y - peak), (x - peak * 0.12, y - peak * 0.12), (x + peak * 0.4, y + peak * 0.36)], fill=(230, 228, 223, 100))
    clipped = Image.composite(layer, Image.new("RGBA", base.size, (0, 0, 0, 0)), mask)
    base.alpha_composite(clipped)


def draw_cracks(base: Image.Image, mask: Image.Image, rng: random.Random, cx: int, cy: int, color: tuple[int, int, int]) -> None:
    layer, draw = polygon_layer(base.size[0])
    for _ in range(9):
        x = rng.uniform(cx - 70, cx + 70)
        y = rng.uniform(cy - 42, cy + 58)
        length = rng.uniform(22, 42)
        angle = rng.uniform(-0.9, 0.9)
        points = []
        for step in range(5):
            t = step / 4
            points.append(
                (
                    x + math.cos(angle) * length * t + rng.uniform(-4, 4),
                    y + math.sin(angle) * length * t + rng.uniform(-5, 5),
                )
            )
        draw.line(points, fill=(*color, 110), width=2)
    clipped = Image.composite(layer, Image.new("RGBA", base.size, (0, 0, 0, 0)), mask)
    base.alpha_composite(clipped)


def draw_glow(base: Image.Image, points: list[tuple[float, float]], color: tuple[int, int, int, int]) -> None:
    layer, draw = polygon_layer(base.size[0])
    draw.polygon(points, outline=color, width=8)
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(7)))


def draw_rim(base: Image.Image, points: list[tuple[float, float]]) -> None:
    layer, draw = polygon_layer(base.size[0])
    draw.polygon(points, outline=(255, 239, 220, 164), width=3)
    draw.line([points[5], points[0], points[1]], fill=(255, 255, 255, 110), width=2)
    draw.line([points[2], points[3], points[4]], fill=(33, 28, 26, 120), width=2)
    base.alpha_composite(layer)


def render_material(mat: dict) -> Image.Image:
    rng = random.Random(f"world-material:{mat['id']}")
    tile = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    center = CELL // 2
    points = hex_points(center, center, HEX_RADIUS)

    draw_shadow(tile, points)

    mask = Image.new("L", (CELL, CELL), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.polygon(points, fill=255)

    gradient = make_gradient(CELL, mat["top"], mat["mid"], mat["bottom"])
    apply_hex_fill(tile, mask, gradient)
    draw_lowpoly_facets(tile, mask, mat, rng, center, center)

    if mat["style"] == "water":
        draw_water_details(tile, mask, rng, center, center)
        draw_glow(tile, points, (180, 236, 255, 84))
    elif mat["style"] == "grass":
        draw_grass_details(tile, mask, rng, center, center, (231, 248, 182))
    elif mat["style"] == "forest":
        draw_forest_details(tile, mask, rng, center, center)
    elif mat["style"] == "mountain":
        draw_mountain_details(tile, mask, rng, center, center)
    elif mat["style"] == "wasteland":
        draw_cracks(tile, mask, rng, center, center, (245, 210, 126))
    elif mat["style"] == "sand":
        draw_cracks(tile, mask, rng, center, center, (248, 228, 185))
    elif mat["style"] == "dirt":
        draw_cracks(tile, mask, rng, center, center, (209, 160, 122))

    rim_points = hex_points(center, center, HEX_RADIUS - 2)
    draw_rim(tile, rim_points)

    # soft edge vignette inside sprite
    vignette = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette, "RGBA")
    vdraw.polygon(rim_points, fill=(255, 255, 255, 0), outline=(0, 0, 0, 72), width=10)
    tile.alpha_composite(vignette.filter(ImageFilter.GaussianBlur(6)))

    return tile


def build_atlas() -> tuple[Image.Image, dict]:
    atlas = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (0, 0, 0, 0))
    frames = {}
    for index, mat in enumerate(MATERIALS):
        col = index % COLS
        row = index // COLS
        x = col * CELL
        y = row * CELL
        atlas.alpha_composite(render_material(mat), (x, y))
        frames[mat["id"]] = {
            "frame": {"x": x + PAD, "y": y + PAD, "w": CELL - PAD * 2, "h": CELL - PAD * 2},
            "sourceSize": {"w": CELL, "h": CELL},
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "label": mat["label"],
        }
    meta = {
        "image": ATLAS_PATH.name,
        "size": {"w": atlas.size[0], "h": atlas.size[1]},
        "cell": CELL,
        "columns": COLS,
        "rows": ROWS,
        "frames": frames,
    }
    return atlas, meta


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    atlas, meta = build_atlas()
    atlas.save(ATLAS_PATH, optimize=True)
    META_PATH.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved atlas: {ATLAS_PATH}")
    print(f"Saved meta:  {META_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
