#!/usr/bin/env python3
"""Sätter ?v=<hash> på style.css och script.js i alla sidor, så att webbläsare hämtar nya versioner direkt.
Kör efter varje ändring i style.css eller script.js:  python3 scripts/bump_version.py"""
import pathlib, hashlib, re
R = pathlib.Path(__file__).resolve().parent.parent
v = {f: hashlib.sha1((R / f).read_bytes()).hexdigest()[:8] for f in ("style.css", "script.js")}
for p in list(R.glob("*.html")) + list((R / "en").glob("*.html")):
    s = o = p.read_text()
    for f, h in v.items():
        s = re.sub(r'(href|src)="((?:\.\./|/)?)' + re.escape(f) + r'(?:\?v=[0-9a-f]+)?"', lambda m: f'{m.group(1)}="{m.group(2)}{f}?v={h}"', s)
    if s != o:
        p.write_text(s)
print(v)
