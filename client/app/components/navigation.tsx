import { useAtom } from "jotai";
import React from "react";
import { activePanelAtom, type NavPanel } from "~/lib/store";
import type { AddItem } from "~/lib/types";
import { cn } from "~/lib/utils";
import { AddIncidentModal } from "./add-incident-modal";
import { AddPanel } from "./add-panel";
import { AddResourceModal } from "./add-resource-modal";
import { NavQPanel as NavPanelShell } from "./nav-panel";

const items = [
	{ id: "add", icon: "i-lucide-plus", label: "Add" },
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
	{ id: "analytics", icon: "i-solar-cloud-file-outline", label: "Analytics" },
] as const;

export default function Navigation() {
	const [activePanel, setActivePanel] = useAtom(activePanelAtom);
	const [addPanelOpen, setAddPanelOpen] = React.useState(false);
	const [addModal, setAddModal] = React.useState<AddItem | null>(null);

	return (
		<>
			<div className="flex gap-2 items-start h-[calc(100vh-1.5rem)]">
				<nav className="flex flex-col gap-1 rounded-xl bg-white dark:bg-neutral-900 shadow-lg p-1">
					{items.map(({ id, icon, label }) => {
						const active = id === "add" ? addPanelOpen : activePanel === id;
						return (
							<button
								key={id}
								type="button"
								title={label}
								onClick={() => {
									if (id === "add") {
										setAddPanelOpen((v) => !v);
										setActivePanel(null);
										return;
									}
									setAddPanelOpen(false);
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

				{addPanelOpen && <AddPanel onSelect={(item) => setAddModal(item)} />}

				{activePanel && <NavPanelShell panel={activePanel} />}
			</div>

			<AddIncidentModal
				open={addModal === "incident"}
				onClose={() => setAddModal(null)}
			/>
			<AddResourceModal
				open={addModal === "resource"}
				onClose={() => setAddModal(null)}
			/>
		</>
	);
}
