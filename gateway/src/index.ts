import dotenv from "dotenv";

dotenv.config();

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { authenticate } from "./lib/authenticate.js";
import { SERVICE_ROUTES } from "./lib/ingress.js";
import { log } from "./lib/log.js";

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return Number(this);
};

const app = new Hono();

app.use("*", logger());

app.all("/auth/*", (c) => log(c, process.env.AUTH_SERVICE_URL!));

app.use("/api/*", authenticate);

app.all("/api/*", async (c) => {
	const path = new URL(c.req.url).pathname;

	const route = SERVICE_ROUTES.find((r) => path.startsWith(r.prefix));
	if (!route) {
		return c.json({ detail: "Cannot resolve API route" }, 502);
	}

	return log(c, route.baseUrl, route.stripPrefix ? route.prefix : undefined);
});

serve(
	{
		fetch: app.fetch,
		port: Number(process.env.PORT) || 4000,
	},
	(info) => {
		console.log(`Gateway is running on http://localhost:${info.port}`);
	},
);
