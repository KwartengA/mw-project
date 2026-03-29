import clsx from "clsx";
import { tryit } from "radashi";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
	type ActionFunctionArgs,
	Link,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
	useActionData,
	useNavigation,
	useSubmit,
} from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { authCookie } from "~/lib/cookies.server";
import { methodNotAllowed } from "~/lib/responses";
import type {
	ActionData,
	AuthFormValues,
	LoginPayload,
	RegisterPayload,
} from "~/lib/types";

type AuthActionPayload =
	| ({ activeTab: "login" } & LoginPayload)
	| ({ activeTab: "signup" } & RegisterPayload);

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const [_, user] = await tryit(checkAuth)(request);

	if (user) {
		throw redirect("/");
	}
};

export const action = async ({ request }: ActionFunctionArgs) => {
	if (request.method !== "POST") {
		throw methodNotAllowed();
	}

	const payload = (await request.json()) as AuthActionPayload;
	const isSignup = payload.activeTab === "signup";

	const BASE_URL = process.env.GATEWAY_BASE!;
	const url = isSignup ? `${BASE_URL}/auth/register` : `${BASE_URL}/auth/login`;

	const rest: LoginPayload | RegisterPayload =
		payload.activeTab === "signup"
			? {
					name: payload.name,
					email: payload.email,
					password: payload.password,
					affiliation: payload.affiliation,
					role: payload.role,
				}
			: {
					email: payload.email,
					password: payload.password,
				};

	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(rest),
	});

	const data = await response.json();

	if (!response.ok) {
		return Response.json(data, { status: response.status });
	}

	if (isSignup) {
		return Response.json(data, { status: response.status });
	}

	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize(data.token),
		},
	});
};

export const meta: MetaFunction = () => {
	return [{ title: "Login" }];
};

type AuthTab = "login" | "signup";

function getActionError(actionData?: ActionData) {
	if (!actionData) return null;
	if (actionData.detail) return actionData.detail;

	const props = actionData.errors?.properties;
	if (!props) return null;

	const firstFieldError = Object.values(props).find(
		(field) => field?.errors && field.errors.length > 0,
	)?.errors?.[0];

	return firstFieldError ?? "Something went wrong";
}

export default function Login() {
	const [activeTab, setActiveTab] = useState<AuthTab>("login");
	const [submittedTab, setSubmittedTab] = useState<AuthTab | undefined>(
		undefined,
	);
	const { handleSubmit, register } = useForm<AuthFormValues>();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData<ActionData>();
	const errorMessage = getActionError(actionData);

	React.useEffect(() => {
		if (navigation.state !== "idle" || !submittedTab) return;

		if (submittedTab === "signup" && actionData && !errorMessage) {
			setActiveTab("login");
		}

		setSubmittedTab(undefined);
	}, [navigation.state, submittedTab, actionData, errorMessage]);

	async function login(data: AuthFormValues) {
		setSubmittedTab(activeTab);

		const payload =
			activeTab === "signup"
				? { ...data, activeTab, role: "admin" }
				: { ...data, activeTab };

		submit(JSON.stringify(payload), {
			method: "POST",
			encType: "application/json",
		});
	}

	return (
		<div
			className={clsx(
				"min-h-screen w-full transition-colors duration-300",
				activeTab === "login" ? "bg-neutral-900" : "bg-stone-50",
			)}
		>
			<div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-10">
				<div className="w-full">
					<div className="mb-8 text-center">
						<h1
							className={clsx(
								"text-3xl font-semibold",
								activeTab === "login" ? "text-white" : "text-stone-900",
							)}
						>
							Welcome
						</h1>
						<p
							className={clsx(
								"mt-2 text-sm",
								activeTab === "login" ? "text-stone-400" : "text-stone-500",
							)}
						>
							Sign in or create an account to continue.
						</p>
					</div>

					<div
						className={clsx(
							"mx-auto mb-6 flex w-full max-w-md items-center gap-2 rounded-full border p-1",
							activeTab === "login"
								? "border-neutral-700 bg-neutral-800"
								: "border-stone-200 bg-stone-100",
						)}
					>
						<button
							type="button"
							onClick={() => setActiveTab("login")}
							className={clsx(
								"flex-1 rounded-full py-2 text-sm font-medium transition",
								activeTab === "login"
									? "bg-white text-stone-900"
									: "bg-transparent text-stone-500 hover:bg-white/70",
							)}
						>
							Login
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("signup")}
							className={clsx(
								"flex-1 rounded-full py-2 text-sm font-medium transition",
								activeTab === "signup"
									? "bg-stone-900 text-white"
									: activeTab === "login"
										? "bg-transparent text-neutral-300 hover:bg-white/10"
										: "bg-transparent text-stone-500 hover:bg-white/70",
							)}
						>
							Sign up
						</button>
					</div>

					<form
						onSubmit={handleSubmit(login)}
						className="mx-auto flex w-full max-w-md flex-col gap-4"
					>
						{activeTab === "signup" && (
							<>
								<input
									{...register("name")}
									type="text"
									placeholder="Full name"
									className="w-full rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:ring-2 focus:ring-stone-300"
								/>

								<select
									{...register("affiliation", { required: true })}
									defaultValue=""
									className="w-full rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:ring-2 focus:ring-stone-300"
								>
									<option value="" disabled>
										Select affiliation
									</option>
									<option value="police">Police</option>
									<option value="fire">Fire</option>
									<option value="hospital">Hospital</option>
									<option value="system">System</option>
								</select>
							</>
						)}

						<input
							{...register("email")}
							type="email"
							placeholder="Email"
							className={clsx(
								"w-full rounded-full border px-4 py-3 text-sm outline-none transition focus:ring-2",
								activeTab === "login"
									? "border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500 focus:ring-neutral-500"
									: "border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:ring-stone-300",
							)}
						/>

						<input
							{...register("password")}
							type="password"
							placeholder="Password"
							className={clsx(
								"w-full rounded-full border px-4 py-3 text-sm outline-none transition focus:ring-2",
								activeTab === "login"
									? "border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500 focus:ring-neutral-500"
									: "border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:ring-stone-300",
							)}
						/>

						{errorMessage && (
							<p className="text-sm text-red-500">{errorMessage}</p>
						)}

						<button
							type="submit"
							className={clsx(
								"mt-1 rounded-full px-4 py-3 text-sm font-semibold transition",
								activeTab === "login"
									? "bg-white text-stone-900 hover:bg-stone-200"
									: "bg-stone-900 text-white hover:bg-stone-700",
							)}
						>
							{activeTab === "login" ? "Login" : "Create account"}
						</button>

						<p
							className={clsx(
								"px-2 text-xs leading-relaxed",
								activeTab === "login" ? "text-neutral-400" : "text-stone-500",
							)}
						>
							By continuing, you agree to our{" "}
							<Link to="/login" className="underline">
								Terms
							</Link>{" "}
							and{" "}
							<Link to="/login" className="underline">
								Privacy Policy
							</Link>
							.
						</p>
					</form>
				</div>
			</div>
		</div>
	);
}
