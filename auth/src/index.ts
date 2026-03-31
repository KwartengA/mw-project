import dotenv from "dotenv";

dotenv.config();

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { authenticate } from "./lib/authenticate";
import { login } from "./lib/login";
import { getProfile, updateProfile } from "./lib/profile";
import { refresh } from "./lib/refresh";
import { register } from "./lib/register";
import { openApiDoc } from "./lib/swagger";

declare global {
	interface BigInt {
		toJSON(): number;
	}
}
const app = new Hono();

const auth = app.basePath("/api/auth");

auth.use("*", logger());

auth.post("/register", register);

auth.post("/login", login);

auth.post("/refresh", refresh);

auth.get("/doc", (c) => c.json(openApiDoc));

auth.get("/ui", swaggerUI({ url: "/api/auth/doc" }));

auth.use("*", authenticate);

auth.get("/profile", getProfile);

auth.put("/profile", updateProfile);

serve(
	{
		fetch: auth.fetch,
		port: Number(process.env.PORT) || 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
