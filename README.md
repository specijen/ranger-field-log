# Ranger Field Log

A phone app for conservation field staff to log, with GPS:

- **Pest control** — feral pigs, foxes, cats, goats, deer and more: number, method (shot, trapped, baited…)
- **Native sightings** — species, count, how detected (seen, heard, tracks, camera trap)
- **Maintenance** — fencing, weeds, traps, water points and other property work

Each entry records the species or task (with scientific name), quantity and unit, method, the date and time it happened, latitude/longitude (WGS84) with accuracy, who logged it, site and comments.

- **Date and time:** *Log as now* uses the current time; change the date/time field to log something after the fact. The CSV keeps both the observation time and when it was entered.
- **Logged by** is required and is remembered for the next entry.
- **Location:** *Live GPS*, or *Use map* to tap the spot on the offline property map (aerial photo or topo, opening on whichever was used last). Map points are tagged `map-aerial` / `map-topo` with an estimated accuracy.
- **Log again** on any entry copies it into the form with the current time and the same location, ready to check and save.
- **Photos:** *Take photo* opens the camera; *Choose from library* picks one or more existing photos. Photos are shrunk to 1600 px and stored with the entry on the phone. HEIC/HEIF photos (e.g. Samsung's "High efficiency pictures") are converted to JPEG on the phone when the browser can't show them, using the bundled `lib/heic-to` converter (LGPL-3.0, loaded only when needed, works offline); the CSV records how many each entry has (`photos_on_device`).
- **Send by email:** opens the phone's share menu with the CSV attached (and, optionally, the photos, named to match the CSV's `photo_files` column). Pick Mail, Gmail or Outlook; without signal the email waits in the outbox. *Export CSV* saves the file instead, and *Copy CSV* puts the text on the clipboard. **What to export** applies to all three: *All entries*, *Since last export* (anything entered or edited since the last export), or *From – To* (by observation date, inclusive). A date-range export doesn't reset the *since last export* marker.
- **Log history map:** logged points are drawn on the property's topo map, with the boundary and your current position. Tap the microphone to log by voice: “shot three feral pigs at the north dam” fills in the form, and the recording is kept as an audio memo. Export everything as CSV for a spreadsheet or GIS.

**Works offline.** After the app is opened once with signal, it runs with no internet at all. Entries are stored only on the phone; nothing is sent anywhere. This repository holds the app's code, never field data.

## Installing on an Android phone

Do this once, with signal:

1. Open the app's link in **Chrome**.
2. Tap **Install app** in the top bar (or Chrome menu ⋮ → **Add to Home screen** → **Install**).
3. Open **Field Log** from the home screen. Allow **Location** and **Microphone** when asked.
4. Phone settings → Location: turn location **on**, and turn on **Google Location Accuracy**. Settings → Apps → Chrome → Permissions → Location: **Allow only while using the app**, with **Use precise location** on.
5. Test it: switch on airplane mode, reopen Field Log, save a test entry, then delete it.

## In the field

- Open the app a minute before you need it, in open ground. Wait for the GPS chip to turn green (±10 m or better).
- GPS works with no mobile signal. Voice is always recorded as an audio memo; turning speech into text with no signal depends on the phone having on-device speech recognition.
- **Export regularly** (Export CSV in the Log panel). Entries live only in this app on this phone. Uninstalling the app or clearing Chrome's site data deletes them.

## Property map

`maps/property-1/` holds the offline map: `aerial.jpg` and `topo.jpg` on a plain latitude/longitude grid, and `map.json` with their bounds and the property boundary. Source: NSW Spatial Services (CC BY 4.0); the aerial photo is the 50 cm Wellington capture listed for September 2014. Loading maps for other properties (*Change property map*) is planned.

## Updating the app

Edit `index.html`, then bump `APP_VERSION` in `sw.js`; phones download only the page (about 0.1 MB). If you change a map, icon or the HEIC converter, bump `STATIC_VERSION` too so phones re-download those files (about 1.9 MB plus 3 MB for the converter). With signal, phones load the new version straight away; an open app reloads itself (or shows a Reload button if an entry is half filled in).

## Security notes

- The page carries a Content-Security-Policy that only allows its own files, so it cannot send data to any other site. It refuses to run inside another website's frame.
- CSV text that starts with `=`, `+`, `-` or `@` gets a leading `'` so spreadsheets treat it as text, not a formula. Plain numbers are untouched.
- Only JPEG, PNG, HEIC and WebP photos are accepted. The HEIC converter runs in a blob worker, which is why the policy allows `worker-src blob:`.
- Anyone who can push to this repository can change the app on every phone: keep two-factor sign-in on the GitHub account and limit who has write access.
- All GitHub Pages sites under `specijen.github.io` share one browser storage area. Don't publish other sites there, or move Field Log to its own domain.
- Entries, photos and memos are stored unencrypted in the phone's browser storage; keep phones locked with a passcode.

