import type { AppTheme } from "~/lib/store";
import { useColorScheme } from "~/lib/use-color-scheme";
import { cn } from "~/lib/utils";

function ThemeSelector() {
	const { setPreference, preference } = useColorScheme();

	function switchTheme(theme: AppTheme) {
		setPreference(theme);
	}

	return (
		<div className="flex gap-1 rounded-full border border-neutral-200 dark:border-neutral-700 p-1 bg-white dark:bg-neutral-800">
			<button
				type="button"
				onClick={() => switchTheme("system")}
				className={cn("rounded-full p-1", {
					"bg-neutral-800 dark:bg-neutral-100 text-white dark:text-black":
						preference === "system",
				})}
			>
				<div className="i-lucide-monitor-cog size-4" />
			</button>
			<button
				type="button"
				onClick={() => switchTheme("light")}
				className={cn("rounded-full p-1", {
					"bg-neutral-800 dark:bg-neutral-100 text-white dark:text-black":
						preference === "light",
				})}
			>
				<div className="i-lucide-sun size-4" />
			</button>
			<button
				type="button"
				onClick={() => switchTheme("dark")}
				className={cn("rounded-full p-1", {
					"bg-neutral-800 dark:bg-neutral-100 text-white dark:text-black":
						preference === "dark",
				})}
			>
				<div className="i-lucide-moon size-4" />
			</button>
		</div>
	);
}

export default ThemeSelector;
