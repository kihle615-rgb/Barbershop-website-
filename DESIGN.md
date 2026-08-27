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


---

## Second pass — the client's follow-up

Three changes after review:

4. **The hero scrub now runs on phones.** The original build followed the standard's
   default and sent every phone to the static hero. That default assumes landscape
   footage that would have to be cover-cropped; this footage is 9:16, so a portrait
   phone renders it *whole, with no crop at all* — the best screen for it, not the
   worst. The gates dropped from five to two: landscape phones (no room for a portrait
   journey) and reduced motion. Because text now sits over live footage on mobile, the
   per-band scrim and text-shadow system applies there, anchored to the top of the frame
   where the footage is darkest; the settle puts the facts on the top letterbox bar and
   the actions on the bottom one.

5. **The gallery is filled with real frames from the brand film** — the chair in shadow,
   the chair lit, the clipper and shears, the chair square-on — and the section is
   retitled "Inside the studio" to describe what is actually shown. The client's four
   haircut photos never reached the build machine, and inventing haircut images for a
   real barbershop's work gallery would misrepresent the business to its customers.
   Swapping the real photos in is four files in `assets/studio/` plus the captions.

6. **A map band before the footer.** Address panel on the left, live Google embed on the
   right, tinted dark to match. Reachability is probed with a no-cors fetch rather than
   the iframe's load event, which fires for the browser's own error page and is therefore
   useless; when the probe fails the panel shows the address and a link out.


---

## Third pass — the hero plays itself

The client asked for the footage to play automatically rather than being driven by
scroll. That removes the scroll-scrub entirely, and with it the caption band map in
section 4 of this document, the four scroll-timed entrances, the blob loader, the
seek gate, the lerp drive and four of the five static-hero gates. The hero is now one
screen tall instead of 640vh, and the page went from roughly 5,800px of hero to 900px.

What survives is the composition. On desktop the footage still sits in its gold-edged
9:16 frame in the centre lane — cover-cropping a portrait film into a landscape hero
would still throw away two thirds of the picture — with the headline flanking left and
the hours and actions right. On phones it fills the screen, the shape it was made for.

The band map is replaced by a single composed copy block, so the four scroll beats
collapse into one statement: the premise headline, the lede beneath it, and the
facts and actions opposite. Copy is drawn from bands 1 and 4 verbatim; bands 2 and 3
are retired with the mechanism that carried them.

The one thing this pass added rather than removed: a worst-frame legibility audit on
mobile, where copy now sits over live footage. Measuring the lightest pixel under each
text rect across ten points in the footage caught the gold eyebrow at **2.47:1** against
the chair's lit pedestal — the bottom scrim was weakest exactly where that line sits.
Extending and deepening it brings the four measured elements to 17.91, 6.23, 8.01 and
15.93 against a 3.5:1 floor.

Reduced motion still never downloads the video, and the hero copy is now scoped behind a
`.js` class so it can never be left invisible when scripting is off.


---

## Fourth pass — the real work goes in

The client's five haircut photos finally reached the repository, so every stand-in image
is gone. `tools.jpg`, `chair.jpg` and the four `studio/` film frames are deleted; nothing
placeholder remains on the page.

- **The premise section** now carries the high-top with the sides taken to skin — the
  clearest single illustration of the claim the section makes, since the fade blends out
  to nothing while the shape-up stays a hard edge. Captioned with that sentence.
- **The gallery** is the other four, retitled back to "Out of the chair" with each cut
  named for what it is: waves and line-up, burst fade, box fade, 360 waves.
- **The visit section** loses its photo rather than reusing one, and its right column
  becomes a booking panel instead — a surface with its own ground, so it holds against
  the seven-row hours table beside it. The map band directly below already carries the
  place visually, which is what the chair photo had been doing.

Two things done to the files themselves: all five were resized to 900px and stripped of
metadata (WhatsApp had already removed EXIF, so no location data was ever present), and
the high-top photo was cropped along its top edge to remove a third-party app watermark
sitting in the corner.

The photos are shot in a bright salon against yellow walls and brown sofas, which fights
a near-black page. They are graded down (`saturate(.86) contrast(1.06) brightness(.94)`)
so they sit in the design, and return to full colour on hover — the restraint is for the
page, and a closer look gives the honest photograph.


---

## Fifth pass — taking bookings

The client asked for a booking flow: pick a time, pick the cut, add anything specific,
leave a name and WhatsApp number, get a reference, and have a receipt reach both the
barber and the client.

**The honest constraint, stated to the client and written into the page.** A static site
has no server, so it cannot send anything on its own. Automatic delivery to two phones
needs the WhatsApp Business Platform (Meta approval, per-conversation billing) or an SMS
gateway, plus a function to call them. What a static page *can* do is compose the message
and hand it off, which is one tap and free. The receipt screen says so in plain words —
"Nothing is booked until you send it to the shop" — because the failure the client cannot
afford is someone arriving for a slot the barber never received.

**The client's copy is a screenshot.** The first build offered "text myself a copy" and
"copy details" alongside the send button. The client corrected it, and they were right:
nobody in this shop's world SMSs themselves a receipt, they screenshot the screen. So the
receipt now asks for exactly that, and the action row is a single button. Three choices
became one instruction and one action, which is a better screen than the one it replaced.

**Shape.** A native `<dialog>`, so focus trapping, Escape, and background inertness come
from the platform rather than from script. Three steps — When, What, Who — numbered,
which is the legitimate case for numbering: a booking genuinely is a sequence, and the
order carries information the reader needs.

**Decisions worth recording:**

- **The price board is the only list of services.** The chips are built by reading the
  board's rows out of the DOM, so a price edited in the HTML shows up in the booking form
  with nothing else touched. Two lists would have drifted apart within a month.
- **The shop's clock, not the visitor's.** Slot availability and the open/closed
  indicator both resolve through `Africa/Johannesburg`, so a client booking from
  elsewhere still sees Upington time. Slots already gone are struck through, not hidden,
  so the day still reads as a whole.
- **The reference alphabet drops ambiguous characters** — no 0/O, 1/I, 2/Z, 5/S, 8/B — so
  a code read aloud over a phone survives the trip.
- **Errors say what to do.** "That does not look like a South African mobile number. Try
  065 719 6289" rather than "invalid input".

**Three bugs the build surfaced:**

1. `.btn` set `display:inline-flex`, which beat the `hidden` attribute's UA
   `display:none`, so all three navigation buttons showed at once. A global
   `[hidden]{display:none !important}` settles it for the whole page.
2. `.btn` assumed a transparent background, true of the `<a>` elements it was written
   for and false of the `<button>` elements the dialog introduced — the ghost and quiet
   variants rendered with the browser's grey fill.
3. `.bk__step > .bk__label:first-of-type` was meant for the first field in each step, but
   `:first-of-type` counts by element type: in step two the first `<label>` is the notes
   field, several rows down, so its top margin was removed and the label collapsed onto
   the last cut chip. Anchoring to `legend + .bk__label` says what was actually meant.
