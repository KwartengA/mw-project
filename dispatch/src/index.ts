import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { getActiveDispatches, markDispatchArrived } from "./lib/dispatch";
import { registerDriver, updateDriverLocation } from "./lib/driver";
import { updateCapacity } from "./lib/hospital";
import { startIncidentConsumer } from "./lib/incident-consumer";
import { startPublisher } from "./lib/publisher";
import { openApiDoc } from "./lib/swagger";
import { tracking } from "./lib/tracking";
import {
	getAllVehicles,
	getVehicle,
	getVehicleLocation,
	registerVehicle,
	updateVehicleLocation,
} from "./lib/vehicle";

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return Number(this);
};

const app = new Hono();

const dispatch = app.basePath("/api/dispatch");

app.use(logger());

dispatch.get("/dispatches/active", getActiveDispatches);

dispatch.get("/tracking/live", tracking); // SSE streaming endpoint for live vehicle updates

dispatch.get("/vehicles", getAllVehicles);

dispatch.get("/vehicles/:id", getVehicle);

dispatch.get("/vehicles/:id/location", getVehicleLocation);

dispatch.post("/vehicles/:id/location", updateVehicleLocation);

dispatch.post("/vehicles/register", registerVehicle);

dispatch.post("/drivers/register", registerDriver);

dispatch.post("/drivers/:id/location", updateDriverLocation);

dispatch.post("/dispatches/:id/arrive", markDispatchArrived);

dispatch.put("/hospital/:id/capacity", updateCapacity);

dispatch.get("/doc", (c) => c.json(openApiDoc));

dispatch.get("/ui", swaggerUI({ url: "/api/dispatch/doc" }));

serve(
	{
		fetch: dispatch.fetch,
		port: Number(process.env.PORT) || 4002,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
		startPublisher();
		startIncidentConsumer().catch((error) => {
			console.error("Failed to start incident consumer:", error);
		});
	},
);
