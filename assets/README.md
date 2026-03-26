Assets folder — placeholders and naming conventions

Structure:
- assets/
  - lobby/        # scene backgrounds and pedestal sprites
  - heroes/       # hero portraits, stage sprites
  - world/        # world map atlases, terrain tiles, POI sprites
  - ui/           # UI icons, HUD graphics
  - icons/        # small icons (svg)

Expected example paths (replace placeholders with real images):
- assets/lobby/bg_forest_night.webp
- assets/lobby/bg_mountains_silhouette.webp
- assets/lobby/bg_grass_glow.webp
- assets/lobby/pedestal_back.webp
- assets/lobby/pedestal_front.webp
 - assets/lobby/lobby_pedestal_back.svg (preferred placeholder split from atlas)
 - assets/lobby/lobby_pedestal_front.svg (preferred placeholder split from atlas)

- assets/heroes/ariadne_portrait.webp
- assets/heroes/ariadne_idle.webp
- assets/world/world_materials_atlas.png
- assets/world/world_materials_atlas.json

Naming rules:
- Use only lowercase, underscores, and alphanumerics.
- Hero assets: <heroId>_portrait.webp, <heroId>_idle.webp, <heroId>_front.webp, etc.
- Pedestal layers: pedestal_back.webp, pedestal_front.webp

Placeholders in this folder use the extension `.webplaceholder` to avoid being treated as real images. Replace them with real .webp/.png files keeping the same filename.

How to add a real asset:
1. Copy production image to the path listed above (same name).
2. Prefer WebP for smaller size; PNG is acceptable.
3. Keep aspect ratio consistent for hero portraits (square) and stage sprites.

If you want, I can also create small SVG fallback icons for UI — tell me which ones.

World materials atlas:
Use the helper below to generate the low-poly terrain atlas used by the world-map scene:

```bash
python assets/tools/generate_world_materials_atlas.py
```

The script produces:
- `assets/world/world_materials_atlas.png`
- `assets/world/world_materials_atlas.json`

Splitting a pedestal atlas:
If you have a single atlas image with two stacked pedestal layers (top=back, bottom=front), save it as `assets/lobby/pedestal_layers.png` and run the helper script included in the repo:

```bash
python assets/tools/split_pedestal.py assets/lobby/pedestal_layers.png
```

The script will produce:
- `assets/lobby/lobby_pedestal_back.png` (top half)
- `assets/lobby/lobby_pedestal_front.png` (bottom half)

Requires Python 3 and Pillow (`pip install pillow`). If you prefer, upload the atlas here and I will split it for you.
