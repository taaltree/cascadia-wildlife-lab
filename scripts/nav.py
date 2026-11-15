#!/usr/bin/env python3
"""Write the same site navigation into every page:  python3 scripts/nav.py [--check]

Every page with the standard header (<ul class="nav-links" id="nav-links">) gets the same menu: Our Labs (dropdown), Data & Tools (dropdown:
distribution maps, CascadiaTools and its main pages, the field course), Impact, Team, Support, Contact. Links are made relative to each page's
folder, and the link to the page itself is marked aria-current="page". The dropdowns use the existing .has-menu / .nav-menu-btn code in
assets/js/main.js and styles in assets/css/main.css. Edit MENU below to add a page to the menu, then rerun. --check exits 1 if any page is
out of date (for CI).
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABS = [("genetics/index.html", "Genetics Laboratory", None), ("ai/index.html", "AI Lab", None), ("analysis/index.html", "Analysis Lab", None),
        ("work-with-us/index.html", "Work With Us", "sep")]
TOOLS = [("tools/distributions/index.html", 'Distribution Maps: Cascadia <span class="nav-tag">Pilot</span>', None),
         ("tools/distributions/na/index.html", 'Distribution Maps: North America <span class="nav-tag">Beta</span>', None),
         ("tools/index.html", "CascadiaTools", "sep"), ("tools/install.html", "Install CascadiaTools", None),
         ("tools/finder.html", "Find my analysis", None), ("tools/examples.html", "Worked examples", None),
         ("tools/course/index.html", "Field Course", "sep")]
TAIL = [("impact/index.html", "Impact", None), ("index.html#team", "Team", None), ("support/index.html", "Support", None)]
PAT = re.compile(r'(<ul class="nav-links" id="nav-links">)(.*?)(\n?[ \t]*</ul>\s*\n?[ \t]*</div>\s*\n?[ \t]*</nav>)', re.S)


def rel(page, target):
    """Root-relative written as '../' x depth + target, the site's convention (scripts/check-site.py compares menus after stripping '../')."""
    if page == "404.html":  # served at whatever URL was missing, so its links must be root-absolute (as its own links are)
        return "/" + target
    return "../" * page.count("/") + target


def item(page, target, label, sep, indent):
    cur = ' aria-current="page"' if target == page else ""
    cls = ' class="nav-menu-sep"' if sep else ""
    return f'{indent}<li{cls}><a href="{rel(page, target)}"{cur}>{label}</a></li>'


def menu(page, ind):
    i1, i2, i3 = ind + "  ", ind + "    ", ind + "      "
    out = [f'{i1}<li class="nav-item has-menu">', f'{i2}<button class="nav-menu-btn" type="button" aria-expanded="false" aria-controls="nav-menu-labs">Our Labs</button>',
           f'{i2}<ul class="nav-menu" id="nav-menu-labs">'] + [item(page, *x, i3) for x in LABS] + [f"{i2}</ul>", f"{i1}</li>"]
    out += [f'{i1}<li class="nav-item has-menu">', f'{i2}<button class="nav-menu-btn" type="button" aria-expanded="false" aria-controls="nav-menu-tools">Data &amp; Tools</button>',
            f'{i2}<ul class="nav-menu" id="nav-menu-tools">'] + [item(page, *x, i3) for x in TOOLS] + [f"{i2}</ul>", f"{i1}</li>"]
    out += [item(page, *x, i1) for x in TAIL]
    out += [f'{i1}<li><a href="{rel(page, "index.html#contact")}" class="nav-cta">Contact Us</a></li>']
    return "\n" + "\n".join(out)


SB = re.compile(r"<!-- sitebar:start -->.*?<!-- sitebar:end -->\n?", re.S)


def sitebar(page):
    """Slim bar for pages without the standard header (standalone documents, 404): home link + a no-JavaScript Data & Tools menu."""
    li = "".join(f'<li{" class=sep" if sep else ""}><a href="{rel(page, t)}"{" aria-current=page" if t == page else ""}>{lab}</a></li>' for t, lab, sep in TOOLS)
    return ('<!-- sitebar:start --><style>.cwl-sb{position:relative;z-index:1000;display:flex;align-items:center;gap:1.2rem;padding:.45rem 1rem;'
            'background:#1b3a1b;color:#fff;font:500 .9rem/1.3 system-ui,sans-serif}.cwl-sb a{color:#fff;text-decoration:none}.cwl-sb>a{font-weight:700}'
            '.cwl-sb details{position:relative}.cwl-sb summary{cursor:pointer;list-style:none}.cwl-sb summary::after{content:" \\25BE"}'
            '.cwl-sb summary::-webkit-details-marker{display:none}.cwl-sb ul{position:absolute;left:0;top:1.9rem;margin:0;padding:.35rem 0;list-style:none;'
            'min-width:17rem;background:#fff;border-radius:4px;box-shadow:0 6px 24px rgba(0,0,0,.18)}.cwl-sb li a{display:block;padding:.4rem .9rem;color:#1b3a1b}'
            '.cwl-sb li a:hover,.cwl-sb li a:focus-visible{background:#eef3ef}.cwl-sb li.sep{border-top:1px solid #dde5df;margin-top:.25rem;padding-top:.25rem}'
            '.cwl-sb .nav-tag{font-size:.65rem;border:1px solid currentColor;border-radius:2px;padding:0 .3rem;margin-left:.35rem;opacity:.75}'
            '@media(max-width:560px){.cwl-sb details{position:static}.cwl-sb ul{left:.5rem;right:.5rem;top:100%;min-width:0}}</style>'
            f'<nav class="cwl-sb" aria-label="Site"><a href="{rel(page, "index.html")}">Cascadia Wildlife Lab</a>'
            f'<details><summary>Data &amp; Tools</summary><ul>{li}</ul></details></nav><!-- sitebar:end -->\n')


def main():
    check = "--check" in sys.argv
    changed, skipped = [], []
    for f in sorted(ROOT.rglob("*.html")):
        if ".git" in f.parts:
            continue
        page = f.relative_to(ROOT).as_posix()
        s = f.read_text()
        m = PAT.search(s)
        if not m:
            body = re.search(r"<body[^>]*>", s)
            if not body:
                skipped.append(page)
                continue
            s0 = SB.sub("", s)
            body = re.search(r"<body[^>]*>", s0)
            new = s0[:body.end()] + "\n" + sitebar(page) + s0[body.end():].lstrip("\n")
            if new != s:
                changed.append(page)
                if not check:
                    f.write_text(new)
            continue
        line_start = s.rfind("\n", 0, m.start()) + 1
        ind = re.match(r"[ \t]*", s[line_start:]).group(0)
        new = s[:m.start()] + m.group(1) + menu(page, ind) + m.group(3) + s[m.end():]
        if new != s:
            changed.append(page)
            if not check:
                f.write_text(new)
    print(("out of date: " if check else "updated: ") + str(len(changed)), "| no standard header (left as is):", skipped)
    if check and changed:
        sys.exit(1)


if __name__ == "__main__":
    main()
