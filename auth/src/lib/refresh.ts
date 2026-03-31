import { randomBytes } from "node:crypto";
import type { Context } from "hono";
import { sign } from "hono/jwt";
import { prisma } from "./prisma.server";

export async function refresh(c: Context) {
	const body = await c.req.json();
	const { refreshToken } = body;

	if (!refreshToken || typeof refreshToken !== "string") {
		return c.json({ detail: "Refresh token is required" }, 400);
	}

	const stored = await prisma.refreshToken.findUnique({
		where: { token: refreshToken },
		include: { user: true },
	});

	if (!stored) {
		return c.json({ detail: "Invalid refresh token" }, 401);
	}

	if (stored.expiresAt < new Date()) {
		await prisma.refreshToken.delete({ where: { id: stored.id } });
		return c.json({ detail: "Refresh token expired" }, 401);
	}

	const now = Math.floor(Date.now() / 1000);

	const token = await sign(
		{
			sub: String(stored.user.id),
			role: stored.user.role,
			name: stored.user.name,
			iat: now,
			exp: now + 15 * 60, // 15 minutes
		},
		process.env.JWT_PRIVATE_KEY!,
		"RS256",
	);

	// rotate refresh token
	const newRefreshToken = randomBytes(40).toString("hex");
	const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	await prisma.refreshToken.update({
		where: { id: stored.id },
		data: { token: newRefreshToken, expiresAt: newExpiresAt },
	});

	return c.json({ token, refreshToken: newRefreshToken }, 200);
}
