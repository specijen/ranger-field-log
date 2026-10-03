# Ranger Field Log

A phone app for conservation field staff to log, with GPS:

- **Pest control** — feral pigs, foxes, cats, goats, deer and more: number, method (shot, trapped, baited…)
- **Native sightings** — species, count, how detected (seen, heard, tracks, camera trap)
- **Maintenance** — fencing, weeds, traps, water points and other property work

Each entry records the species or task (with scientific name), quantity and unit, method, latitude/longitude (WGS84), GPS accuracy, altitude, observer, site and comments. Tap the microphone to log by voice: “shot three feral pigs at the north dam” fills in the form, and the recording is kept as an audio memo. Export everything as CSV for a spreadsheet or GIS.

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

## Updating the app

Edit `index.html`, then bump `VERSION` in `sw.js` so phones fetch the new copy. Installed phones update the next time they open the app with signal and show “Update downloaded”; reopening the app applies it.
