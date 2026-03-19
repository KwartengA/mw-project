import dotenv from "dotenv";

dotenv.config();

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { authenticate } from "./lib/authenticate.js";
import { login } from "./lib/login.js";
import { getProfile, updateProfile } from "./lib/profile.js";
import { register } from "./lib/register.js";

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return Number(this);
};

const app = new Hono();

const auth = app.basePath("/auth");

auth.use("*", logger());

auth.post("/register", register);

auth.post("/login", login);

auth.use("*", authenticate);

auth.get("/profile", getProfile);

auth.put("profile", updateProfile);

// []: TODO: extend to use refresh token and sessions (and logout)

serve(
	{
		fetch: auth.fetch,
		port: Number(process.env.PORT) || 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
