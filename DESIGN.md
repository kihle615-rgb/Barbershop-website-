# Design Package — Eazy Fade Studio

Written before the build. Every line of copy here ships verbatim.

## 1. The brand premise

A fade is a gradient you are not supposed to be able to see. Done right, there is no line
where it begins — skin becomes shadow becomes hair with no visible step. That invisible
transition is the whole claim of the shop's name, so it is the whole claim of the site:
nothing here snaps, every section graduates into the next, and the one hard edge in the
craft — the line-up at the hairline — is the one thing the visitor performs with their
own hands.

## 2. The palette as CSS tokens

Sampled from the supplied footage, so page and video read as one place. Values taken with
ffmpeg from the logo frame (specular on the mark's E), the chair orbit, and the letterbox
shadows.

```css
:root{
  --canvas:#0B080D;       /* footage shadow, cool-violet tinted near-black, never #000 */
  --canvas-deep:#050308;  /* the frame's letterbox black */
  --panel:#15111C;        /* cards and raised surfaces */
  --accent:#E0A94A;       /* the mark's gold body — the CTA */
  --accent-hover:#EDB754; /* gold one step brighter */
  --accent-muted:#7A5A2B; /* gold in shadow: hairlines, ticks, glows */
  --gold-bright:#FFE481;  /* the specular on the E. Rare: shine sweep only */
  --steel:#9BA0A6;        /* the mark's silver half — a co-equal second metal */
  --steel-dim:#5C5F66;
  --text-primary:#F3EFE7;
  --text-secondary:#918B99;
}
```

**The deviation, said out loud.** Near-black with a gold accent is on the banned-defaults
list. It is used here because it is not a reach for "dark and cinematic" — it is the
client's actual logo and the actual grade of the client's actual footage. It is earned
three ways: every value above is sampled from that footage rather than picked; the mark is
deliberately *bi-metallic* (gold E, silver F), so steel carries as much of the page as gold
does, which is not the default look; and the display face is a wide industrial grotesque,
not the high-contrast serif the default pairs with.

## 3. The type trio

| Role | Face | Weights | Why |
|---|---|---|---|
| Display | **Archivo** (variable, wdth 112) | 800 | Wide, squared, industrial — matches the wordmark's own proportions |
| Body | **Hanken Grotesk** | 400, 500 | Quiet humanist, stays out of the display's way |
| Utility | **Martian Mono** | 400, 600 | Wide-tracked mono for guard numbers, prices, hours — echoes the letterspaced "PRECISION. CONFIDENCE. CHARACTER." under the mark |

Never Inter or Roboto as display.

## 4. The band map

Hero is **640vh** (scroll range 540vh). Progress 0→1 drives 6.71s of footage.
Each band gets a ~119vh band with ~11vh eased ramps, leaving a ~97vh fully-settled plateau.

| Band | Range | Footage moment (video time) | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00–0.23 | 0.0–1.5s — black, the first gold glint finding the chair | "A fade is a line you can't find." | Blur-to-sharp (focus arriving) |
| 2 | 0.26–0.49 | 1.7–3.3s — the chair fully lit, camera orbiting | "Every one of them starts in the same chair." | Drift-down (the light settling onto it) |
| 3 | 0.52–0.75 | 3.5–5.0s — clippers and shears on tufted leather | "Clippers set the gradient. The blade sets the edge." | Grid snap-align (blades aligning) |
| 4 | 0.79–1.00 | 5.3–6.71s — hard cut at 5.71s, the mark settling | left: "Paballelo, Upington" / "Open every day · 10:30–20:00" — right: "Book on WhatsApp" / "065 719 6289" | Word-by-word rise into a staged settle |

**Band 4 has no headline of its own.** At the settle the footage *is* the wordmark, so the
mark in the centre panel is the headline; the band supplies only the facts on its left and
the actions on its right. The hero's last frame is a complete business card.

**Layout note that changes the legibility system.** The footage is portrait (1080×1920).
Rather than cover-crop 68% of it away for a landscape hero, the video sits in its native
9:16 inside a gold-hairline panel in the centre lane, and the bands flank it. Text therefore
sits on the canvas, not on footage, and the per-band radial scrims the standard calls for
are not needed on desktop. The centre lane stays untouched so the mark stays bright. The
static hero *is* full-bleed text-over-image, so the full four-layer legibility system
applies there.

## 5. The static-hero copy block

Shown on phones, portrait tablets, coarse-pointer portrait, landscape phones, and reduced
motion — over `hero-still.jpg` (the settled mark).

- Headline: **"A fade is a line you can't find."**
- Subline: **"Eazy Fade Studio. Paballelo, Upington — open every day, 10:30 to 20:00."**
- Actions: **"Book on WhatsApp"** (primary) · **"Call 065 719 6289"**

## 6. The below-fold outline

Every section funnels to one anchor: `#book`.

1. **The premise** — "No line where it begins." Asymmetric: statement left, the shears-on-leather still right.
2. **The board** — services as a barbershop price board: rows, leader dots, mono numerals. *(Prices are placeholders pending the owner's real numbers.)*
3. **The four marks** — Precision · Confidence · Style · Legacy, lifted from the logo's own four icons, redrawn as SVG.
4. **Line it up** — the one interactive moment. Press and hold; a soft hairline sharpens into a crisp edge and the booking CTA ignites. Release early and it eases back.
5. **The work** — the cut gallery. *(Awaiting the owner's four photos; designed empty state until then.)*
6. **What people say** — the real Google rating: 5.0 from 4 reviews.
7. **Find the shop** — hours table, address, directions, call, WhatsApp.
8. **Footer** — mark, hours, contact.

## 7. The vector layer plan

- The **EF monogram** redrawn as inline SVG with the sampled gold/steel gradients — nav, footer, and the favicon.
- The **four mark icons** (clipper, head, shears, razor) as inline SVG, stroked in gold.
- The **guard rail** (see below), an SVG gradient strip with tick marks.
- Whisper-level: one slow gold glow drift behind the page, 72s cycle. No particles.

All of it honours reduced motion: final states shown, drives stopped.

## 8. The signature element

**The guard rail.** A fixed vertical rail down the left edge that renders the page itself as
a fade: bare at the top, graduating to full length at the bottom, ticked with real clipper
guard numbers (0, ½, 1, 2, 3, 4). The tick for the section you are in lights gold; clicking
one jumps there. It is a scroll indicator that encodes something true — the site is a fade,
and the numbers are the shop's own measuring system, not decorative 01/02/03. The boldness
budget is spent here; everything else stays quiet.

Removed, the page would lose its only structural idea. That is the loudness test passed.

## 9. The copy gate line

Every line above ships verbatim into the build. No paraphrasing at wiring time.

---

## Build notes — what changed from the plan, and why

Recorded after the build, per the copy gate. Three things moved:

1. **The static hero was recomposed.** The plan put the copy over `hero-still.jpg`
   (the settled mark) full-bleed. In the browser the headline landed directly on the
   logo's own baked-in "EAZY FADE STUDIO" wordmark — two competing sets of type in the
   same space. It is now composed instead: the mark framed exactly like the desktop
   panel, the copy beneath it on clean canvas. No scrim needed, because nothing sits
   over the artwork. `hero-still.jpg` is still used for the desktop video-failure state,
   where no text goes over it.

2. **Two encodes instead of one.** `hero-scrub.webm` (VP9, 2.3 MB) is served to anything
   that reports VP9 support; `hero-scrub.mp4` (H.264, 3.0 MB) covers Safari. Selection is
   a `canPlayType` check at load, and only the chosen file is ever fetched. VP9 is 25%
   lighter for the large majority of visitors.

3. **`--steel-dim` was lifted from `#5C5F66` to `#7C8088`.** The original value measured
   3.11:1 against the canvas on the signature line and 3.21:1 in the footer legal — both
   below the 4.5:1 floor for body-size text. The new value measures 5.02:1 and 5.18:1.

The band map, palette, type trio, section order and signature element all shipped as
planned. All copy shipped verbatim.
