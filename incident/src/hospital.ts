import type { Context } from "hono";
import { UpdateCapacitySchema } from "./lib/dto";
import { parse } from "./lib/http";
import { prisma } from "./lib/prisma.server";

async function updateCapacity(c: Context) {
	const id = c.req.param("id");
	if (!id) return c.json({ detail: "missing id" }, 400);

	const data = await parse(c, UpdateCapacitySchema);

	const hospital = await prisma.hospital.findUnique({
		where: { id: Number(id) },
	});
	if (!hospital) return c.json({ detail: "not found" }, 404);

	const updated = await prisma.hospital.update({
		where: { id: Number(id) },
		data,
	});
	return c.json(updated, 200);
}

export { updateCapacity };
