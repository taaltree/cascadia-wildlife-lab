# Contributing

Two ways in, depending on how comfortable you are. **Neither requires installing
anything** — option 1 is entirely point-and-click in a web browser.

---

## Option 1 — Just tell us what's wrong (recommended)

Best for: a wrong title, a missing person, an outdated description, a typo, a
broken link, a photo you'd like swapped, or "this section should say something
different."

1. Go to **[Issues → New issue](../../issues/new/choose)**
2. Pick the template that fits
3. Fill in the boxes and submit

That's it. You need a free GitHub account, nothing else.

The more specific you are, the faster it gets fixed. **"The AI Lab page, third
service card, should say bats not birds"** is instantly actionable.
**"The AI page has an error"** means someone has to hunt for it.

---

## Option 2 — Make the edit yourself in the browser

Best for: text changes you can see and fix directly. No git, no terminal, no
local setup — GitHub handles all of it.

1. Open the file you want to change (see the table below)
2. Click the **pencil icon** (✏️) in the top right
3. Make your edit
4. Scroll down, choose **"Create a new branch for this commit and start a pull
   request"**
5. Describe what you changed and click **Propose changes**

Taal gets a notification, reviews it, and merges with one click. If something's
off, you'll get a comment rather than a silent rejection.

**Which file?**

| To change… | Edit |
|---|---|
| Homepage: mission, lab summaries, capabilities, team, contact | `index.html` |
| Genetics Lab page | `genetics/index.html` |
| AI Lab page | `ai/index.html` |
| Analysis Lab page | `analysis/index.html` |
| Colors, fonts, spacing, layout | `assets/css/main.css` |

### Finding your text in the file

Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>F</kbd> in the GitHub editor and
search for a distinctive phrase. HTML looks noisy, but the text you're changing
sits between the tags:

```html
<h3>Cascadia Genetics Laboratory</h3>
<p>
  Noninvasive genetic surveys and environmental DNA — designing
  field protocols, processing challenging samples, and delivering
  population-level genomic inference.
</p>
```

Change the words. Leave the `<p>`, `</p>`, `<h3>` bits alone.

### Two things to know

**Special characters.** In HTML, write `&amp;` instead of `&`. Em dashes (—) and
accented letters can be typed normally.

**The same content appears on more than one page.** The team members, the footer,
and the navigation are repeated in each of the four HTML files. If you change a
person's title, search for their name in all four and update each one. The
checklist in the pull request template reminds you.

---

## Adding images and video

Uncompressed camera-trap footage and DSLR photos are enormous — a single hero
video went from **330 MB to 5 MB** with no visible quality loss. Oversized media
is the fastest way to make the site slow, and GitHub rejects any file over
100 MB outright.

**Please compress before committing.** With
[ffmpeg](https://ffmpeg.org/download.html) installed:

Photo — resize to 1800 px wide, target under 400 KB:

```bash
sips -s format jpeg -s formatOptions 80 -Z 1800 input.jpg --out assets/images/wildlife/output.jpg
```

Portrait — 800 px wide:

```bash
sips -s format jpeg -s formatOptions 82 -Z 800 input.jpg --out assets/images/people/FirstLast.jpg
```

Background video — 1280 px wide, 30 seconds, no audio, target under 6 MB:

```bash
ffmpeg -ss 0 -t 30 -i input.mp4 -vf scale=1280:-2 -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart -an assets/videos/output.mp4
```

Poster frame for that video (shown while it loads, and to anyone who has
reduced-motion or data-saver turned on):

```bash
ffmpeg -ss 2 -i input.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 4 assets/images/wildlife/poster-output.jpg
```

Every `<img>` needs an `alt` description for screen readers and for anyone whose
images fail to load. Describe what's in the frame:

```html
<img src="assets/images/wildlife/marten.jpg"
     alt="Pacific marten peering around a mossy tree trunk in winter" loading="lazy">
```

If you can't compress it, open an issue and attach the original — someone will
handle the conversion.

---

## Checking your work

Nothing is required, but if you have Python installed you can preview locally:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

Worth a look after any change:

- Does it read correctly on a narrow window (phone width)?
- Do the links go where they should?
- Did you update all four pages if the content is repeated?

---

## What gets merged

Changes are accepted when they are accurate, keep every link working, don't
balloon page weight, and keep the visual language consistent.

Corrections to facts about people — titles, affiliations, areas of focus — are
always welcome, especially from the person in question.
