# Smart Luck Controller — Smart Lock Honeypot Simulation

A vulnerable-by-design IoT smart lock platform built to sit safely alongside a [T-Pot](https://github.com/telekom-security/tpotce) honeypot deployment. It looks and behaves like a real enterprise smart-home product, but every "vulnerability" is simulated — no real shell execution, no real file access, no real RCE.

> **Safety first.** All dangerous behavior is logged and echoed back as if it executed. Nothing escapes the container.

---

## Architecture

```
+---------------------+      +---------------------------+
|   frontend-app      | ---> |   smart-lock-service       |
|   Next.js 14 / TS   |      |   ASP.NET Core .NET 8      |
|   :3000             |      |   :8080                    |
+---------------------+      +---------------------------+
        ^                              |
        |                              v
   Browser                       In-memory store
                                 (Users, Devices, Logs)
```

Two containers, one bridge network (`smartlock-net`).

---

## Tech Stack

| Layer       | Technology                                            |
|-------------|--------------------------------------------------------|
| Frontend    | Next.js 14 · React 18 · TypeScript · TailwindCSS · Axios |
| Backend     | ASP.NET Core 8 Minimal API · JWT · Swashbuckle         |
| Container   | Docker · Docker Compose                                |
| Future      | PostgreSQL-ready data layer                            |

---

## Running locally

```bash
docker compose build
docker compose up -d
```

Then open:

- **Dashboard** → http://localhost:3000
- **API**       → http://localhost:8080
- **Swagger**   → http://localhost:8080/swagger
- **Health**    → http://localhost:8080/health

### Seeded honeypot accounts

| Username    | Password   | Role          |
|-------------|------------|---------------|
| `admin`     | `admin123` | Administrator |
| `technician`| `tech123`  | Technician    |
| `guest`     | `guest`    | Guest         |

These weak credentials are intentional — the goal is to attract attackers.

---

## Required API Endpoints

| Method | Path                     | Purpose                                 |
|--------|--------------------------|-----------------------------------------|
| POST   | `/api/auth/login`        | Login (verbose errors, user enumeration)|
| GET    | `/api/device/status`     | Doors, gate, lights, online state, battery |
| POST   | `/api/device/lock`       | Lock a device                           |
| POST   | `/api/device/unlock`     | Unlock a device                         |
| GET    | `/api/device/settings`   | Read device + system settings           |
| POST   | `/api/device/settings`   | Update settings (no validation)         |
| GET    | `/api/admin/logs`        | Access logs (exposed admin route)       |
| POST   | `/api/firmware/update`   | Fake firmware update                    |
| GET    | `/api/export/config`     | Dump full config — including secrets    |
| GET    | `/api/debug/system`      | Debug page — versions, env, fake shell  |

Plus auxiliary endpoints (`/health`, `/api/device/list`, `/api/auth/me`, etc.).

---

## Vulnerability Simulation (safe)

| Class                   | Behavior                                                  |
|-------------------------|-----------------------------------------------------------|
| Weak login              | `admin/admin123`, `technician/tech123`                    |
| User enumeration        | "User not found" vs "Wrong password"                      |
| Verbose errors          | Stack-trace-like fields returned to clients               |
| No rate limiting        | Unlimited login attempts                                   |
| Exposed admin routes    | `/api/admin/logs` reachable without proper RBAC           |
| Debug endpoints         | `/api/debug/system` echoes env-like data                  |
| Fake firmware update    | Accepts any URL, "applies" without signature checks       |
| Config export           | `/api/export/config` returns secrets in plaintext         |
| Hidden routes           | `/api/.git/HEAD`, `/api/backup.zip`, `/api/wp-admin`      |
| Command-injection demo  | Echoes the payload — never runs it                        |
| Predictable session IDs | Sequential counters in fake session listing               |

Everything is **simulated**. The container never runs an attacker payload; it just records the attempt and replies with what a vulnerable lock might say.

---

## Project Layout

```
Smart_Lock_Simulation/
├── docker-compose.yml
├── README.md
├── .env.example
├── frontend-app/                    # Next.js 14 (App Router)
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── app/                     # routes (login, dashboard, settings, ...)
│       ├── components/              # Sidebar, Header, DoorCard, etc.
│       ├── lib/                     # api client, auth helper
│       └── types/                   # shared TS types
└── smart-lock-service/              # ASP.NET Core Minimal API (.NET 8)
    ├── Dockerfile
    ├── SmartLockService.csproj
    ├── Program.cs
    ├── appsettings.json
    ├── Models/
    ├── Services/
    └── Endpoints/
```

---

## T-Pot integration tips

1. Run this stack on the **same Docker host** as T-Pot, but on a separate bridge network (this compose file already creates `smartlock-net`).
2. Forward suspicious traffic to T-Pot's sensors via your firewall — the smart lock stack itself only listens on `:3000` and `:8080`.
3. Ship logs from the backend (stdout) into T-Pot's ELK stack with Filebeat or Logstash if you want correlation.
4. Keep the honeypot containerized and never on the host network.

---

## Disclaimer

This software is for **research, education, and defensive deception** only. Do not deploy against systems you do not own or have explicit permission to test. The authors take no responsibility for misuse.
