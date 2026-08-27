# Eazy Fade Studio

The shop's website. Plain HTML, CSS and JavaScript — no build step, no dependencies,
no framework. Open `index.html` and it runs.

```
index.html            the whole page
assets/css/site.css   all styling
assets/js/site.js     the scroll-scrubbed hero and page behaviour
assets/fonts/         three self-hosted variable fonts (latin subset, 148 KB total)
assets/work/          your five haircut photos
DESIGN.md             the design decisions, written before the build
```

## Three things to do before this goes live

### 1. (Done) Your photos are on the site

Your five cuts are in `assets/work/`:

| File | Where it appears | Caption |
|---|---|---|
| `skin-fade.jpg` | "No line where it begins" section | Soft where it fades, hard where it lands. |
| `waves-lineup.jpg` | Gallery | Waves & line-up |
| `burst-fade.jpg` | Gallery | Burst fade |
| `box-fade.jpg` | Gallery | Box fade |
| `waves-top.jpg` | Gallery | 360 waves |

All five were resized to 900px wide and stripped of metadata. `skin-fade.jpg` was
cropped along the top to remove a "Utool" app watermark that was in the corner of the
original.

To change a photo, replace the file in `assets/work/` keeping the same name — nothing
else needs editing. To change what a photo is called on the page, edit its
`<figcaption>` in `index.html`. If you swap a photo for a different cut, update its
`alt` text too, since that is what screen readers and Google read.

Photos are shown slightly darkened so they sit in the dark page, and return to their
true colour when you hover over them. If you would rather they always show at full
brightness, delete the `filter:` lines under `.shot img` and `.premise__fig img` in
`assets/css/site.css`.

### 2. (Done) Prices are the shop's real ones

The board lists six services. Your first line — standard haircut / taper fade / skin fade,
all R100 — is split into three rows so a client can book the *specific* cut and you know
which one is coming. Same price on all three.

| Service | Price |
|---|---|
| Standard haircut | R100 |
| Taper fade | R100 |
| Skin fade | R100 |
| Haircut + enhancement | R150 |
| Haircut + dye | R170 |
| House call | R250 |

To change a price, edit it in `index.html` under `<!-- 2. THE BOARD -->`. The booking form
reads its list from this board, so it follows automatically.

**Check the two descriptions I wrote for you:** "The cut, plus the hairline enhanced and
filled in" and "The cut, plus colour through the top". I inferred those from the service
names — if either is wrong, fix the `row__d` text on that row.

**House calls ask for an address.** When a client picks House call, the booking form
requires it and the message you receive says "Address:" instead of "Notes:".

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

The hero is the shop's brand film, playing by itself: darkness, the chair, the clipper
and shears, then the mark settling. It starts as soon as the page loads — no scrolling,
no clicking.

- **Muted and inline**, which is what lets browsers autoplay it at all. The file has no
  audio track, so there is nothing to unmute.
- **It plays once and rests on the logo.** If you scroll away it pauses to save battery,
  and it picks up again when you scroll back. If it had already finished, it restarts.
  To make it loop continuously instead, add `video.loop = true;` inside `loadHero()` in
  `assets/js/site.js`.
- **Two encodes.** The browser is served whichever it can decode — `hero.webm` (VP9,
  2.3 MB) for Chrome, Edge and Firefox, `hero.mp4` (H.264, 3.0 MB) for Safari — and only
  that one is downloaded.
- **On desktop** the footage sits in a gold-edged portrait frame in the middle, with the
  headline to its left and your hours and buttons to its right. It is 9:16, so framing it
  this way shows the whole picture instead of cropping two thirds of it away.
- **On phones** it fills the screen edge to edge, which is exactly the shape it was made
  for, with the copy over the top and bottom.
- **Reduce motion** turns the video off entirely — it is never even downloaded — and the
  frame holds the still logo instead. The words and buttons are identical either way.
- If the video fails to load for any reason, the frame falls back to the still logo and
  the page is complete.


## Bookings

Every **Book a chair** button opens the booking window. It asks three things in order —
when, what, who — then stamps the booking with a reference like `EF-7QK2` and shows a
receipt.

### What actually happens when someone books

**Be clear on this: the website cannot send messages by itself.** It is a plain set of
files on a web host — there is no server behind it, no account, nothing running.

So the receipt screen does two things:

1. **Tells the client to screenshot it.** The reference and all the details are on
   screen, and a photo on their phone is the record they bring in with them.
2. **Hands the booking to you in one tap.** The gold **Send to the shop** button opens
   WhatsApp on their phone with the whole booking already typed out, addressed to
   **065 719 6289**. They press send. You get it. No cost, no account.

The client ends up with two copies without doing anything clever: the screenshot, and the
message itself sitting in their own WhatsApp chat with the shop once they have sent it.

The receipt says plainly that nothing is booked until they press send, so nobody turns up
thinking they have a slot when you never got the message.

The last booking made on a phone is remembered for 60 days, so if someone closes the page
they can reopen it and see their reference again.

### The message you receive

```
EAZY FADE STUDIO
Booking EF-7QK2

Name: Thabo M
Phone: 065 719 6289
When: Fri, 28 Aug at 14:30
Cut: Skin fade (R90)
Notes: Low fade, sharp line-up

19 Madiba St, Paballelo, Upington
```

### Changing how it works

Everything is at the top of the `booking` section in `assets/js/site.js`:

| What | Where |
|---|---|
| Your WhatsApp number | `SHOP_WA` |
| Opening and closing time | `OPEN_MIN`, `CLOSE_MIN` |
| Gap between slots (30 min) | `STEP_MIN` |
| How far ahead someone must book (30 min) | `LEAD_MIN` |
| How far ahead the calendar goes (60 days) | in `reset()` |

**The list of cuts comes from the price board itself** — change a service or a price in
`index.html` and the booking form follows automatically. There is no second list to keep
in step.

Times already gone are struck out, and the shop's own clock is used, so a client
booking from another country still sees Upington time.

### If you want bookings to send themselves

Real automatic sending — the client books and both phones get a message with nobody
pressing send — needs three things this site does not have:

1. A server to run the sending (a free Vercel or Netlify function is enough).
2. **WhatsApp Business Platform** access, which means a Meta Business account and
   approval of your message templates. It is free for the first 1,000 conversations a
   month, then charged per conversation.
3. Or, more simply, an SMS provider (Twilio, Clickatell, BulkSMS) — no approval needed,
   roughly 20–40c per SMS in South Africa.

Until then, the one-tap handoff is what most shops this size use, and it works today.

## The map

The bottom of the page embeds Google Maps for 19 Madiba Street. It needs no API key — it
uses Google's `output=embed` URL, which is free and unlimited.

If Google cannot be reached (a strict content policy, or no network) the page shows a
styled panel with the address and a link out to Maps instead of an empty grey box.

The embed is tinted dark to match the rest of the site, via this line in `assets/css/site.css`:

```css
.map__embed{ filter:invert(.92) hue-rotate(180deg) saturate(.7) contrast(.92) }
```

If you would rather have Google's normal light-coloured map, delete that `filter` line.
