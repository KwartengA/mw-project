import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { getActiveDispatches, markDispatchArrived } from "./lib/dispatch";
import { registerDriver, updateDriverLocation } from "./lib/driver";
import { updateCapacity } from "./lib/hospital";
import { startIncidentConsumer } from "./lib/incident-consumer";
import { startPublisher } from "./lib/publisher";
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

app.use(logger());

const dispatch = app.basePath("/dispatch");

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

app.put("/hospital/:id/capacity", updateCapacity);

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
