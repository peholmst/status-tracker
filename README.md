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

## Deploy with Docker Compose

On your Linux Docker server, clone this repository and run these commands from
its directory. Docker Compose must be installed and the existing `lan_apps`
macvlan network must be present (`docker network inspect lan_apps`). Compose
uses that network as external; it does not create or change its subnet,
gateway, address pool, or `br0` parent interface.

```sh
cp .env.example .env
# Edit .env and set STATUS_TRACKER_IP to an unused, reserved LAN address.
docker compose config
docker compose up -d --build
docker compose ps
```

The example address `192.168.4.200` is in your network's configured pool,
`192.168.4.200/29`. Verify it is free before using it, and ensure your LAN DHCP
server will not assign it to another device. The chosen address must belong to
the existing `192.168.4.0/24` subnet. `.env` is ignored by Git and the image build.

Configure your reverse proxy to forward your app's hostname to
`http://<STATUS_TRACKER_IP>:8080`, using the address you put in `.env`. Terminate
HTTPS at the proxy and use a certificate trusted by your devices; the PWA's
service worker and offline installation require a secure origin. The container
has its own LAN IP, so no host port mapping is needed. Serve it at the root of
the hostname, rather than under a URL subpath.

Macvlan containers cannot communicate directly with the Docker host. If the
proxy runs directly on that host or uses host networking, configure a host-side
macvlan interface or an additional shared bridge network to provide connectivity.
A proxy on another LAN device or attached to `lan_apps` can use the LAN address.
See [Docker's macvlan documentation](https://docs.docker.com/engine/network/drivers/macvlan/).

After pulling changes, rebuild and recreate the app:

```sh
git pull
docker compose up -d --build
```

Use `docker compose logs -f` to inspect logs and `docker compose down` to stop
the app. The external `lan_apps` network remains in place. No server volume or
database is required: timestamps live in each browser's `localStorage`.
Keep the same public HTTPS hostname to retain access to existing browser data;
data from a `fly.dev` origin does not automatically move to a new hostname.

The Fly deployment configuration has been removed. This does not stop or delete
the existing Fly app; retire it separately after verifying the new deployment.

## Develop

    npm install
    npm run dev

## Build

    npm run build     # output in dist/
    npm run preview   # serve the build locally

Host the contents of `dist/` on any static HTTPS server, open it once, then "Add to Home Screen". After that it works offline.
