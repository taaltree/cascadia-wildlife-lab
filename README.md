# Cascadia Wildlife Lab — website

Source for **[cascadiawildlifelab.org](https://cascadiawildlifelab.org)**.

A static site (plain HTML, CSS, and JavaScript — no build step, no framework)
served by GitHub Pages. Anything pushed to `main` is live within about a minute.

---

## Want to suggest a change?

**You do not need to know how to code, and you do not need to install anything.**

- Something wrong, missing, or out of date? → **[Open an issue](../../issues/new/choose)**
- Comfortable editing text yourself? → see **[CONTRIBUTING.md](CONTRIBUTING.md)**
  for the click-by-click browser workflow.

Every suggestion becomes a small, reviewable change that Taal can accept or
decline with one click.

---

## Repository layout

```
index.html            Homepage — mission, the three labs, capabilities, team, contact
genetics/index.html   Cascadia Genetics Laboratory
ai/index.html         Cascadia AI Lab
analysis/index.html   Cascadia Analysis Lab
404.html              Shown for any URL that doesn't exist

assets/css/main.css   All styling for every page
assets/js/main.js     Navigation, scroll reveal, video playback
assets/images/        logos/ · people/ · wildlife/
assets/videos/        Compressed background clips

CNAME                 Custom domain (do not delete — it is what points the domain here)
robots.txt            Search engine instructions
sitemap.xml           Page list for search engines
```

There is no framework and no build step. Edit a file, commit, done.

---

## Running it locally

Only needed if you want to preview larger changes before pushing.

```bash
git clone https://github.com/taaltree/cascadia-wildlife-lab.git
cd cascadia-wildlife-lab
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

---

## Media rules

Large files make the site slow and are painful to remove from git history later.
Before adding an image or video:

| Type | Max dimension | Target file size | Format |
|---|---|---|---|
| Full-width / hero photo | 1800 px wide | under 400 KB | `.jpg` |
| Portrait | 800 px wide | under 150 KB | `.jpg` |
| Logo (needs transparency) | 1000 px wide | under 250 KB | `.png` |
| Background video | 1280 px wide, ≤ 35 s | under 6 MB | `.mp4`, no audio |

[CONTRIBUTING.md](CONTRIBUTING.md#adding-images-and-video) has copy-paste
commands for hitting these numbers.

Keep original, uncompressed footage **out of this repository** — it lives in
Dropbox. GitHub rejects any single file over 100 MB.

---

## Still to do

Content decisions that need a human, not code:

- [ ] Set up email at **info@cascadiawildlifelab.org** — it is published on every
      page and does not exist yet, so inquiries currently bounce
- [ ] Confirm every job title on the team pages is current
- [ ] Add lab or profile links for Joel Ruprecht and Claire Goodfellow
      (they are the only team members without one)
- [ ] Decide whether to build out the Publications / Datasets / News pages that
      the footer used to link to
- [ ] Add a photo for the five Genetics Lab staff currently shown as initials

---

## Deployment

GitHub Pages builds from the `main` branch, root directory.

Push to `main` → live in ~1 minute. Check
[Actions](../../actions) if a change doesn't appear.
