# Status Tracker

Offline-capable PWA for fire units to record status timestamps. The UI is available in Finnish and Swedish (toggle in the top right corner).

- Tap a status to record the current time. The latest time shows on the button. Earlier taps are kept and listed in the log below the buttons.
- CLEAR needs two taps to wipe all timestamps.
- All data is stored in the browser's `localStorage`. Nothing leaves the device.

## Configuring statuses

The status buttons are defined in `src/config/statuses.json`, in display order:

```json
[
  { "id": "ack", "label": { "fi": "TVO", "sv": "MOTTAGET" } }
]
```

- `id` is the system ID. Timestamps are stored under it, so keep it stable once in use.
- `label.fi` / `label.sv` are the button labels per language.

The file is bundled into the app, so run `npm run build` and redeploy after editing it. Invalid config (missing labels, duplicate IDs) fails at startup with a descriptive error.

## Develop

    npm install
    npm run dev

## Build

    npm run build     # output in dist/
    npm run preview   # serve the build locally

Host the contents of `dist/` on any static HTTPS server, open it once, then "Add to Home Screen". After that it works offline.
