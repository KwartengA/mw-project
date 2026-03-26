export type AuthFormValues = {
	name?: string;
	email: string;
	affiliation?: "police" | "fire" | "hospital" | "system";
	role?: "super" | "admin";
	password: string;
};

export type ActionData = {
	detail?: string;
	errors?: {
		properties?: Record<string, { errors?: string[] }>;
	};
};

export type JwtUser = {
	sub: string;
	email: string;
	name: string;
	role: string;
};

export type AddItem = "incident" | "resource";
