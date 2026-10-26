# Jiddat AI – portable local n8n

n8n **2.44.7** in Docker, with SQLite. Everything lives in this one folder, so you can copy the folder to another PC or a VPS and it runs the same: workflows, credentials, settings and execution history.

```
jiddat-ai-n8n-local/
├─ docker-compose.yml   committed: how n8n runs (pinned version)
├─ .env.example         committed: template, no secrets
├─ .env                 NOT committed: your settings + N8N_ENCRYPTION_KEY
└─ data/                NOT committed: created on first start
   ├─ n8n/              database.sqlite, config (key copy), storage/ (binary data)
   └─ files/            files that workflows read/write (/home/node/.n8n-files)
```

## The encryption key (read this once)

n8n encrypts every saved credential with `N8N_ENCRYPTION_KEY` before it writes it to the database. That covers API keys, passwords and OAuth tokens. **Without this exact key, your saved credentials can't be decrypted on any machine.** If n8n starts with a different key, it refuses to start (`Mismatching encryption keys`). If you lose the key, you have to re-enter every credential by hand.

- It is created once, in `.env`. Never change it after the first start.
- **Copy it into your password manager now.** If your disk dies, `.env` dies with it.
- n8n also keeps a copy in `data/n8n/config`. That's why `.env` and `data/` must always travel together.
- `.env` plus `data/` together give full access to every credential. Treat them, and every backup, like a password.

Tested: copying the folder to a new location kept every credential readable. Using a wrong key stopped n8n from starting. With the right key in `.env`, credentials still decrypted even after `data/n8n/config` was deleted.

## First start (Windows, PowerShell)

Requires Docker Desktop with the WSL2 backend. Put the folder on a **local disk**, for example `C:\dev\jiddat-ai-n8n-local`. Never put it in OneDrive, Dropbox or Google Drive, and watch out because Desktop and Documents are often OneDrive-synced. Sync tools can corrupt a live SQLite database.

```powershell
cd C:\dev\jiddat-ai-n8n-local

# Creates .env with a fresh random key. Refuses to touch an existing .env.
if (Test-Path .env) { Write-Warning '.env already exists - keeping it. Never regenerate the key.' } else {
  $b = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  $key = -join ($b | ForEach-Object { $_.ToString('x2') })
  (Get-Content .env.example) -replace '^N8N_ENCRYPTION_KEY=.*', "N8N_ENCRYPTION_KEY=$key" | Set-Content -Encoding ascii .env
  "Save this key in your password manager now: $key"
}

docker compose up -d
```

After about 30–60 seconds, open **http://localhost:5678** and create your owner account (email + password). Nobody else creates it for you.

If `.env` is missing or the key is empty, `docker compose` refuses to start. That stops n8n from silently generating a key you don't know about.

## Daily use

Run these from the project folder.

| Action | Command |
|---|---|
| Start | `docker compose up -d` |
| Stop (keeps container) | `docker compose stop` |
| Stop + remove container (data stays in `data/`) | `docker compose down` |
| Status / health | `docker compose ps` (should show `Up … (healthy)`) |
| Logs | `docker compose logs -f --tail 100` |
| Health endpoint | `curl.exe -s http://localhost:5678/healthz/readiness` → `{"status":"ok"}` |

**After a reboot:** the container has `restart: unless-stopped`, so it comes back by itself whenever Docker runs. On Windows, Docker runs only after you sign in. Keep Docker Desktop → Settings → General → *Start Docker Desktop when you sign in* switched on. To test: reboot, sign in, wait about a minute, then run `docker compose ps` or open http://localhost:5678. If you ran `docker compose stop` before the reboot, n8n stays stopped. That's what *unless-stopped* means.

## Where your data lives

| What | Where |
|---|---|
| Workflows, credentials (encrypted), executions, users, settings | `data/n8n/database.sqlite` (+ `-wal`, `-shm` while running) |
| Copy of the encryption key, instance ID | `data/n8n/config` |
| Binary data (files passed between nodes) | `data/n8n/storage/` |
| Files written by Read/Write Files nodes | `data/files/` (= `/home/node/.n8n-files` in workflows) |
| Encryption key + settings | `.env` |

No Docker volumes are used. Deleting the container or the image never touches your data.

## Backup

Stop n8n first so SQLite writes a consistent file. Windows 10/11 ships `tar`, so the archive format is the same everywhere.

```powershell
# Windows PowerShell
docker compose stop
New-Item -ItemType Directory -Force backups | Out-Null
tar -czf "backups/n8n-$(Get-Date -Format yyyy-MM-dd_HHmm).tgz" .env docker-compose.yml data
docker compose start
```

```bash
# Linux / VPS
docker compose stop && mkdir -p backups && tar -czf "backups/n8n-$(date +%F_%H%M).tgz" .env docker-compose.yml data && docker compose start
```

Keep copies **off this PC**, for example on an external disk or encrypted cloud storage. The archive contains your key, so protect it like a password. Also keep the key separately in your password manager.

**Restore:** `docker compose down`, extract the archive into an empty folder (`tar -xzf n8n-….tgz`), then run `docker compose up -d` from there. On Linux, also run `sudo chown -R 1000:1000 data`.

## Move to another PC or a VPS

Run the **same n8n version** on the new machine first. Upgrade only after the move works.

1. **Old machine:** create a backup archive (above). Leave n8n stopped. If both copies run, every schedule and trigger fires twice.
2. **Copy** the archive across. Windows has `scp` built in:
   `scp backups/n8n-<date>.tgz user@your-vps:~/`
3. **New machine:** install Docker (Docker Desktop on Windows/Mac; Docker Engine + Compose plugin on Linux: https://docs.docker.com/engine/install/).
4. **Extract and start:**
   - Windows: extract into e.g. `C:\dev\jiddat-ai-n8n-local`, then `docker compose up -d`.
   - Linux/VPS:
     ```bash
     mkdir -p ~/n8n && tar -xzf ~/n8n-<date>.tgz -C ~/n8n && cd ~/n8n
     sudo chown -R 1000:1000 data     # n8n runs as uid 1000; without this it crash-loops
     chmod 600 .env
     docker compose up -d
     ```
5. **Check:** `docker compose ps` shows `(healthy)`. Log in with your existing email and password. Open a credential to confirm it decrypts.
   On a VPS without a domain yet, n8n only listens on the VPS's localhost. Reach it from your PC through an SSH tunnel, with nothing exposed publicly:
   `ssh -L 5678:localhost:5678 user@your-vps`, then open http://localhost:5678.

Alternative: `git clone` the repo on the new machine and copy only `.env` and `data/` into it.

## Upgrade

1. Check the release notes for breaking changes: https://docs.n8n.io/release-notes/. Pick a version tagged *stable*: https://hub.docker.com/r/n8nio/n8n/tags.
2. **Back up** (above). Database migrations only go forward, so the backup *is* your rollback.
3. In `docker-compose.yml`, change `image: n8nio/n8n:2.44.7` to the new version.
4. Run:
   ```powershell
   docker compose pull
   docker compose up -d
   docker compose logs --tail 50
   ```
5. **Rollback:** `docker compose down`, restore the backup archive (it contains the old `docker-compose.yml`), then `docker compose up -d`.

## Notes

- **Timezone:** `Asia/Karachi` is set via `GENERIC_TIMEZONE` and `TZ`. In Code nodes, use `$now` / `DateTime` (Luxon), which follow Asia/Karachi. Plain JavaScript `new Date().toString()` inside a Code node shows **UTC**, because n8n doesn't pass `TZ` to its code runner (tested on 2.44.7).
- **Port 5678 already in use:** set `N8N_HOST_PORT` in `.env` (e.g. `5679`), update `N8N_WEBHOOK_URL` to match, then `docker compose up -d`.
- **Only reachable from this machine:** the port is bound to `127.0.0.1`. Your LAN and the internet can't reach it.
- **Run a workflow from the CLI** (e.g. to verify) while n8n is running:
  `docker compose exec -e N8N_RUNNERS_BROKER_PORT=5680 n8n n8n execute --id=<workflowId>`
  The port override avoids a clash with the running instance's task broker.
- **List workflows from the CLI:** `docker compose exec n8n n8n list:workflow`
- `N8N_LISTEN_ADDRESS=0.0.0.0` is set on purpose. n8n's default (`::`) crash-loops on hosts with IPv6 disabled, which includes some VPSes.
- On Windows, logs show a harmless `Permissions … too wide` warning only if the filesystem ignores chmod. n8n carries on.

## Later: domain + HTTPS on a VPS

Nothing in `docker-compose.yml` changes. Point a reverse proxy (e.g. Caddy) at `127.0.0.1:5678`, then set these in `.env`:

```
N8N_HOST=n8n.yourdomain.com
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/
N8N_PROXY_HOPS=1
```

Then run `docker compose up -d`. If the proxy runs in Docker on the same host, it needs to reach this container. That's a small network change, decided at that point.
