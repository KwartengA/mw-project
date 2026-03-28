import Redis from "ioredis";
import { DispatchStatus, VehicleStatus } from "../generated/prisma/enums";
import { GROUP, STREAM } from "./consts";
import { publishOutboxEvent } from "./outbox";
import { prisma } from "./prisma.server";

type IncidentEventPayload = {
	incident?: {
		id?: string;
		location?: {
			center?: [number, number] | number[];
		};
	};
	id?: string;
	location?: {
		center?: [number, number] | number[];
	};
};

const redis = new Redis(process.env.REDIS_URL!);
const CONSUMER = `dispatch-${process.pid}`;

type StreamEntry = [entryId: string, fieldValues: string[]];
type StreamBatch = [streamName: string, entries: StreamEntry[]];

function toMap(fields: string[]) {
	const out: Record<string, string> = {};
	for (let i = 0; i < fields.length; i += 2) {
		out[fields[i]] = fields[i + 1] ?? "";
	}
	return out;
}

function toRadians(value: number) {
	return (value * Math.PI) / 180;
}

function haversineDistanceKm(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number,
) {
	const dLat = toRadians(lat2 - lat1);
	const dLng = toRadians(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLng / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return 6371 * c;
}

function extractIncident(payload: IncidentEventPayload) {
	const incident = payload.incident ?? payload;
	const id = incident.id;
	if (!id) return null;

	const center = incident.location?.center;
	if (
		Array.isArray(center) &&
		center.length >= 2 &&
		typeof center[0] === "number" &&
		typeof center[1] === "number" &&
		Number.isFinite(center[0]) &&
		Number.isFinite(center[1])
	) {
		return { id, lat: center[0], lng: center[1] };
	}

	return null;
}

async function processIncidentCreated(rawPayload: string) {
	let payload: IncidentEventPayload;
	try {
		payload = JSON.parse(rawPayload) as IncidentEventPayload;
	} catch {
		return;
	}

	const incident = extractIncident(payload);
	if (!incident) return;

	const existingDispatch = await prisma.dispatch.findFirst({
		where: {
			incidentId: incident.id,
			status: { in: [DispatchStatus.active, DispatchStatus.arrived] },
		},
		select: { id: true },
	});
	if (existingDispatch) return;

	const candidates = await prisma.vehicle.findMany({
		where: { status: VehicleStatus.available },
		include: {
			locations: {
				orderBy: { recordedAt: "desc" },
				take: 1,
			},
		},
	});

	const nearest = candidates
		.map((vehicle) => {
			const latest = vehicle.locations[0];
			if (!latest) return null;
			return {
				vehicle,
				distanceKm: haversineDistanceKm(
					incident.lat,
					incident.lng,
					latest.lat,
					latest.lng,
				),
			};
		})
		.filter(
			(
				entry,
			): entry is {
				vehicle: (typeof candidates)[number];
				distanceKm: number;
			} => entry !== null,
		)
		.sort((a, b) => a.distanceKm - b.distanceKm)[0];

	if (!nearest) return;

	await prisma.$transaction(async (tx) => {
		const dispatch = await tx.dispatch.create({
			data: {
				incidentId: incident.id,
				vehicleId: nearest.vehicle.id,
				status: DispatchStatus.active,
			},
		});

		await tx.vehicle.update({
			where: { id: nearest.vehicle.id },
			data: { status: VehicleStatus.dispatched },
		});

		await publishOutboxEvent(tx, {
			aggregateType: "dispatch",
			aggregateId: String(dispatch.id),
			eventType: "VehicleDispatched",
			payload: {
				dispatchId: dispatch.id,
				incidentId: dispatch.incidentId,
				vehicleId: dispatch.vehicleId,
				distanceKm: nearest.distanceKm,
				dispatchedAt: dispatch.dispatchedAt,
			},
		});
	});
}

async function ensureGroup() {
	try {
		await redis.xgroup("CREATE", STREAM, GROUP, "$", "MKSTREAM");
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"message" in error &&
			typeof error.message === "string" &&
			error.message.includes("BUSYGROUP")
		) {
			return;
		}
		throw error;
	}
}

let running = false;

async function loop() {
	while (running) {
		try {
			const records = (await redis.xreadgroup(
				"GROUP",
				GROUP,
				CONSUMER,
				"COUNT",
				"20",
				"BLOCK",
				"2000",
				"STREAMS",
				STREAM,
				">",
			)) as StreamBatch[] | null;

			if (!records?.length) continue;

			for (const [, entries] of records) {
				for (const [entryId, fieldValues] of entries) {
					const map = toMap(fieldValues);
					try {
						if (map.eventType === "IncidentCreated" && map.payload) {
							await processIncidentCreated(map.payload);
						}
						await redis.xack(STREAM, GROUP, entryId);
					} catch (error) {
						console.error("Failed handling stream event:", error);
					}
				}
			}
		} catch (error) {
			console.error("Dispatch consumer loop error:", error);
		}
	}
}

export async function startIncidentConsumer() {
	if (running) return;
	await ensureGroup();
	running = true;
	void loop();
	console.log(
		`Incident stream consumer running: stream=${STREAM}, group=${GROUP}`,
	);
}

export async function stopIncidentConsumer() {
	running = false;
	await redis.quit();
}
