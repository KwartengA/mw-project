import type { Context } from "hono";

export async function getActiveDispatches(c: Context) {}

export async function markDispatchArrived(c: Context) {
	const id = c.req.param("id");
	if (!id) return c.json({ detail: "missing dispatched vehicle id" }, 400);
}
