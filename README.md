# Eazy Fade Studio

The shop's website. Plain HTML, CSS and JavaScript — no build step, no dependencies,
no framework. Open `index.html` and it runs.

```
index.html            the whole page
assets/css/site.css   all styling
assets/js/site.js     the scroll-scrubbed hero and page behaviour
assets/fonts/         three self-hosted variable fonts (latin subset, 148 KB total)
assets/cuts/          ← your haircut photos go here
DESIGN.md             the design decisions, written before the build
```

## Three things to do before this goes live

### 1. Add the four haircut photos

Drop them in `assets/cuts/` with these exact names:

| File | Currently captioned |
|---|---|
| `cut-1.jpg` | Taper & waves |
| `cut-2.jpg` | High-top box fade |
| `cut-3.jpg` | Burst fade, textured top |
| `cut-4.jpg` | 360 waves, crisp edge |

Portrait photos work best (roughly 3:4). Until the files exist the gallery shows a
labelled placeholder for each slot and nothing breaks. Once they are in, the grid
switches automatically to its intended layout with `cut-1` as the large feature tile.

If the captions do not match your photos, edit the `<figcaption>` text in `index.html`
under the `<!-- 5. THE WORK -->` section.

### 2. Set the real prices

**Every price on the page is a placeholder.** They are all in one block in `index.html`
marked:

```html
<!-- ⚠ SET YOUR REAL PRICES HERE — every value below is a placeholder. -->
```

Change the `R90`, `R80`, `R40` … values to your actual prices. Add or remove `<li class="row">`
rows to match what you actually offer.

### 3. Patch the social-preview URLs after the first deploy

`index.html` has a line marked `<!-- DEPLOY STEP -->`. Once you know the live web
address, put it in `og:url`, and make `og:image` the full address of the preview image
(for example `https://your-domain.co.za/assets/hero-still.jpg`). Until then, links
shared on WhatsApp and Facebook will not show a preview image.

## A note on the name

The logo artwork and the shop's Google Business listing both read **"Eazy Fade Studio"**
(singular *Fade*), so that is the spelling used throughout the site. If it should be
"Eazy Fades Studio", search `index.html` and `README.md` for `Eazy Fade Studio` and
replace — and update the Google listing to match, so the two agree.

## Shop details wired into the page

Change these in `index.html` if any of them move. Each appears in more than one place,
so search for the value rather than editing a single line.

- **Address** 19 Madiba St, Paballelo, Upington, 8801
- **Phone** 065 719 6289 (as `tel:+27657196289`)
- **WhatsApp** `https://wa.me/27657196289` with a pre-filled booking message
- **Hours** every day, 10:30–20:00 — also in the `openingHoursSpecification` block and
  in the live "open now / closed" indicator, which is computed in South African time
  regardless of where the visitor is
- **Rating** 5.0 from 4 Google reviews

The address, phone, hours and rating are also published as `HairSalon` structured data
in the `<head>`, which is what Google reads for the search result panel. If you change a
detail in the visible page, change it there too.

## Previewing it locally

It must be served over HTTP — opening the file directly will block the hero video.

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000
```

## Deploying

Any static host works — GitHub Pages, Netlify, Vercel, Cloudflare Pages. Upload the
repository as-is; there is nothing to compile. Serve it over HTTPS so the WhatsApp and
phone links behave properly on mobile.

## How the hero works

Scrolling the first screen scrubs an 8-second logo animation frame by frame: darkness,
the chair, the tools, the mark. The page settles exactly as the mark lands.

- The video is fetched as a Blob so seeking works on hosts without HTTP Range support.
- Two encodes exist; the browser is served whichever it can decode, and only that one
  is downloaded.
- Phones, portrait tablets, landscape phones and anyone using "reduce motion" get a
  composed static hero instead and **never download the video at all**.
- If the video fails for any reason, the page falls back to the still and stays complete.

### Regenerating the video assets

All the stills and both encodes came from the original clip with ffmpeg. The scrub
encodes use a dense keyframe interval (`-g 8`), which is what makes scrubbing smooth
rather than choppy — a normal encode will stutter.

```bash
# H.264, trimmed to 6.70s (the original ends with 1.6s of frozen frames)
ffmpeg -ss 0 -to 6.70 -i source.mp4 -an -vf "scale=720:1280:flags=lanczos" \
  -c:v libx264 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 \
  -crf 19 -preset slow -movflags +faststart assets/hero-scrub.mp4

# VP9
ffmpeg -ss 0 -to 6.70 -i source.mp4 -an -vf "scale=720:1280:flags=lanczos" \
  -c:v libvpx-vp9 -crf 30 -b:v 0 -g 8 -keyint_min 8 -row-mt 1 assets/hero-scrub.webm
```

If you re-encode, update the byte sizes in the `SOURCES` array in `assets/js/site.js` —
they are the fallback used when a host does not send `Content-Length`.
