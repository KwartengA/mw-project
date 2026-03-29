import { useAtom } from "jotai";
import { activePanelAtom, type NavPanel } from "~/lib/store";
import { cn } from "~/lib/utils";
import { NavQPanel as NavPanelShell } from "./nav-panel";

const items = [
	{
		id: "incidents",
		icon: "i-solar-danger-triangle-linear",
		label: "Incidents",
	},
	{
		id: "resources",
		icon: "i-solar-box-linear",
		label: "Resources",
	},
	{ id: "dashboard", icon: "i-solar-code-scan-bold", label: "Dashboard" },
	{ id: "analytics", icon: "i-solar-chart-2-bold-duotone", label: "Analytics" },
] as const;

export default function Navigation() {
	const [activePanel, setActivePanel] = useAtom(activePanelAtom);

	const fullScreenPanelOpen =
		activePanel === "dashboard" || activePanel === "analytics";

	return (
		<>
			<div className="flex gap-2 items-start h-[calc(100vh-1.5rem)]">
				<nav className="flex flex-col gap-1 rounded-xl bg-white dark:bg-neutral-900 shadow-lg p-1">
					{items.map(({ id, icon, label }) => {
						const active = activePanel === id;
						return (
							<button
								key={id}
								type="button"
								title={label}
								onClick={() => {
									setActivePanel(activePanel === id ? null : (id as NavPanel));
								}}
								className={cn(
									"flex items-center justify-center rounded-lg p-2 transition-colors",
									active
										? "bg-zinc-200 dark:bg-neutral-700/40 text-black dark:text-white"
										: "text-zinc-600 dark:text-white bg-zinc-50 dark:bg-neutral-900 hover:bg-zinc-100 dark:hover:bg-neutral-800",
								)}
							>
								<div className={cn(icon, "size-6")} />
							</button>
						);
					})}
				</nav>

				{activePanel && !fullScreenPanelOpen && (
					<NavPanelShell panel={activePanel} />
				)}
			</div>

			{fullScreenPanelOpen && activePanel && (
				<NavPanelShell panel={activePanel} />
			)}
		</>
	);
}
