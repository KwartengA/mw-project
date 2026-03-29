import { Link, useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
import ThemeSelector from "./theme-selector";

function ProfileMenu() {
	const { user } = useRouteLoaderData<typeof rootLoader>("root") || {};

	return (
		<div className="bg-white dark:bg-neutral-900 rounded-2xl w-[16rem] overflow-hidden shadow-lg mt-1.5 font-mono">
			<header className="px-5 py-3">
				<div className="flex justify-between items-center mb-3">
					<div className="inline-block h-full rounded-full px-2 py-1 uppercase bg-zinc-900 dark:(bg-white text-black) text-white text-xs font-bold">
						{user?.role}
					</div>

					<ThemeSelector />
				</div>

				<div className="capitalize">{user?.name}</div>
				<div className="text-secondary text-sm inline-flex items-center gap-1.5">
					<span>{user?.email}</span>
					<div className="i-solar-verified-check-bold size-4 text-emerald-600" />
				</div>
			</header>

			<hr className="dark:border-neutral-800" />
			<div>
				<Link
					to="/logout"
					className="w-full flex gap-2 items-center px-4 py-3 hover:bg-zinc-100  text-red-500 dark:hover:bg-neutral-800"
				>
					<div className="i-solar-logout-2-linear" />
					Logout
				</Link>
			</div>
		</div>
	);
}

export { ProfileMenu };
