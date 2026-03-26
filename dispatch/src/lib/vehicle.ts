import type { Context } from "hono";

export async function registerVehicle(c: Context) {}

export async function getVehicle(c: Context) {
	const id = c.req.param("id");
	if (!id) return c.json({ detail: "missing vehicle id" }, 400);

	// []:
}

export async function getVehicleLocation(c: Context) {
	const id = c.req.param("id");
	if (!id) return c.json({ detail: "missing vehicle id" }, 400);
}


export async function updateVehicleLocation(c: Context) {
  	const id = c.req.param("id");
	if (!id) return c.json({ detail: "missing vehicle id" }, 400);
}