#!/usr/bin/env python3
"""Verify every local reference and in-page anchor across the site.

Run from anywhere:  python3 scripts/check-site.py
Exits non-zero if anything is broken, so CI fails the pull request.
"""
import re, pathlib, sys
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "genetics/index.html", "ai/index.html",
         "analysis/index.html", "404.html"]

errors, warnings = [], []


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []      # (attr_value, tag)
        self.ids = set()
        self.imgs_no_alt = []
        self.h_order = []
        self.dup_ids = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            if a["id"] in self.ids:
                self.dup_ids.append(a["id"])
            self.ids.add(a["id"])
        for key in ("href", "src", "poster"):
            if key in a and a[key]:
                self.refs.append((a[key], tag))
        if tag == "img" and "alt" not in a:
            self.imgs_no_alt.append(a.get("src", "?"))
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.h_order.append(int(tag[1]))


for page in PAGES:
    p = ROOT / page
    if not p.exists():
        errors.append(f"{page}: MISSING")
        continue
    html = p.read_text()
    c = Collector()
    c.feed(html)
    base = p.parent

    for ref, tag in c.refs:
        u = urlparse(ref)
        if u.scheme in ("http", "https", "mailto", "tel", "data"):
            continue
        if ref.startswith("#"):
            if ref != "#" and ref[1:] not in c.ids:
                errors.append(f"{page}: anchor {ref} has no matching id")
            continue
        path = unquote(u.path)
        if not path:
            continue
        target = (ROOT / path.lstrip("/")) if path.startswith("/") else (base / path)
        target = target.resolve()
        if not target.exists():
            errors.append(f"{page}: <{tag}> -> {ref}  (no file at {target})")
            continue
        # cross-page fragment (e.g. ../index.html#contact)
        if u.fragment and target.suffix == ".html":
            other = Collector()
            other.feed(target.read_text())
            if u.fragment not in other.ids:
                errors.append(f"{page}: {ref} -> #{u.fragment} not found in {target.name}")

    for dup in c.dup_ids:
        errors.append(f"{page}: duplicate id=\"{dup}\"")
    for src in c.imgs_no_alt:
        warnings.append(f"{page}: <img> without alt: {src}")
    if c.h_order.count(1) != 1:
        warnings.append(f"{page}: has {c.h_order.count(1)} <h1> elements (expected 1)")

    # required head elements
    for needed, label in [
        (r'rel="canonical"', "canonical link"),
        (r'property="og:image"', "og:image"),
        (r'rel="icon"', "favicon"),
        (r'classList\.add\(.js.\)', "js-detection script"),
    ]:
        if page != "404.html" and not re.search(needed, html):
            errors.append(f"{page}: missing {label}")

    if 'href="#"' in html:
        errors.append(f"{page}: still contains a dead href=\"#\"")

# assets referenced by CSS
css = (ROOT / "assets/css/main.css").read_text()
for m in re.finditer(r'url\((["\']?)([^)"\']+)\1\)', css):
    ref = m.group(2)
    if ref.startswith(("http", "data:")):
        continue
    if not (ROOT / "assets/css" / ref).resolve().exists():
        errors.append(f"main.css: url({ref}) does not resolve")

print(f"pages checked: {len(PAGES)}")
print(f"\nERRORS ({len(errors)}):")
for e in errors:
    print("  ✗", e)
print(f"\nWARNINGS ({len(warnings)}):")
for w in warnings:
    print("  !", w)

sys.exit(1 if errors else 0)
