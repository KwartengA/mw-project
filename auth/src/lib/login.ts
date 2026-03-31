import { randomBytes } from "node:crypto";
import type { Context } from "hono";
import { sign } from "hono/jwt";
import { treeifyError } from "zod";
import { LoginSchema } from "./dto";
import { match } from "./hash";
import { prisma } from "./prisma.server";

export async function login(c: Context) {
	const body = await c.req.json();

	const parsed = LoginSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ errors: treeifyError(parsed.error) }, 400);
	}

	const { email, password } = parsed.data;

	const user = await prisma.user.findUnique({
		where: { email },
		include: { authCredential: true },
	});

	if (!user?.authCredential) {
		return c.json({ detail: "Invalid email or password" }, 401);
	}

	const valid = await match(password, user.authCredential.password);
	if (!valid) {
		return c.json({ detail: "Invalid email or password" }, 401);
	}

	await prisma.user.update({
		where: { id: user.id },
		data: { lastLogin: new Date() },
	});

	const now = Math.floor(Date.now() / 1000);

	const token = await sign(
		{
			sub: String(user.id),
			role: user.role,
			name: user.name,
			iat: now,
			exp: now + 15 * 60, // 15 minutes
		},
		process.env.JWT_PRIVATE_KEY!,
		"RS256",
	);

	const refreshToken = randomBytes(40).toString("hex");
	const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt: refreshExpiresAt,
		},
	});

	return c.json({ token, refreshToken }, 200);
}
