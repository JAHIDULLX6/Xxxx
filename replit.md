# X69X BOT V3

A Facebook Messenger bot (based on GoatBot V2 by NTKhang, updated by Azadx69x) with a web dashboard.

## Architecture

- **Entry point**: `index.js` — spawns `azadx69x.js` with exponential-backoff crash recovery (unlimited restarts, resets after 10 min stable)
- **Main bot**: `azadx69x.js` — initializes config, database, loads commands, starts Facebook login
- **Dashboard**: `dashboard/app.js` — Express web server serving the bot management UI on port 5000
- **Bot logic**: `bot/` — login handling, handlers, socket.io
- **Commands**: `scripts/` — bot command scripts
- **Database**: MongoDB (configured in `config.json`) or SQLite fallback
- **FCA**: `fca-azadx69x/` — custom local Facebook Chat API package

## Configuration

- `config.json` — main config (Facebook account, dashboard settings, bot options)
- `configCommands.json` — command-specific config
- `account.txt` — Facebook session state (fbstate/cookies). A placeholder cookie is set so the bot attempts login, fails gracefully, and opens the dashboard on port 5000.

## Key Settings

- Dashboard port: reads `process.env.PORT` first, falls back to `config.dashBoard.port` (5000)
- Dashboard binds to `0.0.0.0` — works on Replit, Render, Railway, VPS, Koyeb, Glitch
- Health check endpoints: `/health`, `/ping`, `/alive` — for uptime monitors
- Database: MongoDB — URI from `config.json` (mongodb+srv://...)
- Language: English (`en`)
- Prefix: `)`

## Replit Setup

- Workflow: `Start application` — runs `npm start`, waits on port 5000 (webview)
- `account.txt` contains a placeholder cookie array so the bot falls through to dashboard mode
- System libraries installed: `libuuid`, `cairo`, `pango`, `libjpeg`, `giflib`, `librsvg`, `pixman`, `pkg-config` (required for `canvas` npm package)
- Deployment: **VM** (always-running), run command: `node index.js`

## Platform Auto-detection

Dashboard URL is auto-detected:
| Platform | Auto-detected env var |
|---|---|
| Render | `RENDER_EXTERNAL_URL` |
| Railway | `RAILWAY_PUBLIC_DOMAIN` |
| Glitch | `PROJECT_DOMAIN` |
| Replit | `REPL_OWNER` / `REPL_SLUG` |
| VPS / custom | Set `BASE_URL` env var |

## Running

```bash
npm start        # production
npm run dev      # development mode
```

## Dependencies

- Node.js 20.x (Replit environment)
- System libraries: `libuuid`, `cairo`, `pango`, `libjpeg`, `giflib`, `librsvg`, `pixman`, `pkg-config` (required for `canvas` package)
- npm packages: see `package.json`
