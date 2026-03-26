import "@unocss/reset/tailwind-compat.css";
import "react-spring-bottom-sheet/dist/style.css";
import "virtual:uno.css";
import "./styles.css";

import { tryit } from "radashi";
import {
	data,
	Links,
	type LoaderFunctionArgs,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import { PendingUI } from "./components/pending-ui";
import { checkAuth } from "./lib/check-auth";
import { useColorScheme } from "./lib/use-color-scheme";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const [_, user] = await tryit(checkAuth)(request);

	return data({ user });
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<script src="/load-theme.js" type="text/javascript" />
				<Meta />
				<Links />
			</head>
			<body>
				<PendingUI />
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	useColorScheme();

	return <Outlet />;
}
