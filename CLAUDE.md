# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint, Test

```bash
npm run build          # Clean dist/ then compile with tsc → dist/
npm run lint           # ESLint on src/ (single quotes, no semicolons, always-multiline comma-dangle)
npm run lint:fix       # ESLint with auto-fix
npm test               # test:unit + test:e2e
npm run test:unit      # Jest unit tests only
npm run test:e2e       # Jest e2e tests only

npx jest test/unit/space.util.spec.ts        # Run one test file
npm run test:unit -- -t "SpaceUtil"          # Run tests matching a name

npm run start -- --id <SPACE_ID>   # Run the built CLI (build first)
npm run start:config               # Run with ./config.json
```

Jest uses ts-jest (`jest.config.js`), tests match `test/**/*.spec.ts`, 10s timeout. E2E tests replay captured fixtures from `test/data/e2e/` (no network); regenerate them with `npm run build-e2e-dataset`, which calls the live API.

TypeScript config: target ES2020, CommonJS modules, output to `dist/`, source maps enabled, strict mode off. Requires Node ≥24 and npm ≥11 (per `engines`), plus ffmpeg on PATH for downloads.

## Architecture Overview

This is a CLI app and library to monitor and download Twitter Spaces. Entry point: `src/index.ts` — a Commander.js program that handles CLI arg parsing and dispatches to one of three modes:

### Operation Modes

1. **Playlist URL mode** (`--url`): Directly downloads a Space from a known playlist URL via `SpaceDownloader`
2. **Space ID mode** (`--id` / `--space-url`): Creates a `SpaceWatcher` for a specific Space, monitors it through its lifecycle (scheduled → live → ended), then downloads
3. **User monitoring mode** (`--user` / `--config`): Continuously monitors users for live Spaces. Two strategies:
   - **With Twitter auth** (`TWITTER_AUTHORIZATION` or `TWITTER_AUTH_TOKEN`): Uses `UserListWatcher` which batches users into API calls (`getSpacesByCreatorIds` or `getSpacesByFleetsAvatarContent`) — efficient multi-user polling
   - **Without auth**: Creates individual `UserWatcher` instances per user, polling recent tweets for Space cards via GraphQL

Additional CLI pieces: `--force` bypasses the ended-space check for `--id`; the `cc` subcommand (`cc download <id>` / `cc extract <file>`) downloads or extracts captions manually; `test` is a hidden debug subcommand.

### Core Manager Hierarchy

`MainManager` (singleton) is the central orchestrator:
- `addSpaceWatcher(id)` → creates a `SpaceWatcher` that watches one Space, emits `complete` when done
- `addUserWatcher(username)` → creates a `UserWatcher` that polls one user's tweets, emits `data` with Space IDs
- `runUserListWatcher()` → creates a `UserListWatcher` that polls all known users for live Spaces, emits `data` with Space IDs

### SpaceWatcher Lifecycle (the heart of the app)

`src/modules/space-watcher.ts`:
1. Fetches Space metadata via two GraphQL endpoints (`AudioSpaceById` and `AudioSpaceByRestId`) — takes the first with metadata
2. Gets live video stream status to obtain the playlist URL and chat token
3. Gets chat access credentials via Periscope API
4. If Space is `LIVE`: polls the dynamic playlist for new chunks; shows notification; sends webhooks
5. If Space transitions to `ENDED`: verifies master playlist chunk count matches last seen dynamic chunk index, then downloads
6. Downloads audio via `SpaceDownloader` (ffmpeg) and captions via `SpaceCaptionsDownloader`/`SpaceCaptionsExtractor`

### API Layers

- **`src/apis/twitter-api.ts`**: Static methods for Twitter REST API v1.1/v2 endpoints (guest token, user lookup, spaces by creator, fleet avatar content, AudioSpaceById GraphQL, live video stream status)
- **`src/api/twitter.api.ts`**: Newer `TwitterApi` class (singleton `api`) wrapping sub-APIs — `graphql`, `fleet`, `guest`, `liveVideoStream` — with `x-client-transaction-id` transaction support via `src/api/twitter-transaction.ts`. Used by `UserManager` and `SpaceWatcher` for GraphQL queries
- **`src/apis/periscope-api.ts`**: Static methods for Periscope (Twitter's streaming backend) — playlist resolution, chat access, chat history

### Download Pipeline

`SpaceDownloader` downloads media from m3u8 playlists:
- Audio: downloads individual chunk files, strips ID3 ignore-buffer bytes, concatenates via ffmpeg
- Video: passes the playlist URL directly to ffmpeg
- Supports custom ffmpeg args per media type via config (`config.ffmpeg.audio.args`, `config.ffmpeg.video.args`)

### Rate Limiting

`src/limiter.ts` defines Bottleneck instances:
- `twitterGuestTokenLimiter`: 1 concurrent (guest token fetch)
- `twitterApiLimiter`: 2 concurrent (general API calls)
- `twitterSpaceApiLimiter`: 1 concurrent, 1100ms min interval (Space polling)
- `discordWebhookLimiter`: 5 per 2 seconds (Discord rate limit)

### Configuration

`ConfigManager` (singleton) loads config from a YAML or JSON file specified via `--config`; **no default config file is read** when the flag is absent (`config.yaml` in the repo root is local state, not auto-loaded). CLI flags beat config values, and env vars `SKIP_DOWNLOAD`, `SKIP_DOWNLOAD_AUDIO`, `SKIP_DOWNLOAD_CAPTION` beat both. `.env` is loaded from `--env` (or the CWD by default): `TWITTER_AUTH_TOKEN`, `TWITTER_CSRF_TOKEN`, `LOG_LEVEL`. Manages guest token caching with TTL (`TWITTER_GUEST_TOKEN_DURATION`).

### Logging

`src/logger.ts` sets up Winston with console output and daily-rotating file transports. Two specialized loggers:
- `spaceLogger` → `logs/spaces.jsonl` (structured Space metadata)
- `spaceRawLogger` → `logs/spaces.raw.jsonl` (raw API responses)

### Key Constants

`src/constants/app.constant.ts`:

- `APP_CACHE_DIR` = `./.cache`
- `APP_DOWNLOAD_DIR` = `./download`
- `APP_VERSION_CHECK_INTERVAL` = 1h
- `APP_USER_REFRESH_INTERVAL` = 30s (default user polling)
- `APP_SPACE_ERROR_RETRY_INTERVAL` = 10s
- `APP_PLAYLIST_REFRESH_INTERVAL` = 10s
- `APP_PLAYLIST_CHUNK_VERIFY_MAX_RETRY` = 20
- `APP_PLAYLIST_MASTER_RETRY_MAX` = 20

`src/constants/twitter.constant.ts`:

- `TWITTER_GUEST_TOKEN_RETRY_MS` = 5s
- `TWITTER_GUEST_TOKEN_DURATION` = 30min
- `TWITTER_API_LIST_SIZE` = 100
- `TWITTER_USER_FETCH_INTERVAL` = 60s

`src/constants/logger.constant.ts`: `LOGGER_DIR` = `./logs`, daily rotation date pattern `YYMMDD`.

## Project Conventions

- Single quotes, no semicolons, always-multiline trailing commas (ESLint enforced)
- `@typescript-eslint/no-explicit-any` is off — explicit `any` usage is permitted
- Singletons exported as module-level const instances (e.g., `mainManager`, `userManager`, `configManager`, `api`)
- Winston child loggers with `{ label: '[ClassName@id]' }` convention throughout
- `src/interfaces/` holds TypeScript interfaces; `src/enums/` holds enums; `src/model/` holds Twitter entity model classes
