# Incident Service

The incident service is the core of the mw platform. It manages the full lifecycle of emergency incidents — from initial report through dispatch, progression, and resolution — and acts as the event source that triggers the automatic dispatch pipeline.

**Port:** `4001`

---

## Overview

When an incident is created, the service persists it to the database, writes a domain event to a local outbox table, and returns immediately. A background publisher then picks up that event and delivers it to a Redis stream (`incident.events`), where the dispatch service is listening. This decoupled design means incident creation is fast and reliable regardless of whether the dispatch service is available at that exact moment.

---

## Incident Lifecycle

```
created → dispatched → in_progress → resolved
                    ↘ cancelled
```

Status transitions are explicit — each update is made via a dedicated endpoint. The service automatically records timestamps for key transitions:

- `dispatchedAt` — set when status moves to `dispatched`
- `resolvedAt` — set when status moves to `resolved`

Every update increments a `version` field, which supports optimistic concurrency control.

---

## Data Model

### Incident

| Field | Notes |
|---|---|
| `type` | JSON — incident classification with a `code` and optional `category` |
| `location` | JSON — human-readable `address`, a `center` coordinate (`[lat, lng]`), and a `radius` in meters |
| `priority` | JSON — `level` (`low`/`medium`/`high`), optional `score`, optional `escalationMins` |
| `metadata` | JSON — caller details (`callerName`, `callerContact`, optional `notes`) |
| `reporterId` | Set from the `x-user-id` header injected by the gateway |
| `operatorId` | Nullable — the assigned operator |
| `status` | Lifecycle status enum |
| `version` | Incremented on every mutation |

### Outbox

Used to guarantee event delivery without dual-write risk. Events are written to this table in the same database transaction as the domain change. A separate background process publishes them to Redis and marks them as published.

---

## Geospatial Queries

Incident locations are stored with a center point and radius. The service uses the **PostGIS** extension (`ST_DWithin`) to support radius-based proximity searches — returning all incidents within a given distance of a coordinate, along with the distance in kilometers.

> PostgreSQL must have the PostGIS extension installed and enabled.

---

## Event Publishing

The service publishes three event types to the Redis stream `incident.events`:

- `IncidentCreated` — triggers auto-dispatch in the dispatch service
- `IncidentStatusUpdated` — emitted on every status change
- `IncidentAssigned` — emitted when an operator is assigned or unassigned

Events are written to the `Outbox` table synchronously within the same transaction as the domain write, then delivered to Redis asynchronously by a poller that runs every **2 seconds**. Failed deliveries are retried with exponential backoff up to a 5-minute window.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (PostGIS extension required) |
| `REDIS_URL` | Yes | Redis connection string |
| `PORT` | No | Defaults to `4001` |

---

## Interactive API Docs

Swagger UI is available at `/api/incident/ui`. The raw OpenAPI spec is at `/api/incident/doc`.

---

## Development

```bash
pnpm install
pnpm dev
```
