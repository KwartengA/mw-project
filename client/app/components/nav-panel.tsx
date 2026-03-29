import { useAtom } from "jotai";
import { activePanelAtom, type NavPanel } from "~/lib/store";
import { IncidentsPanel } from "./incidents-panel";
import { OperationsPanel } from "./operations-panel";
import { ResourcesPanel } from "./resources-panel";

export function NavQPanel({ panel }: { panel: NavPanel }) {
	const [, setActivePanel] = useAtom(activePanelAtom);

	if (panel === "dashboard" || panel === "analytics") {
		return (
			<OperationsPanel
				initialTab={panel}
				onClose={() => setActivePanel(null)}
			/>
		);
	}

	return (
		<div className="h-full w-120 rounded-2xl bg-white dark:bg-neutral-900 shadow-lg overflow-hidden flex flex-col font-mono">
			<header className="px-4 py-3 border-b border-zinc-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
				<span className="font-semibold text-sm capitalize">{panel}</span>

				<button
					type="button"
					onClick={() => setActivePanel(null)}
					className="text-sm md:text-lg rounded-full bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 p-1 text-zinc-500"
				>
					<div className="i-lucide-x" />
				</button>
			</header>

			<div className="flex-1 overflow-y-auto p-4">
				{panel === "incidents" && <IncidentsPanel />}
				{panel === "resources" && <ResourcesPanel />}
			</div>
		</div>
	);
}
