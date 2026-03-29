import { useSetAtom } from "jotai";
import React from "react";
import { resolveIncidentTypeIcon, statusClass } from "~/lib/config";
import { incidentFocusRequestAtom } from "~/lib/store";
import { useIncidents } from "~/lib/use-incidents";

const statusBadgeFallbackClass =
	"bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-neutral-800 dark:text-zinc-300 dark:border-neutral-700";

export function IncidentsPanel() {
	const { items: incidents, isLoading, resolve } = useIncidents({ limit: 100 });
	const requestIncidentFocus = useSetAtom(incidentFocusRequestAtom);
	const [openOnly, setOpenOnly] = React.useState(false);

	const openIncidents = React.useMemo(
		() =>
			incidents.filter(
				(incident) => !["resolved", "cancelled"].includes(incident.status),
			),
		[incidents],
	);

	const scopedIncidents = openOnly ? openIncidents : incidents;

	if (isLoading) {
		return (
			<div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
				<div className="i-solar-refresh-bold-duotone size-10 text-zinc-300 dark:text-neutral-600 animate-spin" />
				<p className="text-sm text-secondary">Loading incidents...</p>
			</div>
		);
	}

	if (incidents.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
				<div className="i-solar-folder-path-connect-linear size-10 text-zinc-300 dark:text-neutral-600" />
				<div>
					<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
						No incidents yet
					</p>
					<p className="text-xs text-secondary mt-0.5">
						Click on the map to report one
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<p className="text-xs text-secondary">
					{openIncidents.length} / {incidents.length} active
				</p>
				<label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
					<span className="text-xs text-secondary">Open only</span>
					<input
						type="checkbox"
						checked={openOnly}
						onChange={(e) => setOpenOnly(e.target.checked)}
						className="sr-only"
					/>
					<span
						className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
							openOnly ? "bg-emerald-600" : "bg-zinc-300 dark:bg-neutral-700"
						}`}
					>
						<span
							className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
								openOnly ? "translate-x-4.5" : "translate-x-0.5"
							}`}
						/>
					</span>
				</label>
			</div>

			{/* List */}
			{scopedIncidents.length === 0 ? (
				<p className="py-6 text-center text-xs text-secondary">
					No open incidents
				</p>
			) : (
				<ul className="rounded-xl border border-zinc-200 dark:border-neutral-800 overflow-hidden divide-y divide-zinc-200 dark:divide-neutral-800">
					{scopedIncidents.map((incident) => {
						const config = resolveIncidentTypeIcon(incident.type.code);
						const badgeClass =
							statusClass[incident.status] ?? statusBadgeFallbackClass;
						const isResolvable = !["resolved", "cancelled"].includes(
							incident.status,
						);

						return (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<li
								key={incident.id}
								className="group flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-900 hover:bg-zinc-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
								onClick={() =>
									requestIncidentFocus({
										incidentId: incident.id,
										requestId: Date.now(),
									})
								}
							>
								<span
									className={`shrink-0 inline-flex size-6 items-center justify-center rounded-full ${config.color}`}
								>
									<span className={`${config.icon} size-3.5`} />
								</span>

								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-1.5">
										<span
											className={`inline-flex rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${badgeClass}`}
										>
											{incident.status.replace("_", " ")}
										</span>
										<span className="text-[11px] text-zinc-400 dark:text-zinc-500">
											#{incident.id}
										</span>
									</div>
									{incident.description && (
										<p className="mt-0.5 text-[11px] text-secondary truncate">
											{incident.description}
										</p>
									)}
								</div>

								{isResolvable && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											resolve.mutate({ id: incident.id, status: "resolved" });
										}}
										disabled={resolve.isPending}
										className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
									>
										Resolve
									</button>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
