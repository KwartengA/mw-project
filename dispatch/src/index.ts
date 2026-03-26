import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { getActiveDispatches, markDispatchArrived } from "./lib/dispatch";
import { registerDriver } from "./lib/driver";
import { updateCapacity } from "./lib/hospital";
import { tracking } from "./lib/tracking";
import {
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

dispatch.get("/tracking/live", tracking); // websocket endpoint for real-time streamings

dispatch.get("/vehicles/:id", getVehicle);

dispatch.get("/vehicles/:id/location ", getVehicleLocation);

dispatch.post("/vehicles/:id/location ", updateVehicleLocation);

dispatch.post("/vehicle/register ", registerVehicle);

dispatch.post("/drivers/register ", registerDriver);

dispatch.post("/dispatches/:id/arrive", markDispatchArrived);

app.put("/hospital/:id/capacity", updateCapacity);

serve(
	{
		fetch: dispatch.fetch,
		port: Number(process.env.PORT) || 4002,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
