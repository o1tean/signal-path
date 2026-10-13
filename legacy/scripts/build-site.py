#!/usr/bin/env python3
"""Stage only public course files for GitHub Pages."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir()
for file in ROOT.glob('*.html'): shutil.copy2(file, OUT / file.name)
for name in ['.nojekyll','sitemap.xml','robots.txt']:
    if (ROOT / name).exists(): shutil.copy2(ROOT / name, OUT / name)
for name in ['assets','modules','downloads']:
    shutil.copytree(ROOT / name, OUT / name)
example = OUT / 'examples/lab-companion'
example.mkdir(parents=True)
for name in ['application.fam','lab_companion.c']:
    shutil.copy2(ROOT / 'examples/lab-companion' / name, example / name)
print('Staged public files in _site/ (no notebooks, build caches or repository metadata).')
