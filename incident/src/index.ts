import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";
import {
	assign,
	create,
	get,
	listIncidents,
	open,
	updateStatus,
} from "./lib/incident";
import { startPublisher } from "./lib/publisher";
import { listResponders, nearby } from "./lib/responders";
import { openApiDoc } from "./lib/swagger";

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return Number(this);
};

const app = new Hono();

app.use(logger());

const incident = app.basePath("/incident");

// Incident service is an internal app shielded behind the API gateway proxy.
// Like other internal services, it does not authenticate request since all of
// that is done by the proxy.

// We assume that a request received is authenticated and has the attached user claims
// in the request headers

incident.post("/", create);

incident.get("/", listIncidents);

incident.get("/open", open);

incident.get("/nearby", nearby);

incident.get("/:id", get);

incident.put("/:id/status", updateStatus);

incident.put("/:id/assign", assign);

incident.get("/doc", (c) => c.json(openApiDoc));

incident.get("/ui", swaggerUI({ url: "/incident/doc" }));

app.get("/responders", listResponders);

serve(
	{
		fetch: incident.fetch,
		port: Number(process.env.PORT) || 4001,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
		startPublisher();
	},
);
